/*
 * =============================================================
 * AlertaCheia: dispositivo de borda (ESP32)
 * =============================================================
 * O que este programa faz:
 *  1. Mede a distância até a água com o sensor ultrassônico HC-SR04
 *     a cada 1 segundo e converte em nível (nivel = altura - distancia).
 *  2. Classifica o nível em NORMAL, ATENCAO, ALERTA ou CRITICO.
 *  3. Atua NO PRÓPRIO DISPOSITIVO (sem depender da internet):
 *     acende o LED da faixa e toca o buzzer em ALERTA e CRITICO.
 *  4. Mostra no display OLED: nível, faixa, alarme e conexão WiFi/MQTT.
 *  5. Envia os dados ao ThingSpeak via MQTT a cada 20 s e recebe
 *     comandos remotos pelo campo 4 do canal.
 *
 * Botões:
 *  - REDE (azul): troca o modo de rede para a demonstração:
 *      normal -> MQTT cortado -> WiFi cortado -> normal
 *  - SILENCIAR (vermelho): cala o buzzer até a faixa mudar.
 *
 * Comandos remotos (valor escrito no field4 do canal):
 *  - 1         testa o alarme por 10 s
 *  - 2         silencia o alarme
 *  - 0         volta tudo ao padrão
 *  - 201..400  novo limite do nível CRITICO, em cm
 *
 * Sem delay(): cada tarefa roda quando chega a hora dela (millis()).
 * =============================================================
 */
#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PubSubClient.h>

// Credenciais ficam no secrets.h (fora do Git). Se ele não existir,
// usa o modelo: compila, mas o MQTT não autentica.
#if __has_include("secrets.h")
#include "secrets.h"
#else
#warning "secrets.h nao encontrado: usando secrets.example.h (o MQTT nao vai autenticar)"
#include "secrets.example.h"
#endif

// ------------------------------------------------------------
// Pinos (iguais aos do diagram.json)
// ------------------------------------------------------------
const int PINO_TRIG = 5;
const int PINO_ECHO = 18;
const int PINO_LED_NORMAL = 25;   // verde
const int PINO_LED_ATENCAO = 26;  // amarelo
const int PINO_LED_ALERTA = 27;   // laranja
const int PINO_LED_CRITICO = 14;  // vermelho
const int PINO_BUZZER = 13;
const int PINO_BOTAO_REDE = 32;
const int PINO_BOTAO_SILENCIAR = 33;

// ------------------------------------------------------------
// Faixas de alerta, em cm.
// MANTENHA EM SINCRONIA com dados/config_alertas.json
// (os mesmos limites usados pelo Python e pelo app web).
// Valores provisórios, a validar com fonte pública.
// ------------------------------------------------------------
const float LIMITE_ATENCAO_CM = 150.0;
const float LIMITE_ALERTA_CM = 200.0;
const float LIMITE_CRITICO_PADRAO_CM = 250.0;
float limiteCriticoCm = LIMITE_CRITICO_PADRAO_CM;  // pode mudar por comando remoto

// ------------------------------------------------------------
// Sensor
// ------------------------------------------------------------
const float ALTURA_INSTALACAO_CM = 400.0;          // sensor a 4 m do fundo do canal
const float VELOCIDADE_SOM_CM_POR_US = 0.0343;     // 343 m/s
const unsigned long TEMPO_LIMITE_ECO_US = 30000;   // sem eco em 30 ms = leitura falhou

// ------------------------------------------------------------
// Tempos (em milissegundos)
// ------------------------------------------------------------
const unsigned long INTERVALO_AMOSTRA_MS = 1000;       // amostragem constante de 1 s
const unsigned long INTERVALO_PUBLICACAO_MS = 20000;   // ThingSpeak gratuito: mínimo de 15 s
const unsigned long INTERVALO_DISPLAY_MS = 250;
const unsigned long INTERVALO_TENTATIVA_WIFI_MS = 10000;
const unsigned long INTERVALO_TENTATIVA_MQTT_MS = 5000;
const unsigned long DURACAO_TESTE_ALARME_MS = 10000;
const unsigned long ANTIRREPIQUE_MS = 50;              // ignora o "tremido" do botão
const unsigned int FREQUENCIA_BUZZER_HZ = 2000;

