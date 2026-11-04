# Changelog

Registro de cada etapa do AlertaCheia, da mais recente para a mais antiga.
Cada entrada tem um **summary** (título) e uma **description** (o que foi feito, por quê, como testar, decisões e pendências).
A partir da Etapa 7, cada etapa também entra na `main` por um Pull Request com o mesmo texto.

---

## Etapa 1: núcleo de dados e estrutura do repositório

**Data:** 04/11/2026 · **Disciplinas:** todas (base compartilhada)

### O que foi feito
- Criei a estrutura de pastas, com uma por disciplina (`python/`, `matematica/`, `edge/`, `web/`, `docs/`) e a pasta `dados/` como núcleo compartilhado.
- Criei o `.gitignore`, que já bloqueia `edge/src/secrets.h` (credenciais), `.pio/`, `node_modules/` e caches do Python.
- Escrevi o `README.md` com a Ficha da CitizenTech: problema, cidadão, indicador de impacto, ODS 11/13/9/3 e o que cada parte faz.
- Documentei o **contrato de dados**: `{ timestamp, nivel_cm, estacao }`.
- Criei `AI.md` (declaração de uso de IA), `PROMPTS.md` (prompts na íntegra e em ordem) e `INTEGRANTES.md`.
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

### Commits
| Hash | Mensagem |
|---|---|
| `7b949fd` | feat: cria estrutura de pastas do projeto e .gitignore |
| `fadafb9` | docs: adiciona Ficha da CitizenTech e contrato de dados no README |
| `7c8cf19` | docs: adiciona declaração de IA, registro de prompts e integrantes |
| `c505ad2` | feat: adiciona script que gera a série simulada de níveis de água |
| `03f62b2` | feat: adiciona série simulada de níveis e configuração das faixas de alerta |
