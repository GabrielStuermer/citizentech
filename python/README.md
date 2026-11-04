# AlertaCheia: Python (Computational Thinking with Python)

Parte em Python da CitizenTech **AlertaCheia** (Global Solution FIAP 2026.2).
Integrante: Luis Gabriel Pinheiro Stuermer, RM [preencher].

## (a) Problema da cidade

No bairro **Humaitá, em Porto Alegre**, áreas alagáveis podem ser invadidas pela água em poucas horas, como aconteceu na cheia de 2024. O morador costuma saber da subida **tarde demais** para levar seus bens para o alto, desligar a energia e sair com segurança.

**Pergunta da disciplina:** *como os dados podem ajudar a compreender este problema da cidade e apoiar uma decisão ou ação?*

**Nossa resposta:** uma leitura isolada do nível da água diz pouco. Uma **série de leituras ao longo do tempo** mostra **a que velocidade** a água sobe, e com a velocidade dá para estimar **quantos minutos faltam** para o nível crítico. Esse número vira uma decisão concreta para o morador: "tenho cerca de 1 h 46 min, começo a subir os móveis agora".

## (b) O que a solução faz

1. **Lê e valida** as leituras de nível (`timestamp`, `nivel_cm`, `estacao`) de um arquivo CSV. Linhas com problema são ignoradas, com o motivo registrado, e o programa continua.
2. **Classifica** cada leitura em uma faixa de alerta (Normal, Atenção, Alerta, Crítico), usando os limites de [`dados/config_alertas.json`](../dados/config_alertas.json).
3. **Calcula a velocidade de subida** (cm/h) com as leituras da última hora.
4. **Estima os minutos até o nível crítico**, mostrando a conta feita.
5. **Mede o indicador de impacto:** minutos de antecedência entre o primeiro aviso de Alerta e a chegada da água ao nível crítico.
6. Mostra tudo em um **menu de terminal** simples, com a faixa em texto e símbolo (`[ !! ] ALERTA`), nunca só por cor.

### Resultados com os dados simulados

| O quê | Resultado |
|---|---|
| Leituras válidas | 204 (a cada 10 min, de 04/11 00:00 até 05/11 09:50) |
| Primeiro aviso de Alerta | 05/11 às 01:10 (201,8 cm) |
| Estimativa feita naquele momento | chega ao crítico em **1 h 46 min**, por volta de 02:56 |
| Chegada real ao crítico (nos dados) | 05/11 às **03:00** (erro da estimativa: 4 min) |
| **Indicador de impacto** | **110 minutos de antecedência** |

> ⚠️ Os dados são **simulados**, gerados por [`src/gerar_dados.py`](src/gerar_dados.py). Não são medições reais. Os limites das faixas são **provisórios, a validar com fonte pública**.

## (c) Quickstart

Pré-requisito: **Python 3.10 ou superior**. Todos os comandos rodam **a partir da raiz do repositório**.

**1. Rodar o programa.** Ele usa só a biblioteca padrão do Python, então não precisa instalar nada:

```bash
python python/src/menu.py
```

**2. Rodar com o arquivo de exemplo que tem erros**, para ver a validação funcionando:

```bash
python python/src/menu.py --arquivo python/exemplos/niveis_com_erros.csv
```

**3. Rodar os testes**, que precisam do `pytest`:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1          # Windows (PowerShell)
# source .venv/bin/activate         # Linux/macOS
pip install -r python/requirements.txt
python -m pytest python
```

> Se o PowerShell bloquear o `Activate.ps1`, rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` ou chame direto `.venv\Scripts\python -m pytest python`.

**4. (Opcional) Gerar os dados simulados de novo** (sempre sai o mesmo arquivo):

```bash
python python/src/gerar_dados.py
```

### Exemplo de uso

```
 1 - Resumo dos dados
 2 - Status atual
 3 - Tempo estimado até o nível crítico
 4 - Simular outro momento
 5 - Linhas ignoradas na leitura
 0 - Sair
Escolha uma opção: 4
Digite data e hora (ex.: 05/11/2026 01:10) ou Enter para voltar: 05/11/2026 01:10

--- STATUS EM 05/11/2026 01:10 ---
Nível da água: 201.8 cm
Faixa: [ !! ] ALERTA
O que fazer: Risco de alagamento. Leve seus bens para o alto e prepare a saída.
Tendência: subindo (+27.3 cm/h)
Tempo até o nível crítico (250 cm): 1 h 46 min
```