// ------------------------------------------------------------
// Estados possíveis (o número é o que vai para o ThingSpeak)
// ------------------------------------------------------------
enum Faixa { NORMAL = 0, ATENCAO = 1, ALERTA = 2, CRITICO = 3 };
const char* NOMES_FAIXA[] = {"NORMAL", "ATENCAO", "ALERTA", "CRITICO"};

enum EstadoAlarme {
  ALARME_DESLIGADO = 0,
  ALARME_INTERMITENTE = 1,  // ALERTA: bipe curto a cada segundo
  ALARME_CONTINUO = 2,      // CRITICO: bipe quase contínuo
  ALARME_SILENCIADO = 3,    // botão ou comando remoto calou o buzzer
  ALARME_TESTE = 4          // teste remoto
};
const char* NOMES_ALARME[] = {"DESLIGADO", "INTERMITENTE", "CONTINUO", "SILENCIADO", "TESTE REMOTO"};

enum ModoRede { REDE_NORMAL = 0, REDE_SEM_MQTT = 1, REDE_SEM_WIFI = 2 };
const char* NOMES_MODO_REDE[] = {"normal", "MQTT cortado", "WiFi cortado"};

// ------------------------------------------------------------
// Objetos
// ------------------------------------------------------------
Adafruit_SSD1306 tela(128, 64, &Wire, -1);
WiFiClient clienteRede;
PubSubClient mqtt(clienteRede);

const char* SERVIDOR_MQTT = "mqtt3.thingspeak.com";
const int PORTA_MQTT = 1883;
char topicoPublicacao[64];  // channels/<ID>/publish
char topicoComando[64];     // channels/<ID>/subscribe/fields/field4

// ------------------------------------------------------------
// Variáveis de estado
// ------------------------------------------------------------
float nivelCm = 0;
bool leituraValida = false;
Faixa faixaAtual = NORMAL;

EstadoAlarme estadoAlarme = ALARME_DESLIGADO;
bool silenciado = false;
Faixa faixaQuandoSilenciou = NORMAL;
bool testeAtivo = false;
unsigned long inicioTeste = 0;
bool buzzerTocando = false;

ModoRede modoRede = REDE_NORMAL;
unsigned long ultimaAmostra = 0;
unsigned long ultimaPublicacao = 0;
unsigned long ultimoDisplay = 0;
unsigned long ultimaTentativaWifi = 0;
unsigned long ultimaTentativaMqtt = 0;
bool jaTentouMqtt = false;

unsigned long totalEnvios = 0;
char ultimoComando[24] = "-";

// Botão com antirrepique: só conta o clique depois de 50 ms estável.
struct Botao {
  int pino;
  bool estadoEstavel;    // HIGH = solto (INPUT_PULLUP), LOW = apertado
  bool ultimaLeitura;
  unsigned long mudouEm;
};
Botao botaoRede = {PINO_BOTAO_REDE, HIGH, HIGH, 0};
Botao botaoSilenciar = {PINO_BOTAO_SILENCIAR, HIGH, HIGH, 0};

// ============================================================
// Sensor e classificação
// ============================================================

/** Mede o nível da água. Devolve false se o sensor não respondeu. */
bool lerNivelCm(float &nivel) {
  // Pulso de 10 µs no TRIG dispara a medição
  digitalWrite(PINO_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PINO_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PINO_TRIG, LOW);

  // Quanto tempo o ECHO fica em HIGH = tempo de ida e volta do som
  unsigned long duracaoUs = pulseIn(PINO_ECHO, HIGH, TEMPO_LIMITE_ECO_US);
  if (duracaoUs == 0) return false;

  float distanciaCm = duracaoUs * VELOCIDADE_SOM_CM_POR_US / 2.0;  // /2: só a ida
  nivel = constrain(ALTURA_INSTALACAO_CM - distanciaCm, 0.0, ALTURA_INSTALACAO_CM);
  return true;
}

/** Mesma regra do Python e do app web: a última faixa cujo limite é <= nível. */
Faixa classificarFaixa(float nivel) {
  if (nivel >= limiteCriticoCm) return CRITICO;
  if (nivel >= LIMITE_ALERTA_CM) return ALERTA;
  if (nivel >= LIMITE_ATENCAO_CM) return ATENCAO;
  return NORMAL;
}

// ============================================================
// Atuação local (LEDs e buzzer)
// ============================================================

