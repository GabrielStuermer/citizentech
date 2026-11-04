# AlertaCheia: Aplicação web (Web Development + Front-end Design)

App para o morador do **Humaitá (Porto Alegre)** acompanhar o nível da água, entender o alerta e saber **quanto tempo falta até o nível crítico**. Também permite registrar **ocorrências de alagamento** (CRUD).

Integrante: Luis Gabriel Pinheiro Stuermer, RM [preencher].

> ⚠️ As leituras de nível são **simuladas** (arquivo [`dados/niveis_simulados.csv`](../dados/niveis_simulados.csv)). As ocorrências de exemplo são fictícias. Os limites das faixas são provisórios, a validar com fonte pública.

## Quickstart

Pré-requisito: **Node.js 20 ou superior**.

```bash
cd web
npm install
npm run dev:tudo      # sobe a API (porta 3001) e o app (porta 5173) juntos
```

Abra **http://localhost:5173**.

| Comando | O que faz |
|---|---|
| `npm run dev:tudo` | API provisória + app, no mesmo terminal |
| `npm run dev` | Só o app (sem a API, o CRUD mostra o erro e a orientação) |
| `npm run api` | Só a API provisória (json-server em http://localhost:3001) |
| `npm test` | Roda os 56 testes automatizados (Vitest) |
| `npm run build` | Gera a versão de produção em `dist/` |

**Configuração (opcional):** copie `.env.example` para `.env.local` para trocar o endereço da API ou ligar a leitura do ThingSpeak.

---

## O que a tela mostra

| Seção | Conteúdo |
|---|---|
| **Agora** | Faixa de alerta (cor **+ ícone + texto**), o que fazer, **minutos até o nível crítico** com horário previsto, nível atual, tendência e velocidade de subida |
| **Simulação** | "Máquina do tempo" dos dados simulados: arraste ou aperte *Reproduzir* para ver a água subir e o alerta mudar |
| **Histórico** | Gráfico das últimas 12 h com os limites das faixas, resumo em texto, tabela com os dados e o **indicador de impacto** (minutos de antecedência do alerta) |
| **Ocorrências** | Formulário para avisar sobre um alagamento e lista com editar e excluir |
| **Rodapé** | Telefones de emergência clicáveis (199 e 193) e origem dos dados |

## Arquitetura

O código é separado em camadas. Cada uma só conhece a camada de baixo:

```
componentes/  e  secoes/    APRESENTAÇÃO: o que aparece na tela (React)
        │
      hooks/                ESTADO DA TELA: carregando / sucesso / erro / vazio
        │
   dominio/   servicos/     REGRAS DE NEGÓCIO (JS puro)  |  ACESSO A DADOS (API, CSV, cache)
```

```
web/
├── db.exemplo.json          # dados iniciais (fictícios) da API provisória
├── scripts/preparar-db.js   # cria o db.json a partir do exemplo
├── vite.config.js           # libera a leitura da pasta ../dados (fonte única)
└── src/
    ├── dominio/             # regras de negócio, sem React (testadas)
    │   ├── faixas.js        #   classifica o nível nas faixas do config_alertas.json
    │   ├── leituras.js      #   lê e valida o CSV; detecta dado desatualizado
    │   ├── analise.js       #   velocidade (cm/h), minutos até o crítico, antecedência
    │   └── ocorrencias.js   #   validação do formulário de ocorrência
    ├── servicos/            # acesso a dados
    │   ├── ocorrenciasApi.js    # ÚNICO arquivo que conhece a API do CRUD
    │   ├── leiturasFonte.js     # leituras: CSV simulado ou ThingSpeak
    │   └── cache.js             # cópia local para funcionar sem internet
    ├── hooks/               # estado das telas
    ├── componentes/         # 13 componentes reutilizáveis de apresentação
    ├── secoes/              # ligam hooks e componentes (Agora, Histórico, Ocorrências)
    ├── utils/formatacao.js  # números e datas no padrão brasileiro
    └── estilos/global.css   # tokens de cor, layout mobile-first e componentes
```

**Fonte única de dados:** o app lê `dados/config_alertas.json` e `dados/niveis_simulados.csv` direto da pasta compartilhada, os **mesmos arquivos** do Python e do ESP32. As regras de `dominio/` são as mesmas do Python, e um teste confere que os dois chegam aos mesmos números: **110 min** de antecedência e **1 h 46 min** estimados às 01:10.

### Componentes reutilizáveis

| Componente | Responsabilidade |
|---|---|
| `Cabecalho` | Nome do app, bairro, menu de seções e situação da conexão |
| `Rodape` | Telefones de emergência e origem dos dados |
| `Botao` | Botão padrão (primário, secundário, perigo) com estado "carregando" e área de toque de 48 px |
| `Icone` | Ícones em SVG (funcionam sem internet), decorativos ou com rótulo |
| `MensagemEstado` | Mensagem para carregando / sucesso / erro / vazio / aviso, com ação opcional ("Tentar de novo") |
| `IndicadorFaixa` | Selo da faixa: cor + ícone de formato diferente + texto |
| `CartaoNivelAtual` | Situação atual: faixa, o que fazer, tempo até o crítico, nível e tendência |
| `ControleSimulacao` | Régua de tempo e Reproduzir/Pausar dos dados simulados |
| `GraficoHistorico` | Gráfico SVG do nível com limites das faixas, dica ao passar o mouse e tabela de dados |
| `CampoFormulario` | Rótulo + ajuda + erro ligados ao campo (acessibilidade) |
| `FormularioOcorrencia` | Criar e editar ocorrência, com validação |
| `ListaOcorrencias` | Lista de ocorrências ou mensagem de lista vazia |
| `ItemOcorrencia` | Uma ocorrência com Editar e Excluir (com confirmação) |

## CRUD de ocorrências

**API provisória:** [json-server](https://github.com/typicode/json-server), que cria uma API REST a partir do `db.json`. O professor ainda vai definir a API externa definitiva [a definir]. Todo o acesso fica em [`src/servicos/ocorrenciasApi.js`](src/servicos/ocorrenciasApi.js), então trocar de API significa mexer **só nesse arquivo**.

| Operação | Requisição | Na tela |
|---|---|---|
| Consultar | `GET /ocorrencias` | Lista ordenada da mais recente para a mais antiga |
| Criar | `POST /ocorrencias` | Formulário "Avisar sobre um alagamento" |
| Atualizar | `PUT /ocorrencias/:id` | Botão **Editar**: o formulário vem preenchido |
| Excluir | `DELETE /ocorrencias/:id` | Botão **Excluir**: pede confirmação na própria tela |

Campos: `rua` (3 a 100 caracteres), `descricao` (10 a 500), `gravidade` (`baixa`, `media` ou `alta`) e `data` (data e hora, não pode estar no futuro).

### Estados e tratamento de falhas

| Situação | O que o morador vê |
|---|---|
| Carregando | "Carregando…" com ícone animado |
| Sucesso | "Ocorrência registrada / atualizada / excluída." |
| Lista vazia | "Nenhuma ocorrência registrada ainda." e como avisar |
| Campo inválido | Erro em cada campo, um resumo "Faltam corrigir N campos" e foco no primeiro campo errado |
| API fora do ar | "Não foi possível conectar ao servidor…" e orientação de como prosseguir, com botão **Tentar de novo** |
| API demorou (mais de 8 s) | "O servidor demorou demais para responder." |
| Ocorrência já excluída (404) | Mensagem explicando, e a lista é recarregada sozinha |
| Erro do servidor (5xx) | "O servidor teve um problema…" e "aguarde e tente de novo" |

## Funciona sem conexão

- **Leituras simuladas:** vêm dentro do app (o CSV é incluído no build), então funcionam sem internet.
- **Ocorrências:** a última lista recebida fica salva no aparelho (`localStorage`).
  - Se a API não responder, o app mostra essa lista com o aviso *"mostrando a lista salva neste aparelho em DD/MM HH:MM"*.
  - Nesse modo, criar, editar e excluir ficam bloqueados.
  - Quando a internet volta, a lista é buscada de novo sozinha.
- **Leituras do ThingSpeak (opcional):** também usam cache. Sem leitura nova há mais de 30 min, aparece o aviso *"O sensor está sem enviar dados…"*.
- **Situação da conexão:** sempre visível no cabeçalho, como "Conectado" ou "Sem internet".

## Acessibilidade e experiência

- **HTML semântico:** `header`, `nav`, `main`, `section`, `article`, `figure`, `dl`, `fieldset/legend`, `time`. Tem um link "Pular para o conteúdo".
- **Nunca só cor:** cada faixa tem ícone de formato diferente (círculo, triângulo, octógono) e texto. A gravidade aparece escrita.
- **Contraste:** pelo menos 4,5:1 em todos os textos (WCAG AA).
- **Teclado:** tudo é alcançável com Tab, com **foco visível** (anel escuro + halo amarelo). A régua da simulação responde às setas, Home e End.
- **Formulários:** todo campo tem `<label>`. Ajuda e erro ficam ligados ao campo (`aria-describedby`, `aria-invalid`), e o foco vai para o primeiro erro.
- **Leitor de tela:** mensagens com `role="status"` ou `role="alert"`. O gráfico tem resumo em texto e uma **tabela com os dados**.
- **Pensado para quem está sob estresse:**
  - letra base de 18 px e linguagem simples;
  - a ação principal ("o que fazer") vem primeiro;
  - botões com no mínimo 48 px de altura.
- **Animações:** respeita a preferência do sistema por menos movimento (`prefers-reduced-motion`).
- **Responsivo, mobile-first:**
  - testado em 360 px (celular), 768 px (tablet) e 1280 px (computador), sem rolagem horizontal;
  - o gráfico é desenhado na largura real da tela, então o texto não encolhe no celular.

## Módulo opcional: ThingSpeak

[`src/servicos/leiturasFonte.js`](src/servicos/leiturasFonte.js) já sabe ler o canal do ThingSpeak que o ESP32 vai alimentar (Etapa de Edge). Para ligar, coloque no `.env.local`:

```
VITE_FONTE_LEITURAS=thingspeak
VITE_THINGSPEAK_CANAL=<ID do canal>
VITE_THINGSPEAK_CHAVE_LEITURA=<Read API Key>
```

O app passa a buscar `field1` (nível em cm) a cada 60 s. Use só a chave de **leitura**: tudo que começa com `VITE_` fica visível no navegador. O endereço da API de leitura está marcado como [a validar na documentação atual do ThingSpeak].

## Testes

```bash
npm test
```

São 56 testes em três arquivos:
- **`dominio.test.js`:** faixas, validação de leituras, velocidade, tempo até o crítico, validação de ocorrências e a **paridade com o Python**.
- **`ocorrenciasApi.test.js`:** requisições do CRUD e a tradução de cada tipo de erro em mensagem amigável, usando um `fetch` simulado.
- **`componentes.test.jsx`:** o que a pessoa vê e faz na tela, como o texto da faixa, os erros do formulário, o foco no primeiro erro e a confirmação antes de excluir.

## Limitações e próximos passos

- A **API definitiva** ainda não foi definida (hoje é o json-server local).
- Sem internet, o app ainda não guarda ocorrências novas para enviar depois. Hoje ele só bloqueia o envio e explica o motivo.
- O app **em si** só abre sem internet se já estiver aberto. Para abrir offline do zero, o próximo passo seria um *service worker* (PWA).
