# AlertaCheia: Edge Computing & Computer Systems

Dispositivo IoT do **AlertaCheia**, simulado no **Wokwi** com **ESP32**.

O dispositivo:
- mede o nível da água;
- mostra a situação em um display;
- toca o alarme **no próprio local**, mesmo sem internet;
- troca dados com o **ThingSpeak** via **MQTT**.

## Integrantes

| Nome completo | RM |
|---|---|
| Luis Gabriel Pinheiro Stuermer | [preencher] |

## Contexto

No bairro **Humaitá (Porto Alegre)**, o aviso da subida da água costuma chegar tarde demais para o morador proteger seus bens e sair em segurança.

O dispositivo fica instalado acima de um canal ou bueiro e mede a distância até a água. Ele converte essa distância em nível e decide **sozinho, na borda**, se é hora de alertar. O alarme local funciona mesmo que a internet caia, que é justamente o que costuma acontecer numa enchente.

Pela internet, os dados vão para o ThingSpeak, onde ficam guardados e aparecem em gráficos. De lá também saem os comandos remotos para o dispositivo.

Os limites das faixas são os mesmos de [`dados/config_alertas.json`](../dados/config_alertas.json), usados pelo Python e pelo app web. São **valores provisórios, a validar com fonte pública**.

## Arquivos

| Arquivo | O que é |
|---|---|
| [`src/main.cpp`](src/main.cpp) | Código-fonte (C++ com framework Arduino) |
| [`src/secrets.example.h`](src/secrets.example.h) | Modelo das credenciais. O `secrets.h` de verdade fica fora do Git |
| [`diagram.json`](diagram.json) | Circuito da simulação no Wokwi |
| [`wokwi.toml`](wokwi.toml) | Diz ao Wokwi onde está o firmware compilado |
| [`platformio.ini`](platformio.ini) | Placa, framework e bibliotecas (PlatformIO) |
| [`scripts/sem_mapa.py`](scripts/sem_mapa.py) | Ajuste de compilação: evita o erro do linker quando o caminho da pasta tem acento (ex.: "Área de Trabalho") |
| [`roteiro-video.md`](roteiro-video.md) | Passo a passo do vídeo de demonstração |

## Circuito

| Componente | Função | Pinos do ESP32 |
|---|---|---|
| Sensor ultrassônico HC-SR04 | Mede a distância até a água | TRIG 5, ECHO 18 |
| Display OLED SSD1306 (I2C) | Interface local | SDA 21, SCL 22 |
| LED verde | Faixa Normal | 25 (com resistor de 220 Ω) |
| LED amarelo | Faixa Atenção | 26 (com resistor de 220 Ω) |
| LED laranja | Faixa Alerta | 27 (com resistor de 220 Ω) |
| LED vermelho | Faixa Crítico | 14 (com resistor de 220 Ω) |
| Buzzer | Alarme sonoro | 13 |
| Botão azul **Rede** | Simula a queda da conexão (para a demonstração) | 32 |
| Botão vermelho **Silenciar** | Cala o alarme | 33 |

**Conversão:** `nível = 400 cm (altura de instalação) − distância medida`. No Wokwi, clique no sensor e arraste a régua de distância. Por exemplo, distância 320 cm dá nível 80 cm (Normal), e distância 140 cm dá nível 260 cm (Crítico).

## Como funciona

| Tarefa | Quando acontece |
|---|---|
| Ler o sensor e classificar a faixa | A cada **1 s**, controlado por `millis()` e sem `delay()`. O relógio avança em passos fixos, então a amostragem não acumula atraso |
| Atualizar LEDs e buzzer | A cada volta do programa, **sem depender da rede** |
| Atualizar o display | A cada 0,25 s |
| Enviar ao ThingSpeak | A cada **20 s**. O plano gratuito aceita no máximo uma atualização a cada 15 s |
| Reconectar WiFi e MQTT | Tentativas a cada 10 s (WiFi) e 5 s (MQTT), sem travar o resto |

### Faixas e alarme (lógica na borda)

| Nível | Faixa | LED | Buzzer |
|---|---|---|---|
| abaixo de 150 cm | NORMAL | verde | desligado |
| 150 cm ou mais | ATENCAO | amarelo | desligado |
| 200 cm ou mais | ALERTA | laranja | bipe curto a cada segundo |
| 250 cm ou mais | CRITICO | vermelho | bipe quase contínuo |

O botão **Silenciar** cala o buzzer até a água mudar de faixa. Se o nível sobe de Alerta para Crítico, o alarme volta a tocar.

## Usando a tela local

```
AlertaCheia  Humaita
201.8 cm
Faixa: ALERTA
Alarme: INTERMITENTE
WiFi:OK  MQTT:OK
Envios: 12
```

