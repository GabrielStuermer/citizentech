# Registro de prompts

Todos os prompts usados com a IA (Claude Code, Claude Opus 5.5) neste projeto, **em ordem**, copiados exatamente como foram enviados.
Este arquivo é atualizado ao final de cada etapa.

| # | Data | Etapa | Resumo |
|---|---|---|---|
| 01 | 04/11/2026 | Planejamento + Etapa 1 | Prompt inicial com o contexto completo do projeto; início da Etapa 1 (repositório e núcleo de dados) |
| 02 | 04/11/2026 | Fechamento da Etapa 1 | Pedido de summary + description ao fim de cada etapa; escolha de CHANGELOG.md + Pull Request por etapa |
| 03 | 04/11/2026 | Configuração do GitHub | Confirmação de que a conta logada no `gh` é a mesma (nome de usuário alterado) |
| 04 | 04/11/2026 | Etapa 2 | Edge passa para o fim; início da Etapa 2 (Python) |

---

## Prompt 01 (04/11/2026): planejamento geral e Etapa 1

~~~~text
Global Solution FIAP 2026.2 (CitizenTech)

## PAPEL

Você é engenheirode software sênior em um projeto acadêmico da FIAP (Engenharia de Software). Trabalhe em etapas, explique o que está fazendo em linguagem simples e peça minha confirmação antes de decisões grandes. Eu preciso conseguir explicar cada linha do código, então prefira código simples, legível e comentado a soluções "espertas".

## CONTEXTO

Sou o Luis Gabriel Pinheiro Stuermer (GitHub: GabrielStuermer), trabalhando **sozinho**. A Global Solution 2026.2 pede **uma única CitizenTech** que atravessa várias disciplinas: um protótipo pequeno que funciona e resolve um problema real de Porto Alegre.

- **Nome provisório:** AlertaCheia (podemos trocar)
- **Cidade e bairro:** Porto Alegre, bairro Humaitá
- **Cidadão beneficiado:** morador de Humaitá em área alagável que precisa de tempo para salvar bens e sair em segurança
- **Problema, em uma frase:** o aviso sobre a subida da água chega tarde demais para o morador proteger seus pertences e sua segurança
- **Como funciona:** o sistema recebe o nível da água ao longo do tempo, calcula a velocidade de subida, estima o tempo até o nível crítico e mostra o alerta
- **Indicador de impacto:** minutos de antecedência do alerta antes do nível crítico
- **ODS conectados:** 11 (cidades e comunidades sustentáveis), 13 (ação contra a mudança do clima), 9 (indústria, inovação e infraestrutura), 3 (saúde e bem-estar). Explicar como cada um é atendido.
- **Gancho pessoal:** em 2024 perdi o primeiro andar da minha casa na enchente. Essa é a história do pitch.

## ESCOPO DESTA SESSÃO

Tudo é feito no VS Code, em Python, C++ (Arduino/ESP32), JavaScript e Markdown. O que depende do navegador (contas e canal do ThingSpeak, simulação no site do Wokwi caso a extensão não sirva, gravação de vídeo) eu faço por fora, e você me orienta passo a passo:

1. Núcleo de dados compartilhado
2. Python (Computational Thinking)
3. Matemática (Differentiated Problem Solving), em Python
4. Aplicação web (Web Development + Front-end Design)
5. Relatório de Experiência (Software & Total Experience Design), em Markdown
6. Roteiro do pitch, em Markdown
7. Edge Computing (ESP32 simulado no Wokwi, em C++ com framework Arduino, enviando dados ao ThingSpeak via MQTT)

## REGRAS DA GS (valem para tudo)

- Entrega final em **19/11 às 23h55**, via Teams. Hoje é 04/11.
- Simples primeiro: uma função que funciona vale mais que dez pela metade.
- Pensar em quem vai usar: letras legíveis, bom contraste, linguagem simples, telas pequenas.
- **Nada de dados pessoais reais.** Só dados simulados ou públicos, sempre dizendo de onde vieram.
- A solução deve continuar útil mesmo com infraestrutura ruim (ex.: funcionar sem internet quando possível).
- **IA como copiloto:** permitida, mas registrar tudo.
  - `PROMPTS.md`: todos os prompts que eu usar, em ordem. Atualize este arquivo ao final de cada etapa.
  - `AI.md`: declaração de como a IA foi usada no projeto.