/** Decide o estado do alarme a partir da faixa, do silêncio e do teste. */
void atualizarEstadoAlarme(unsigned long agora) {
  if (testeAtivo && agora - inicioTeste >= DURACAO_TESTE_ALARME_MS) testeAtivo = false;

  // Mudou de faixa depois de silenciar: o alarme volta a valer.
  if (silenciado && faixaAtual != faixaQuandoSilenciou) silenciado = false;

  if (testeAtivo) estadoAlarme = ALARME_TESTE;
  else if (faixaAtual < ALERTA) estadoAlarme = ALARME_DESLIGADO;
  else if (silenciado) estadoAlarme = ALARME_SILENCIADO;
  else if (faixaAtual == CRITICO) estadoAlarme = ALARME_CONTINUO;
  else estadoAlarme = ALARME_INTERMITENTE;
}

/** Acende só o LED da faixa atual (no teste, acende todos). */
void atualizarLeds() {
  digitalWrite(PINO_LED_NORMAL, testeAtivo || faixaAtual == NORMAL);
  digitalWrite(PINO_LED_ATENCAO, testeAtivo || faixaAtual == ATENCAO);
  digitalWrite(PINO_LED_ALERTA, testeAtivo || faixaAtual == ALERTA);
  digitalWrite(PINO_LED_CRITICO, testeAtivo || faixaAtual == CRITICO);
}

/** Liga e desliga o buzzer no ritmo do alarme, sem travar o programa. */
void atualizarBuzzer(unsigned long agora) {
  bool deveTocar = false;
  if (estadoAlarme == ALARME_INTERMITENTE) deveTocar = (agora % 1000) < 200;  // 0,2 s a cada 1 s
  if (estadoAlarme == ALARME_CONTINUO || estadoAlarme == ALARME_TESTE) deveTocar = (agora % 500) < 400;

  // Só chama tone()/noTone() quando muda, não a cada volta do loop.
  if (deveTocar != buzzerTocando) {
    if (deveTocar) tone(PINO_BUZZER, FREQUENCIA_BUZZER_HZ);
    else noTone(PINO_BUZZER);
    buzzerTocando = deveTocar;
  }
}

void silenciarAlarme(const char* origem) {
  if (faixaAtual >= ALERTA) {
    silenciado = true;
    faixaQuandoSilenciou = faixaAtual;
    Serial.printf("[alarme] silenciado (%s)\r\n", origem);
  }
}

// ============================================================
// Display OLED (128x64; sem acentos, a fonte não tem)
// ============================================================
void atualizarDisplay() {
  tela.clearDisplay();
  tela.setTextColor(SSD1306_WHITE);

  tela.setTextSize(1);
  tela.setCursor(0, 0);
  tela.print("AlertaCheia  Humaita");

  // Valor medido em letra grande
  tela.setTextSize(2);
  tela.setCursor(0, 10);
  if (leituraValida) tela.printf("%.1f cm", nivelCm);
  else tela.print("SEM ECO");

  tela.setTextSize(1);
  tela.setCursor(0, 28);
  tela.printf("Faixa: %s", NOMES_FAIXA[faixaAtual]);
  tela.setCursor(0, 37);
  tela.printf("Alarme: %s", NOMES_ALARME[estadoAlarme]);

  // Situação da conexão
  bool wifiOk = WiFi.status() == WL_CONNECTED;
  tela.setCursor(0, 46);
  tela.printf("WiFi:%s  MQTT:%s", wifiOk ? "OK" : "--", mqtt.connected() ? "OK" : "--");

  // Linha de informação extra
  tela.setCursor(0, 55);
  if (modoRede != REDE_NORMAL) tela.printf("Teste: %s", NOMES_MODO_REDE[modoRede]);
  else if (limiteCriticoCm != LIMITE_CRITICO_PADRAO_CM) tela.printf("Critico remoto:%.0fcm", limiteCriticoCm);
  else tela.printf("Envios: %lu", totalEnvios);

  tela.display();
}

