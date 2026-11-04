# Declaração de uso de Inteligência Artificial

**Projeto:** AlertaCheia (Global Solution FIAP 2026.2, CitizenTech)
**Autor:** Luis Gabriel Pinheiro Stuermer

## Ferramenta usada

- **Claude Code** (modelo Claude Opus 5.5, da Anthropic), usado dentro do VS Code como copiloto de programação e escrita.

## Como a IA foi usada

| Atividade | Papel da IA | Meu papel |
|---|---|---|
| Planejamento e estrutura do repositório | Propôs a organização de pastas e a ordem das etapas | Defini o problema, o bairro, o escopo e aprovei cada etapa antes de avançar |
| Código (Python, C++, JavaScript) | Gerou rascunhos de código comentado, seguindo os requisitos que eu passei | Revisei, executei e testei cada parte, e pedi código simples para conseguir explicar cada linha |
| Dados | Escreveu o script que gera a série **simulada** de níveis | Defini que nenhum dado real ou pessoal seria usado e que valores oficiais só entram com fonte |
| Documentação (READMEs, relatórios, roteiros) | Redigiu rascunhos em Markdown | Revisei o conteúdo, ajustei o texto e completei as informações pessoais |
| Atividades no navegador (ThingSpeak, Wokwi, vídeo) | Explicou o passo a passo | Executei todas pessoalmente |

## O que **não** foi feito pela IA

- A ideia do projeto e a motivação pessoal (a enchente de 2024 na minha casa).
- As decisões finais de escopo, tecnologia e entrega.
- A criação de contas, canais e credenciais no ThingSpeak, a simulação no Wokwi e a gravação dos vídeos.

## Cuidados adotados

- **Sem dados pessoais reais:** todos os dados de nível da água são simulados e identificados como tal.
- **Sem valores oficiais inventados:** os limites das faixas de alerta são provisórios e estão marcados como "a validar com fonte pública".
- **Sem segredos no repositório:** credenciais ficam em `edge/src/secrets.h`, que está no `.gitignore`.
- **Rastreabilidade:** todos os prompts estão registrados, em ordem, em [PROMPTS.md](PROMPTS.md), e os commits gerados com ajuda da IA trazem a linha `Co-Authored-By`.

> Este documento é atualizado ao final de cada etapa do projeto.