| Linha | Significado |
|---|---|
| 1 | Nome do dispositivo e bairro |
| 2 | **Nível medido**, em letra grande. `SEM ECO` indica que o sensor não respondeu |
| 3 | Faixa atual |
| 4 | **Estado do atuador:** DESLIGADO, INTERMITENTE, CONTINUO, SILENCIADO ou TESTE REMOTO |
| 5 | **Conexão:** `OK` conectado, `--` desconectado |
| 6 | Quantidade de envios ao ThingSpeak. Durante a demonstração de queda, mostra `Teste: MQTT cortado` ou `Teste: WiFi cortado` |

**Botão Rede**, para demonstrar a desconexão: cada clique avança um modo.

1. **MQTT cortado:** o WiFi continua, o MQTT cai e o display mostra `WiFi:OK  MQTT:--`.
2. **WiFi cortado:** o rádio é desligado e o display mostra `WiFi:--  MQTT:--`.
3. **Normal:** reconecta tudo.

Em todos os modos, LEDs e buzzer continuam funcionando.

## Plataforma: ThingSpeak

| Item | Valor |
|---|---|
| Canal | **AlertaCheia Humaitá**, Channel ID **3586259** |
| Broker MQTT | `mqtt3.thingspeak.com`, porta `1883` |
| Publicação | `channels/<ID>/publish` |
| Assinatura (comandos) | `channels/<ID>/subscribe/fields/field4` |
| Credenciais | Dispositivo MQTT do ThingSpeak (Client ID, Username, Password), guardadas em `src/secrets.h`, **fora do repositório** |

### Campos do canal

| Campo | Nome | Quem escreve | Conteúdo |
|---|---|---|---|
| field1 | `nivel_cm` | ESP32 | Nível da água, em cm |
| field2 | `faixa` | ESP32 | 0 Normal, 1 Atenção, 2 Alerta, 3 Crítico |
| field3 | `alarme` | ESP32 | 0 desligado, 1 intermitente, 2 contínuo, 3 silenciado, 4 teste remoto |
| field4 | `comando` | Usuário (remoto) | Comando para o dispositivo (tabela abaixo) |

**Persistência e dashboard:** cada envio vira uma linha no canal, e o ThingSpeak guarda o histórico e mostra um gráfico por campo na aba *Private View*. O app web do projeto ([`web/`](../web/)) também pode ler este canal (módulo opcional `leiturasFonte.js`).

### Comandos remotos (field4)

| Valor | Efeito no dispositivo |
|---|---|
| `1` | Testa o alarme: todos os LEDs e o buzzer por 10 s |
| `2` | Silencia o alarme |
| `0` | Volta tudo ao padrão (limite crítico de 250 cm, sem teste) |
| `201` a `400` | **Configuração remota:** novo limite do nível crítico, em cm. Precisa ficar acima do limite de Alerta (200) |

Para enviar um comando, abra no navegador o endereço abaixo, trocando `<WRITE_API_KEY>` pela chave de escrita do canal (*API Keys*):

```
https://api.thingspeak.com/update?api_key=<WRITE_API_KEY>&field4=1
```

O ThingSpeak repassa o valor por MQTT, e o display e o Serial Monitor mostram a reação. Esse endereço também conta no limite de uma atualização a cada 15 s.

## Como rodar no VS Code

Pré-requisitos: extensões **PlatformIO IDE** e **Wokwi Simulator** instaladas.

1. **Abra a pasta `edge/`** no VS Code (*File > Open Folder…*), não a raiz do repositório. O PlatformIO e o Wokwi procuram os arquivos de configuração na pasta aberta.
2. **Credenciais:** copie `src/secrets.example.h` para `src/secrets.h` e preencha com os dados do canal e do dispositivo MQTT.
3. **Compile:** clique no **✓ (Build)** na barra azul do PlatformIO, no rodapé do VS Code.
4. **Licença do Wokwi**, só na primeira vez: `F1` → **Wokwi: Request a New License** → faça login no navegador → aceite.
5. **Simule:** `F1` → **Wokwi: Start Simulator**. Abra o `diagram.json` para ver o circuito.

O Serial Monitor do simulador mostra cada amostra (`[amostra] ... nivel 201.8 cm | faixa ALERTA`), os envios e os comandos recebidos.

## Limitações

- Os limites das faixas são provisórios. Se mudarem, atualize também as constantes no `main.cpp`.
- Os comandos remotos não são guardados se o dispositivo estiver desconectado na hora do envio.
- `pulseIn` espera o eco por até 30 ms a cada leitura. Isso não afeta a cadência de 1 s.