- **Git:** repositório com **pelo menos 15 commits significativos**, pequenos e frequentes desde o primeiro dia. Use mensagens no padrão `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, em português e descritivas. Faça um commit ao final de cada subetapa.
- O `INTEGRANTES.md` precisa de nome completo e RM (deixe o RM como `[preencher]`, eu completo).

## ESTRUTURA DO REPOSITÓRIO

Crie esta estrutura (um repositório só, com uma pasta para cada parte):

```
alerta-cheia/
├── README.md              # começa com a Ficha da CitizenTech
├── AI.md
├── PROMPTS.md
├── INTEGRANTES.md
├── .gitignore
├── dados/
│   ├── niveis_simulados.csv
│   └── config_alertas.json
├── python/                # Computational Thinking
│   ├── requirements.txt
│   ├── README.md
│   └── src/
├── matematica/            # Differentiated Problem Solving
│   ├── requirements.txt
│   ├── modelo.py
│   └── relatorio/
├── edge/                  # Edge Computing & Computer Systems
│   ├── platformio.ini
│   ├── diagram.json
│   ├── wokwi.toml
│   ├── README.md
│   ├── roteiro-video.md
│   └── src/
│       ├── main.cpp
│       └── secrets.example.h
├── web/                   # Web Development + Front-end Design
│   ├── README.md
│   └── (projeto do front)
└── docs/
    ├── experiencia/       # RF, RNF, RN, backlog
    └── pitch/             # roteiro
