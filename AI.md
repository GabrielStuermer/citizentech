# Uso de Inteligência Artificial

**Projeto:** AlertaCheia (Global Solution FIAP 2026.2, CitizenTech)
**Autor:** Luis Gabriel Pinheiro Stuermer
**Declaração feita a pedido do professor Sandro.**

## Ferramenta

- **Claude** (Anthropic), usado dentro do VS Code como ferramenta de apoio ao desenvolvimento.

## O que foi feito por mim

- Escolha do problema e do bairro (Humaitá), a partir da minha experiência na enchente de 2024.
- Definição do escopo da solução, do cidadão beneficiado e do indicador de impacto (minutos de antecedência do alerta).
- Decisões de tecnologia e de prioridade: Python, React + Vite, ESP32 + ThingSpeak e a ordem das etapas.
- Revisão, execução e teste de cada parte antes de aceitá-la.
- Organização e envio dos commits pelo GitHub Desktop.
- Atividades fora do código: contas e canal do ThingSpeak, simulação no Wokwi, gravação do vídeo e o pitch.

## O que foi feito com apoio da IA

Sempre a partir das minhas instruções e com a minha revisão:

| Parte | Apoio da IA |
|---|---|
| Núcleo de dados | Script que gera a série **simulada** de níveis e o arquivo de faixas de alerta |
| Python | Código dos módulos de leitura, faixas, análise e menu, e os testes com pytest |
| Aplicação web | Código dos componentes, hooks, serviços e estilos, e os testes com Vitest |
| Documentação | Rascunhos dos READMEs e do CHANGELOG |

## Cuidados adotados

- **Sem dados pessoais reais:** os níveis de água são simulados e estão identificados como tal.
- **Sem valores oficiais inventados:** os limites das faixas são provisórios e estão marcados "a validar com fonte pública".
- **Sem segredos no repositório:** as credenciais do ESP32 ficam em `edge/src/secrets.h`, fora do Git.

## Próximos passos

A intenção, combinada com o professor, é substituir aos poucos as partes geradas pela IA por versões escritas por mim, deixando a IA só para tarefas repetitivas. Este arquivo será atualizado a cada mudança, para refletir sempre como o projeto está de fato.