// ============================================================
// Rede: WiFi e MQTT (ThingSpeak)
// ============================================================
void conectarWifi(unsigned long agora) {
  Serial.println("[wifi] conectando...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_SENHA, WIFI_CANAL);  // não espera: o loop segue rodando
  ultimaTentativaWifi = agora;
}

/** Tenta reconectar o WiFi de tempos em tempos, sem travar o loop. */
void gerenciarWifi(unsigned long agora) {
  if (modoRede == REDE_SEM_WIFI || WiFi.status() == WL_CONNECTED) return;
  if (agora - ultimaTentativaWifi >= INTERVALO_TENTATIVA_WIFI_MS) conectarWifi(agora);
}

/** Mantém o MQTT conectado e processa as mensagens recebidas. */
void gerenciarMqtt(unsigned long agora) {
  if (modoRede != REDE_NORMAL || WiFi.status() != WL_CONNECTED) return;

  if (mqtt.connected()) {
    mqtt.loop();  // recebe comandos e mantém a conexão viva
    return;
  }
  if (jaTentouMqtt && agora - ultimaTentativaMqtt < INTERVALO_TENTATIVA_MQTT_MS) return;

  jaTentouMqtt = true;
  ultimaTentativaMqtt = agora;
  Serial.println("[mqtt] conectando ao ThingSpeak...");
  if (mqtt.connect(MQTT_CLIENT_ID, MQTT_USUARIO, MQTT_SENHA)) {
    mqtt.subscribe(topicoComando);
    Serial.printf("[mqtt] conectado; ouvindo %s\r\n", topicoComando);
  } else {
    // 5 = não autorizado (confira o secrets.h); -2 = sem resposta do servidor
    Serial.printf("[mqtt] falhou, codigo %d\r\n", mqtt.state());
  }
}

/** Publica nível, faixa e estado do alarme nos campos 1, 2 e 3 do canal. */
void publicarDados() {
  if (!mqtt.connected() || !leituraValida) return;
  char conteudo[80];
  snprintf(conteudo, sizeof(conteudo), "field1=%.1f&field2=%d&field3=%d", nivelCm, faixaAtual, estadoAlarme);
  if (mqtt.publish(topicoPublicacao, conteudo)) {
    totalEnvios++;
    Serial.printf("[mqtt] enviado: %s\r\n", conteudo);
  } else {
    Serial.println("[mqtt] falha ao enviar");
  }
}

/** Executa um comando remoto recebido pelo field4. */
void executarComando(int valor) {
  if (valor == 0) {
    limiteCriticoCm = LIMITE_CRITICO_PADRAO_CM;
    testeAtivo = false;
    silenciado = false;
    snprintf(ultimoComando, sizeof(ultimoComando), "0: padrao");
  } else if (valor == 1) {
    testeAtivo = true;
    inicioTeste = millis();
    snprintf(ultimoComando, sizeof(ultimoComando), "1: teste alarme");
  } else if (valor == 2) {
    silenciarAlarme("remoto");
    snprintf(ultimoComando, sizeof(ultimoComando), "2: silenciar");
  } else if (valor > LIMITE_ALERTA_CM && valor <= ALTURA_INSTALACAO_CM) {
    limiteCriticoCm = valor;  // precisa ficar acima do limite de ALERTA
    snprintf(ultimoComando, sizeof(ultimoComando), "critico=%d cm", valor);
  } else {
    snprintf(ultimoComando, sizeof(ultimoComando), "invalido: %d", valor);
  }
  Serial.printf("[comando] %s\r\n", ultimoComando);
}

/** Chamada pela biblioteca MQTT quando chega mensagem no tópico assinado. */
void aoReceberMensagem(char* topico, byte* conteudo, unsigned int tamanho) {
  // O conteúdo não termina com '\0': copiamos para um texto seguro.
  char texto[16];
  unsigned int n = min(tamanho, (unsigned int)(sizeof(texto) - 1));
  memcpy(texto, conteudo, n);
  texto[n] = '\0';

  // Atualizações do canal sem o field4 chegam vazias: não são comandos.
  if (n == 0 || strcmp(texto, "null") == 0) return;
  executarComando(atoi(texto));
}

/** Botão REDE: normal -> MQTT cortado -> WiFi cortado -> normal. */
void alternarModoRede(unsigned long agora) {
  modoRede = (ModoRede)((modoRede + 1) % 3);
  Serial.printf("[rede] modo de teste: %s\r\n", NOMES_MODO_REDE[modoRede]);

  if (modoRede == REDE_SEM_MQTT) {
    mqtt.disconnect();
  } else if (modoRede == REDE_SEM_WIFI) {
    mqtt.disconnect();
    WiFi.disconnect(true);  // desliga o rádio WiFi
  } else {
    jaTentouMqtt = false;   // volta ao normal: reconecta já
    conectarWifi(agora);
  }
}

// ============================================================
// Botões
// ============================================================
/** Devolve true uma única vez a cada clique (com antirrepique). */
bool foiPressionado(Botao &botao, unsigned long agora) {
  bool leitura = digitalRead(botao.pino);
  if (leitura != botao.ultimaLeitura) {
    botao.ultimaLeitura = leitura;
    botao.mudouEm = agora;
  }
  if (agora - botao.mudouEm >= ANTIRREPIQUE_MS && leitura != botao.estadoEstavel) {
    botao.estadoEstavel = leitura;
    return leitura == LOW;  // LOW = apertado (INPUT_PULLUP)
  }
  return false;
}

// ============================================================
// Programa principal
// ============================================================
void setup() {
  Serial.begin(115200);

  pinMode(PINO_TRIG, OUTPUT);
  pinMode(PINO_ECHO, INPUT);
  pinMode(PINO_LED_NORMAL, OUTPUT);
  pinMode(PINO_LED_ATENCAO, OUTPUT);
  pinMode(PINO_LED_ALERTA, OUTPUT);
  pinMode(PINO_LED_CRITICO, OUTPUT);
  pinMode(PINO_BUZZER, OUTPUT);
  pinMode(PINO_BOTAO_REDE, INPUT_PULLUP);
  pinMode(PINO_BOTAO_SILENCIAR, INPUT_PULLUP);

  if (!tela.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("[display] nao encontrado");
  }

  snprintf(topicoPublicacao, sizeof(topicoPublicacao), "channels/%s/publish", TS_CANAL_ID);
  snprintf(topicoComando, sizeof(topicoComando), "channels/%s/subscribe/fields/field4", TS_CANAL_ID);
  mqtt.setServer(SERVIDOR_MQTT, PORTA_MQTT);
  mqtt.setCallback(aoReceberMensagem);
  mqtt.setSocketTimeout(3);  // não trava o loop por muito tempo se o servidor não responder

  unsigned long agora = millis();
  conectarWifi(agora);
  ultimaAmostra = agora - INTERVALO_AMOSTRA_MS;  // primeira amostra já na 1ª volta
  ultimaPublicacao = agora;
  Serial.println("AlertaCheia iniciado.");
}

void loop() {
  unsigned long agora = millis();

  // 1) Botões
  if (foiPressionado(botaoRede, agora)) alternarModoRede(agora);
  if (foiPressionado(botaoSilenciar, agora)) silenciarAlarme("botao");

  // 2) Amostragem constante a cada 1 s.
  //    "+=" mantém o ritmo fixo (1000, 2000, 3000 ms...) sem acumular atraso.
  if (agora - ultimaAmostra >= INTERVALO_AMOSTRA_MS) {
    ultimaAmostra += INTERVALO_AMOSTRA_MS;
    if (agora - ultimaAmostra >= INTERVALO_AMOSTRA_MS) ultimaAmostra = agora;  // ficou muito para trás: realinha

    float novoNivel;
    leituraValida = lerNivelCm(novoNivel);
    if (leituraValida) {
      nivelCm = novoNivel;
      faixaAtual = classificarFaixa(nivelCm);
    }
    Serial.printf("[amostra] %lu ms | nivel %.1f cm | faixa %s | alarme %s | rede %s\r\n",
                  agora, nivelCm, NOMES_FAIXA[faixaAtual], NOMES_ALARME[estadoAlarme],
                  NOMES_MODO_REDE[modoRede]);
  }

  // 3) Atuação local: funciona com ou sem internet
  atualizarEstadoAlarme(agora);
  atualizarLeds();
  atualizarBuzzer(agora);

  // 4) Rede
  gerenciarWifi(agora);
  gerenciarMqtt(agora);
  if (agora - ultimaPublicacao >= INTERVALO_PUBLICACAO_MS) {
    ultimaPublicacao = agora;
    publicarDados();
  }

  // 5) Display
  if (agora - ultimoDisplay >= INTERVALO_DISPLAY_MS) {
    ultimoDisplay = agora;
    atualizarDisplay();
  }
}
