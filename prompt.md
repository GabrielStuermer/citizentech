# Prompts da conversa de 19/11/2026

**Projeto:** AlertaCheia (Global Solution FIAP 2026.2, CitizenTech)
**Autor:** Luis Gabriel Pinheiro Stuermer
**Ferramenta:** Claude (Anthropic), no VS Code

Registro dos pedidos feitos à IA nesta conversa, na ordem, com o que foi feito em cada um.
A declaração geral de uso de IA está no [AI.md](AI.md).

---

## 1. Leitura do projeto

> leia todo o projeto antes de qualquer coisa

**O que foi feito:**
- Leitura de todos os arquivos: documentação, `dados/`, Python, Edge (ESP32), web e `docs/`.
- Os testes foram rodados: 40 no Python e 56 na web, todos passando.
- Foram apontadas inconsistências na documentação, sem alterar nada:
  - o relatório de Experiência ainda marcava os requisitos do ESP32 como *Planejado*;
  - havia um `---9` perdido no CHANGELOG.

## 2. Comentários no código

> ok, agora, comente o que cada parte de cada código faz não precisa ser textão

**O que foi feito:**
- Comentários curtos em todos os arquivos de código: uma linha no topo de cada arquivo e uma acima de cada função ou bloco.
- Notas na mesma linha só onde o motivo não é óbvio.
- Arquivos comentados:
  - **Python:** os módulos de `src/`, os testes e os arquivos de configuração;
  - **Edge:** `main.cpp`, organizado em seções (pinos, sensor, alarme, display, rede, botões, setup/loop), e os arquivos de configuração;
  - **Web:** domínio, serviços, hooks, seções, componentes, testes, CSS e configuração.
- **Verificação:**
  - comparação com o último commit: só comentários mudaram, nenhuma linha de código;
  - testes do Python e da web passando, build da web funcionando e firmware do ESP32 compilando.

## 3. Teste completo

> ok, testa tudo para garantirmos que não tem nenhum erro no projeto

**O que foi testado:**

| Parte | Teste | Resultado |
|---|---|---|
| Python | 40 testes automatizados | Passaram |
| Python | Menu em todas as opções, com os dados simulados | Números iguais aos documentados: 110 min de antecedência; às 01:10, "1 h 46 min, por volta de 02:56" |
| Python | Casos de erro: data inválida, data fora do período, arquivo inexistente, opção inválida, CSV com erros | Todos tratados com mensagem; 6 linhas inválidas apontadas no arquivo de exemplo |
| Python | `gerar_dados.py` | Gera um CSV idêntico ao versionado |
| Edge | Compilação no PlatformIO | Compilou |
| Edge | Leitura do canal do ThingSpeak | Canal responde com as leituras do ESP32 |
| Web | 56 testes automatizados e build | Passaram |
| Web | API do CRUD: criar, editar, excluir | Funciona, com 404 depois de excluir |
| Web | No navegador, modo simulado | Simulação às 01:10 correta, indicador de 1 h 50 min, CRUD completo pela tela, validação, confirmação de exclusão |
| Web | No navegador, modo ThingSpeak | Mostra os dados reais e o aviso de sensor parado há mais de 30 min |
| Web | Sem internet e com a API fora do ar | Envio bloqueado; lista salva no aparelho aparece com aviso |
| Web | Larguras de 360, 768 e 1280 px | Sem rolagem horizontal e sem erros no console |

**Observação encontrada:** na primeira visita, sem lista salva e com a API fora do ar, o botão "Enviar aviso" fica ativo. Ao enviar, aparece a mensagem de erro de conexão, mas a RN15 pede que o envio fique bloqueado. Ainda não foi corrigido.

**Limite do teste:** a simulação no Wokwi não foi rodada nesta conversa, porque precisa da extensão do VS Code. O teste no simulador foi feito pelo autor em 18/11/2026 (ver CHANGELOG).

## 4. Este registro

> ok, falta só o prompt.md desta conversa

**O que foi feito:** criação deste arquivo.
