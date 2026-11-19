# Roteiro do pitch: AlertaCheia em 3 minutos

**Disciplina:** Storytelling & Inspiração Empreendedora (prof. André Maluf)
**Formato:** vídeo de até 3 min no YouTube, como **não listado**, com a sua imagem e a sua voz, mostrando as entregas funcionando.
**Mensagem central:** *em 2024 a água chegou antes do aviso; com o AlertaCheia, o aviso chega antes da água.*

| Critério da rubrica | Peso | Onde aparece no roteiro |
|---|---|---|
| Cidadão e problema claros | 2,0 | 0:00 a 0:50 |
| Solução e proposta de valor | 2,0 | 0:50 a 1:20 |
| Integração: entregas que viram um produto | **2,5** | 1:20 a 2:20 (sensor, nuvem, app e Python funcionando juntos) |
| Narrativa: gancho, jornada e encerramento | 2,0 | Abre e fecha com a mesma frase sobre 2024 |
| Comunicação e uso do tempo | 1,5 | Cerca de 340 palavras (uns 2 min e meio de fala), sobra tempo para as transições |

---

## 0:00 a 0:20 · Gancho

**Tela:** você na câmera, enquadrado do peito para cima.

> "Em 2024, a enchente entrou na minha casa, no Humaitá, e levou o primeiro andar inteiro. O que mais me marcou não foi a água. Foi perceber que ela estava chegando quando já não dava mais tempo de fazer nada."

## 0:20 a 0:50 · O herói

**Tela:** você na câmera, depois um slide simples: *"Morador do Humaitá: precisa de TEMPO"*.

> "Quem mora numa área alagável não precisa de mais um número de nível do rio. Precisa de tempo. Tempo para subir os móveis, separar documentos e remédios, desligar a luz e sair com calma. Hoje, o aviso chega tarde, ou nem chega. E sem internet, que é o que costuma cair numa enchente, a pessoa fica no escuro."

## 0:50 a 1:20 · A virada

**Tela:** slide com o fluxo *Sensor (ESP32) → ThingSpeak (MQTT) → App e Python*.

> "Por isso eu criei o AlertaCheia. Um sensor mede o nível da água a cada segundo. O sistema calcula a velocidade com que ela sobe e responde à única pergunta que importa: quanto tempo eu tenho? O aviso aparece no próprio local, com luz e alarme, mesmo sem internet, e no celular do morador."

## 1:20 a 2:20 · A prova (gravação de tela, as entregas funcionando)

| Tempo | Tela | Fala |
|---|---|---|
| 1:20 | **Wokwi:** mudar o sensor para 230, 190 e 140 cm. LED amarelo, depois laranja com bipe, depois vermelho | "Este é o dispositivo: um ESP32 com sensor ultrassônico. Quando a água sobe, ele muda de faixa sozinho: atenção, alerta, crítico, com alarme local." |
| 1:35 | **Display** do Wokwi e depois o **ThingSpeak** com o gráfico recebendo o ponto | "Os dados vão pela internet, via MQTT, e ficam guardados na nuvem. Eu também consigo acionar o alarme à distância." |
| 1:50 | **App web:** simulação em 05/11 às 01:10. Mostrar o cartão ALERTA e "1 h 46 min" | "No app, o morador lê em letras grandes: Alerta. Leve seus bens para o alto. Nível crítico em cerca de uma hora e quarenta e seis minutos." |
| 2:05 | **App:** registrar uma ocorrência e mostrar a lista atualizando | "E pode avisar os vizinhos sobre a rua que já alagou." |
| 2:12 | **Terminal:** `python python/src/menu.py`, opção 1 | "Por trás, um programa em Python valida os dados e faz a mesma conta. A velocidade de subida, que é a derivada do nível, é o que permite prever." |

## 2:20 a 2:45 · O impacto

**Tela:** slide com **"110 minutos"** bem grande e os ícones dos ODS 11, 13, 9 e 3.

> "Nos dados simulados, o primeiro alerta veio uma hora e cinquenta minutos antes de a água chegar ao nível crítico. Esse é o nosso indicador: minutos de antecedência. Cento e dez minutos para salvar o que importa. Isso contribui para cidades mais resilientes, adaptação ao clima, infraestrutura acessível e saúde: ODS 11, 13, 9 e 3."

## 2:45 a 3:00 · Equipe e encerramento

**Tela:** você na câmera, com o nome e o RM na tela.

> "Eu sou o Luis Gabriel Stuermer. Em 2024, a água chegou antes do aviso. Com o AlertaCheia, o aviso chega antes da água."

---

## Checklist de gravação

- [ ] Gravar as telas antes: Wokwi rodando, ThingSpeak, app web e terminal. Use a Xbox Game Bar (**Win + Alt + R**) ou o OBS.
- [ ] Gravar as falas na câmera: gancho, herói, virada e encerramento. A rubrica exige que você **apareça com imagem e voz**.
- [ ] Montar o vídeo (ex.: Clipchamp, que já vem no Windows) e cortar para **no máximo 3:00**. Saber cortar faz parte da nota.
- [ ] Os números ditos têm que bater com a tela: **1 h 46 min** às 01:10 e **110 min** de antecedência.
- [ ] Dizer que os dados são **simulados**. É honesto e é exigido nas regras da GS.
- [ ] Publicar no YouTube como **Não listado** e testar o link numa **janela anônima**.
- [ ] Enviar o link no Teams da disciplina, com **nome completo e RM**, até 23h55.