A opção 4 "volta no tempo": mostra o que o sistema diria em qualquer momento da série. Isso serve para ver o alerta acontecendo durante a subida.

---

## Como funciona por dentro

### Estrutura

```
python/
├── requirements.txt        # só pytest (para os testes)
├── pytest.ini              # diz ao pytest onde estão o código e os testes
├── exemplos/
│   └── niveis_com_erros.csv  # CSV com 6 erros de propósito
├── src/
│   ├── gerar_dados.py      # gera dados/niveis_simulados.csv
│   ├── leitura.py          # lê o CSV e valida cada linha
│   ├── faixas.py           # carrega o JSON de faixas e classifica um nível
│   ├── analise.py          # velocidade, minutos até o crítico, resumo, indicador
│   └── menu.py             # menu de terminal (único módulo com print/input)
└── tests/
    ├── test_leitura.py
    ├── test_faixas.py
    └── test_analise.py
```

Cada módulo tem uma responsabilidade. Só o `menu.py` conversa com o usuário, e toda a lógica fica em funções que recebem dados e devolvem resultados. Por isso ela é fácil de testar.

### Estruturas de dados

- **`Leitura`** (dataclass em `leitura.py`): `timestamp` (datetime), `nivel_cm` (float), `estacao` (str).
- **Lista de leituras** ordenada por data/hora: é a série temporal.
- **Faixa** (dicionário): `chave`, `codigo` (0 a 3), `a_partir_de_cm`, `rotulo`, `mensagem`. As faixas ficam em uma lista em ordem crescente de nível.
- **Erros**: lista de textos, cada um com a linha do arquivo e o motivo.

### Regras de validação (`leitura.py`)

| Regra | Exemplo inválido |
|---|---|
| `timestamp` no formato ISO `AAAA-MM-DDTHH:MM:SS` | `05/11/2026 00:40` |
| `nivel_cm` precisa ser número | `erro`, vazio |
| `nivel_cm` entre 0 e 400 cm (alcance do sensor HC-SR04) | `-12.0`, `999` |
| `estacao` não pode ser vazia | vazio |
| Data/hora repetida: fica só a primeira | duas leituras às 01:20 |

Também confere se o cabeçalho tem as três colunas obrigatórias e ordena as leituras por data/hora.

### Velocidade de subida (`analise.py`)

Comparar só as duas últimas leituras faria a velocidade "pular" por causa do ruído do sensor. Por isso o programa pega **as leituras da última hora** e calcula a **reta que melhor passa por elas** (regressão linear pelo método dos mínimos quadrados). A **inclinação** dessa reta é a velocidade em cm/h:

```
inclinação = soma((x − média_x) · (y − média_y)) / soma((x − média_x)²)
x = tempo (horas), y = nível (cm)
```

- Velocidade de pelo menos **+2 cm/h**: *subindo*. De −2 cm/h ou menos: *descendo*. Entre esses valores: *estável*, porque é só o ruído do sensor.
- **Minutos até o crítico** = `(limite crítico − nível atual) / velocidade × 60`.
  - Nível já no crítico: o resultado é 0 ("JÁ ATINGIU").
  - Água estável ou descendo: não há previsão.

### Testes

40 testes com `pytest`, que cobrem:
- os tipos de linha inválida;
- os valores exatamente nos limites das faixas;
- configuração inválida;
- a velocidade em séries com resposta conhecida;
- o tempo até o crítico, inclusive os casos "já atingiu" e "não está subindo";
- um teste de integração que confere os 110 minutos de antecedência no CSV do projeto.

## Limitações conhecidas

- A estimativa supõe que a água continue subindo **no mesmo ritmo**. Se a chuva acelerar, o tempo real será menor. Por isso o programa mostra esse aviso junto da estimativa.
- Os dados e os limites das faixas são simulados e provisórios.
- Este módulo lê um arquivo CSV. A leitura em tempo real vem do sensor (pasta [`edge/`](../edge/)) e do app web (pasta [`web/`](../web/)).
