# AlertaCheia

> Global Solution FIAP 2026.2 (CitizenTech) · Engenharia de Software

## Ficha da CitizenTech

| Campo | Resposta |
|---|---|
| **Nome** | AlertaCheia (nome provisório) |
| **Cidade e bairro** | Porto Alegre (RS), bairro Humaitá |
| **Cidadão beneficiado** | Morador de Humaitá que vive em área alagável e precisa de tempo para salvar seus bens e sair em segurança |
| **Problema, em uma frase** | O aviso sobre a subida da água chega tarde demais para o morador proteger seus pertences e sua segurança. |
| **Como funciona** | O sistema recebe o nível da água ao longo do tempo, calcula a velocidade de subida, estima quanto tempo falta até o nível crítico e mostra o alerta para o morador. |
| **Link do repositório** | [preencher] |
| **Indicador de impacto** | Minutos de antecedência do alerta antes do nível crítico |
| **ODS conectados** | 11, 13, 9 e 3 (detalhes abaixo) |

### O que cada parte faz

| Parte | Pasta | Disciplina | O que faz |
|---|---|---|---|
| Núcleo de dados | [`dados/`](dados/) | Todas | Série de níveis **simulada** e limites das faixas de alerta, no formato único usado por todas as partes |
| Python | [`python/`](python/) | Computational Thinking with Python | Lê e valida os dados, classifica cada leitura na faixa de alerta, calcula a velocidade de subida e estima os minutos até o nível crítico, em um menu de terminal |
| Matemática | [`matematica/`](matematica/) | Differentiated Problem Solving | Modela o nível da água `h(t)` com limites, derivadas e integrais. A derivada `h'(t)` é a velocidade de subida que alimenta a estimativa de tempo |
| Edge | [`edge/`](edge/) | Edge Computing & Computer Systems | ESP32 simulado no Wokwi: mede o nível com sensor ultrassônico, aciona LED/buzzer conforme a faixa, mostra tudo no display e troca dados com o ThingSpeak via MQTT |
| Web | [`web/`](web/) | Web Development + Front-end Design | App para o morador: nível atual, faixa de alerta, minutos até o nível crítico, histórico e cadastro de ocorrências de alagamento |
| Experiência | [`docs/experiencia/`](docs/experiencia/) | Software & Total Experience Design | Requisitos (RF, RNF, RN) e backlog do produto |
| Pitch | [`docs/pitch/`](docs/pitch/) | Todas | Roteiro do pitch de até 3 minutos |

### Indicador de impacto

**Minutos de antecedência do alerta** = momento em que a água atinge o nível **crítico** − momento em que o AlertaCheia emitiu o primeiro aviso de **alerta**.

Quanto maior esse número, mais tempo o morador tem para levar seus bens para o alto, desligar a energia e sair com segurança. Nos testes, o indicador é medido sobre os dados simulados. Em uso real, seria medido em cada evento de cheia.

### ODS conectados

| ODS | Como o AlertaCheia atende |
|---|---|
| **11. Cidades e comunidades sustentáveis** | Torna o bairro mais resiliente a desastres: o aviso antecipado reduz perdas materiais e riscos às pessoas (meta 11.5, redução de perdas causadas por desastres, inclusive os relacionados à água). |
| **13. Ação contra a mudança do clima** | Ajuda a população a se adaptar a eventos climáticos extremos, como a cheia de 2024, com um sistema de alerta precoce (metas 13.1 e 13.3). |
| **9. Indústria, inovação e infraestrutura** | Usa infraestrutura de baixo custo (sensor + ESP32 + MQTT) que pode ser instalada em vários pontos do bairro e continua mostrando o alerta localmente mesmo sem internet (meta 9.1, infraestrutura confiável e resiliente). |
| **3. Saúde e bem-estar** | Com mais tempo, o morador sai antes de ter contato com a água contaminada, o que reduz o risco de ferimentos e de doenças como a leptospirose, além do estresse de ser pego de surpresa (meta 3.d, alerta precoce e gestão de riscos à saúde). |

> Texto oficial das metas: [Objetivos de Desenvolvimento Sustentável, ONU Brasil](https://brasil.un.org/pt-br/sdgs).

---

## Estrutura do repositório

```
├── README.md              # este arquivo (começa com a Ficha da CitizenTech)
├── AI.md                  # declaração de uso de IA
├── PROMPTS.md             # todos os prompts usados, em ordem
├── INTEGRANTES.md         # nome e RM
├── dados/                 # núcleo de dados compartilhado
│   ├── niveis_simulados.csv
│   └── config_alertas.json
├── python/                # Computational Thinking
├── matematica/            # Differentiated Problem Solving
├── edge/                  # Edge Computing (ESP32 + ThingSpeak)
├── web/                   # Web Development + Front-end Design
└── docs/
    ├── experiencia/       # RF, RNF, RN, backlog
    └── pitch/             # roteiro do pitch
```

## Contrato de dados

Todas as partes (Python, Matemática, Edge e Web) usam o **mesmo formato** para cada leitura:

```json
{ "timestamp": "2026-11-04T12:00:00", "nivel_cm": 182.5, "estacao": "Humaitá" }
```

| Campo | Tipo | Significado |
|---|---|---|
| `timestamp` | texto ISO 8601 (`AAAA-MM-DDTHH:MM:SS`) | Data e hora da leitura, horário local |
| `nivel_cm` | número decimal | Altura da água, em centímetros, acima do ponto de referência do sensor. No ESP32: `altura de instalação − distância medida até a água` |
| `estacao` | texto | Nome do ponto de medição |

### `dados/niveis_simulados.csv`

> ⚠️ **Dados SIMULADOS.** Não são medições reais. Foram gerados pelo script [`python/src/gerar_dados.py`](python/src/gerar_dados.py) para testar o sistema. Nenhum dado pessoal é usado.

Uma leitura a cada **10 minutos**, em quatro fases seguidas:

| Fase | Duração | Nível (aprox.) | O que representa |
|---|---|---|---|
| Normal | 12 h | estável em ~80 cm | dia comum |
| Subida lenta | 12 h | 80 → 170 cm (~7,5 cm/h) | chuva contínua |
| Subida rápida | 4 h | 170 → 280 cm (~27,5 cm/h) | cheia |
| Estabilização | 6 h | ~280 → 285 cm | a água para de subir em nível alto |

Para gerar o arquivo de novo (sempre sai igual, porque a semente aleatória é fixa):

```bash
python python/src/gerar_dados.py
```

### `dados/config_alertas.json`

Limites das quatro faixas de alerta, em cm. **Os valores são provisórios e precisam ser validados com fonte pública** (ex.: Defesa Civil de Porto Alegre). Não são valores oficiais.

| Faixa | Código | A partir de |
|---|---|---|
| Normal | 0 | 0 cm |
| Atenção | 1 | 150 cm |
| Alerta | 2 | 200 cm |
| Crítico | 3 | 250 cm |

Se mudar esses valores, mantenha em sincronia as constantes do ESP32 em `edge/src/main.cpp`.

---

## Uso de IA

Este projeto usou IA como copiloto. Veja [AI.md](AI.md) (declaração) e [PROMPTS.md](PROMPTS.md) (todos os prompts, em ordem).

## Integrantes

Veja [INTEGRANTES.md](INTEGRANTES.md).
