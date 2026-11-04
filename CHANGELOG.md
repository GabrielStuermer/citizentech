# Changelog

Registro de cada etapa do AlertaCheia, da mais recente para a mais antiga:
o que foi feito, por quê, como testar, decisões e pendências.

---

## Etapa 2: Python (Computational Thinking): leitura, faixas, velocidade e tempo até o crítico

**Data:** 04/11/2026 · **Disciplina:** Computational Thinking with Python

### O que foi feito
- `leitura.py`: lê o CSV e valida cada linha (data/hora ISO, número, faixa física de 0 a 400 cm, estação preenchida). Linhas inválidas são ignoradas com o número da linha e o motivo. Também ordena as leituras e descarta datas repetidas.
- `faixas.py`: carrega os limites de `dados/config_alertas.json`, sem valores fixos no código, confere se as quatro faixas existem e estão em ordem, e classifica cada nível.
- `analise.py` calcula:
  - a velocidade de subida em cm/h, pela reta de mínimos quadrados da última hora, o que suaviza o ruído;
  - a tendência (subindo, estável ou descendo);
  - os minutos até o crítico;
  - o resumo estatístico e a contagem por faixa;
  - o **indicador de impacto** (minutos de antecedência).
- `menu.py`: menu de terminal com resumo, status atual, tempo estimado com a conta explicada, simulação de outro momento e lista das linhas ignoradas. A faixa aparece com texto e símbolo, nunca só por cor.
- `exemplos/niveis_com_erros.csv`: CSV com 6 erros de propósito, para demonstrar a validação.
- 40 testes com `pytest`, incluindo um teste de integração com o CSV do projeto.
- `python/README.md`: problema, solução e Quickstart, respondendo à pergunta da disciplina.

### Por quê
A pergunta da disciplina é como os dados apoiam uma decisão. Uma leitura isolada não diz se há perigo. A **série** de leituras dá a velocidade, e a velocidade dá o **tempo que o morador tem para agir**.

### Como testar
```bash
python python/src/menu.py                                                # dados simulados
python python/src/menu.py --arquivo python/exemplos/niveis_com_erros.csv  # validação
python -m pytest python                                                  # 40 testes (precisa do pytest)
```
Resultados esperados:
- Opção 1: antecedência de **110 min** (Alerta às 01:10, Crítico às 03:00).
- Opção 4 com `05/11/2026 01:10`: estimativa de **1 h 46 min**, ou seja, por volta de 02:56. A chegada real nos dados é às 03:00.
- Com o arquivo de exemplo: 6 linhas ignoradas, cada uma com o motivo.

### Decisões e pendências
- Velocidade calculada com uma janela de 60 min. Abaixo de ±2 cm/h o nível é considerado *estável* (filtro de ruído).
- A estimativa supõe ritmo constante de subida. Essa limitação está documentada e aparece na tela.
- O ambiente virtual fica em `.venv/` na raiz, compartilhado com a Etapa 3 e fora do Git.
- O RM continua `[preencher]`.

---

## Etapa 1: núcleo de dados e estrutura do repositório

**Data:** 04/11/2026 · **Disciplinas:** todas (base compartilhada)

### O que foi feito
- Criei a estrutura de pastas, com uma por disciplina (`python/`, `matematica/`, `edge/`, `web/`, `docs/`) e a pasta `dados/` como núcleo compartilhado.
- Criei o `.gitignore`, que já bloqueia `edge/src/secrets.h` (credenciais), `.pio/`, `node_modules/` e caches do Python.
- Escrevi o `README.md` com a Ficha da CitizenTech: problema, cidadão, indicador de impacto, ODS 11/13/9/3 e o que cada parte faz.
- Documentei o **contrato de dados**: `{ timestamp, nivel_cm, estacao }`.
- Criei o `INTEGRANTES.md`.
- Criei `python/src/gerar_dados.py`, que gera a série **simulada** usando só a biblioteca padrão do Python e uma semente fixa.
- Gerei `dados/niveis_simulados.csv`: 204 leituras a cada 10 min, em quatro fases (normal, subida lenta, subida rápida e estabilização).
- Criei `dados/config_alertas.json` com as faixas Normal (0), Atenção (150), Alerta (200) e Crítico (250 cm). São valores **provisórios, a validar com fonte pública**.

### Por quê
Todas as partes (Python, Matemática, Edge e Web) leem o mesmo formato de dados e as mesmas faixas. Definir isso primeiro evita retrabalho nas próximas etapas.

### Como testar
```bash
python python/src/gerar_dados.py
```
O esperado é: 204 leituras, de 2026-11-04T00:00 até 2026-11-05T09:50, com nível entre 79,0 e 285,0 cm.
Nesses dados, a água entra em Alerta à 01:10 e chega ao Crítico às 03:00, o que dá **110 min de antecedência** (valor de referência do indicador de impacto).

### Decisões e pendências
- Os limites das faixas são provisórios e precisam ser validados com fonte pública.
- Falta preencher o RM no `INTEGRANTES.md` e o link do repositório no README.
- O CSV tem só as 3 colunas do contrato. As fases estão descritas no README.
- A raiz do repositório `citizentech` faz o papel da pasta `alerta-cheia/` da estrutura pedida.