```

O `README.md` da raiz deve começar com a **Ficha da CitizenTech** preenchida: nome, cidade e bairro, cidadão beneficiado, problema em uma frase, como funciona, o que cada parte faz, link do repositório (`[preencher]`), indicador de impacto e ODS conectados.

## CONTRATO DE DADOS (núcleo compartilhado)

Todas as partes usam o mesmo formato. Cada leitura:

```json
{ "timestamp": "2026-11-04T12:00:00", "nivel_cm": 182.5, "estacao": "Humaitá" }
```

- `dados/niveis_simulados.csv`: série temporal **simulada** (documentar no README que é simulada), com cenário normal, subida lenta e subida rápida, em intervalos regulares.
- `dados/config_alertas.json`: limites das faixas **configuráveis**: `normal`, `atencao`, `alerta`, `critico` (em cm). Use valores provisórios e marque como "a validar com fonte pública". Não afirme valores oficiais sem fonte.

## ETAPA 1: Núcleo de dados e repositório

1. Criar a estrutura de pastas, `.gitignore`, `README.md` com a Ficha, `AI.md`, `PROMPTS.md`, `INTEGRANTES.md`.
2. Gerar `niveis_simulados.csv` com um script em Python (guardar o script em `python/src/gerar_dados.py`) e `config_alertas.json`.
3. Commits separados para estrutura, documentação e dados.

## ETAPA 2: Python (Computational Thinking with Python)

**Objetivo:** armazenar, manipular e processar dados para responder: *"Como os dados podem ajudar a compreender este problema da cidade e apoiar uma decisão ou ação?"*

Entregáveis: código-fonte, dados usados, `requirements.txt`, e README com (a) qual problema da cidade foi escolhido, (b) o que a solução faz, (c) seção **Quickstart** de como executar.

Implementar em `python/src/` (módulos pequenos e separados):
- leitura do CSV e validação dos dados (tratar linhas inválidas);
- classificação de cada leitura em faixa de alerta, usando `config_alertas.json`;
- cálculo da velocidade de subida (cm por hora) e da **estimativa de minutos até o nível crítico**;
- um menu simples de terminal (ou CLI) que mostra o resumo, o status atual e o tempo estimado;
- funções com nomes claros, docstrings e alguns testes simples com `pytest`.

Avaliação: lógica computacional 50%, estrutura dos dados e do repositório 25%, documentação 25%.

## ETAPA 3: Matemática (Differentiated Problem Solving), em Python

**Objetivo:** usar limites, derivadas e integrais para modelar o fenômeno e subsidiar o protótipo. Entregáveis: arquivos `.py` com implementações e gráficos, mais um **relatório técnico em PDF** (descrição do problema, modelo, análises de cálculo, interpretação dos resultados).

Em `matematica/modelo.py` (usar `numpy`, `sympy` e `matplotlib`):
- modelar o nível da água `h(t)` com uma função simples e justificável (ex.: logística ou polinomial ajustada aos dados simulados);
- **limite:** comportamento de `h(t)` quando `t → ∞` (nível de saturação) e continuidade nos pontos relevantes;
- **derivada:** `h'(t)` como velocidade de subida, e pontos críticos e de maior velocidade (máximo de `h'(t)`);
- **integral:** volume ou chuva acumulada em um intervalo, calculada simbólica e numericamente, comparando os dois;
- gráficos claros e legendados, salvos em `matematica/relatorio/`;
- conectar o resultado ao app: a derivada alimenta a estimativa de tempo até o nível crítico.

Gere o relatório em Markdown em `matematica/relatorio/relatorio.md`. Eu converto para PDF no final, então deixe-o pronto para exportar.

## ETAPA 4: Aplicação web (Web Development + Front-end Design)

**Antes de começar, me pergunte:** React + Vite ou HTML/CSS/JS puro. Se eu não responder, use **React + Vite**. Também pergunte qual é a "API externa" exigida pelo professor para o CRUD. Enquanto isso não for definido, use um `json-server` local como API provisória e isole o acesso à API em um único módulo, para trocar depois sem mexer no resto.

**Requisitos obrigatórios:**
- **Pelo menos 8 componentes reutilizáveis**, com responsabilidades claras e separação entre apresentação, regras de negócio e acesso a dados. Sugestão: `Cabecalho`, `CartaoNivelAtual`, `IndicadorFaixa`, `GraficoHistorico`, `ListaOcorrencias`, `FormularioOcorrencia`, `Botao`, `MensagemEstado`, `Rodape`.
- **CRUD completo** (criar, consultar, atualizar, excluir) de **ocorrências de alagamento** (ex.: rua, descrição, gravidade, data) via API externa, mantendo a tela coerente com cada operação.
- **Controle de estados:** carregando, sucesso, erro e ausência de dados, sempre com mensagem clara.
- **Validação de entradas** e tratamento de falhas da API, com orientação de como prosseguir.
- **Tela principal:** nível atual, faixa de alerta com cor **e** texto/ícone (nunca só cor), minutos estimados até o nível crítico e histórico.
- **Responsivo** (celular, tablet e computador) sem cortes, sobreposições ou rolagem horizontal.
- **Acessível:** HTML semântico, contraste legível, navegação por teclado com foco visível, campos com `label`, alternativas textuais.
- Linguagem simples, letras grandes, pensando em um morador sob estresse.
- Mostrar que funciona sem conexão sempre que possível (dados em cache local, aviso claro quando estiver desatualizado).

Os dois critérios (Front e Web) pedem repositório privado com acesso ao professor, 15+ commits e um ZIP do projeto. Por isso, comite bem desde o início.

## ETAPA 5: Experiência (Software & Total Experience Design)

Em `docs/experiencia/`, montar um **relatório único** com: capa, nomes de todos os integrantes, índice, justificativa, escopo da ideia (problema e solução), lista de **Requisitos Funcionais (RF)**, **Requisitos Não Funcionais (RNF)** e **Regras de Negócio (RN)**, **Backlog do Produto** ordenado por prioridade e agrupado em **Épicos**, e conclusão. Enumerar os itens (RF01, RNF01, RN01...) e ligar os RF às telas do app.

Atenção: os slides dessa disciplina ainda tinham campos em branco, então trate o formato como provisório e eu ajusto depois com o professor.

## ETAPA 6: Roteiro do pitch

Em `docs/pitch/roteiro.md`, um roteiro de **até 3 minutos** seguindo esta linha de tempo, com texto falado e o que aparece na tela em cada trecho:

- 0:00 gancho (cena, pergunta ou dado sobre o problema)
- 0:20 o herói (quem é o cidadão e o que ele enfrenta)
- 0:50 a virada (a CitizenTech e como funciona)
- 1:20 a prova (as entregas funcionando juntas)
- 2:20 o impacto (o que muda, como medir, ODS)
- 2:45 a equipe e um encerramento que fique na memória

Contar a jornada do cidadão, não a lista de tarefas. Na parte da prova, inclua a demo do sensor: o display do ESP32 mudando de faixa e o app atualizando junto.

## ETAPA 7: Edge Computing & Computer Systems (ESP32 + ThingSpeak)

**Objetivo:** criar um dispositivo IoT que lê um sensor, mostra o estado localmente, atua no ambiente e troca dados pela internet via MQTT. É a disciplina de maior peso na GS, então trate com prioridade.

**Ferramentas:** escrever o código em C++ (framework Arduino) com **PlatformIO** no VS Code e simular com a **extensão do Wokwi para VS Code** (usa `diagram.json` e `wokwi.toml`). Se a extensão exigir licença ou não funcionar, o código continua em `edge/` e eu rodo a simulação no site wokwi.com; me avise para ajustar. **Plataforma de back end escolhida: ThingSpeak.**

**Requisitos da disciplina (pontuação do professor):**

Simulação do dispositivo no Wokwi com ESP32 (75 pts):
- **Leitura de pelo menos um sensor (15 pts):** sensor ultrassônico HC-SR04 medindo a distância até a água, convertida em `nivel_cm` (altura de instalação menos a distância). Se der problema, usar um potenciômetro simulando o nível. A amostragem deve ser **precisa e constante** (ex.: a cada 1 s controlado com `millis()`, sem `delay()` bloqueante), porque os dados serão processados depois.
- **Atuação com lógica na borda (10 pts):** LED (e/ou buzzer) acionado **no próprio ESP32** conforme a faixa de alerta (normal, atenção, alerta, crítico). Use as mesmas faixas de `dados/config_alertas.json`, definidas como constantes no código com um comentário avisando para manter em sincronia.
- **Interface local com display (15 pts):** OLED SSD1306 ou LCD I2C mostrando o **valor atual da medida**, o **status do atuador** e o **status de conexão WiFi/MQTT**.
- **Envio e recepção via MQTT (35 pts):**
  - ThingSpeak como back end.
  - Persistência dos dados no canal.
  - **Recepção** de valores de configuração para atuação e/ou **acionamento remoto** do atuador.
  - Dashboard com as informações do dispositivo (ver "Decisão pendente" abaixo).

**Detalhes do ThingSpeak [a validar na documentação atual]:**
- Broker `mqtt3.thingspeak.com`, porta 1883, com credenciais de dispositivo MQTT (Client ID, Username, Password) criadas no ThingSpeak.
- Publicar em `channels/<ID>/publish` e assinar `channels/<ID>/subscribe/fields/field<N>`.
- A conta gratuita limita a frequência de atualização (cerca de 15 s entre publicações). Então: **amostrar localmente a cada 1 s e publicar a cada 15 s ou mais.**
- WiFi no Wokwi: rede `Wokwi-GUEST`, sem senha.
- Sugestão de campos do canal: `field1` nivel_cm, `field2` faixa (0 a 3), `field3` estado do atuador, `field4` comando remoto (forçar teste de alarme ou alterar limiar). O ESP32 assina o campo de comando e reage a ele.

**Segredos:** nunca versionar credenciais. Crie `secrets.h` (no `.gitignore`) e `secrets.example.h` com placeholders.

**Decisão pendente:** o dashboard em NodeRed só é exigido se não for feito na disciplina de Front-end. Vou confirmar com o professor se o app web lendo o ThingSpeak vale como dashboard. Até lá, **não crie NodeRed**; apenas deixe o app web preparado com um módulo opcional que lê a API de leitura do ThingSpeak.

**Vídeo (15 pts):** gravação de tela do simulador. Crie `edge/roteiro-video.md` com o passo a passo: alterar o valor do sensor, mostrar o display local e o dashboard atualizando, e mostrar o display indicando **desconexão de WiFi e de MQTT**. O código deve ter uma forma de provocar essa desconexão para a demo (ex.: botão que derruba a conexão) [a validar como fazer no Wokwi]. A gravação em si é comigo.

**README do Edge (10 pts)**, em `edge/README.md`: nomes dos integrantes, código-fonte, arquivo de diagrama da simulação (`diagram.json`), contextualização do projeto, instruções de uso da tela local e especificação da plataforma (canal ThingSpeak: ID, campos e descrição de cada um, sem expor chaves).

**Passos que dependem de mim (navegador):** criar a conta, o canal e o dispositivo MQTT no ThingSpeak, rodar a simulação no Wokwi e gravar o vídeo. Quando chegar nesses pontos, me diga exatamente o que clicar e preencher.

## COMO TRABALHAR

1. Comece pela **Etapa 1** e só avance depois de eu confirmar. Ordem sugerida, por peso e dependência: 1, 7 (Edge), 2, 3, 4, 5, 6.
2. Ao fim de cada etapa: rode o que for executável, mostre o resultado, faça os commits e atualize o `PROMPTS.md`.
3. Se algo estiver ambíguo, pergunte em vez de supor.
4. Não invente dados reais, valores oficiais nem fontes. Se faltar informação, marque como `[a validar]`.
5. Ao final de cada etapa, me diga em duas ou três frases o que foi feito e qual é o próximo passo.

Pode começar pela Etapa 1.
~~~~

**Resultado:** Etapa 1 concluída: estrutura de pastas, `.gitignore`, README com a Ficha da CitizenTech, `AI.md`, `PROMPTS.md`, `INTEGRANTES.md`, script `python/src/gerar_dados.py`, `dados/niveis_simulados.csv` (simulado) e `dados/config_alertas.json` (valores provisórios).

---

## Prompt 02 (04/11/2026): summary e description por etapa

~~~~text
vamos fazer assim, a cada etapa que concluirmos, vamos fazer um summary e uma description para mantermos as boas práticas
~~~~

**Pergunta da IA:** onde registrar o summary + description de cada etapa (CHANGELOG.md, Pull Request por etapa, tag anotada ou só no chat)?
**Minha resposta (seleção):** CHANGELOG.md + Pull Request por etapa.

**Resultado:** criado o `CHANGELOG.md` com a entrada da Etapa 1. A partir da Etapa 7, cada etapa é desenvolvida em uma branch própria e entra na `main` por um Pull Request com o mesmo summary e description.

---

## Prompt 03 (04/11/2026): conta do GitHub

~~~~text
BielStuermer é a mesma conta, apenas alterei para Gabriel, preciso mudar algo?
~~~~

**Resultado:** a IA conferiu pela API que o login atual é `GabrielStuermer`, com permissão de admin, e que o repositório já estava privado. Nada precisou mudar. Foi feito o push da `main` com a Etapa 1.

---

## Prompt 04 (04/11/2026): Edge por último e Etapa 2 (Python)

~~~~text
vamos pular a de edge e deixar por ultimo
~~~~

**Resultado:** nova ordem das etapas: 2, 3, 4, 5, 6, 7 (Edge). Etapa 2 feita na branch `etapa-2-python`: leitura e validação do CSV, classificação em faixas, velocidade de subida por regressão linear, minutos até o crítico, indicador de antecedência (110 min), menu de terminal, CSV de exemplo com erros, 40 testes com pytest e README com Quickstart.
