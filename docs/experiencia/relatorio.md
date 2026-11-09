# AlertaCheia

## Relatório de Experiência

**Disciplina:** Software & Total Experience Design
**Curso:** Engenharia de Software, FIAP
**Atividade:** Global Solution 2026.2 (CitizenTech)
**Professor:** [preencher]
**Data:** novembro de 2026

### Integrantes

| Nome completo | RM |
|---|---|
| Luis Gabriel Pinheiro Stuermer | [preencher] |

<div style="page-break-after: always;"></div>

## Índice

1. [Justificativa](#1-justificativa)
2. [Escopo da ideia](#2-escopo-da-ideia)
3. [Telas do produto](#3-telas-do-produto)
4. [Requisitos Funcionais (RF)](#4-requisitos-funcionais-rf)
5. [Requisitos Não Funcionais (RNF)](#5-requisitos-não-funcionais-rnf)
6. [Regras de Negócio (RN)](#6-regras-de-negócio-rn)
7. [Backlog do Produto](#7-backlog-do-produto)
8. [Conclusão](#8-conclusão)

<div style="page-break-after: always;"></div>

## 1. Justificativa

Em 2024, a cheia em Porto Alegre levou o primeiro andar da casa do autor deste projeto. Quem passa por isso aprende que o prejuízo depende de quanto tempo sobra entre perceber o perigo e a água chegar. Com tempo, dá para subir móveis, separar documentos e remédios, desligar a energia e sair com calma. Sem tempo, resta sair às pressas.

O problema escolhido é este: **o aviso sobre a subida da água chega tarde demais para o morador proteger seus pertences e sua segurança.**

Saber só o nível da água não resolve, porque um número isolado não diz se há perigo. O que o morador precisa é de uma resposta direta: **quanto tempo eu tenho?** O AlertaCheia foi desenhado em torno dessa pergunta.

O projeto se conecta a quatro Objetivos de Desenvolvimento Sustentável:

| ODS | Relação com o projeto |
|---|---|
| 11. Cidades e comunidades sustentáveis | O aviso antecipado reduz perdas materiais e riscos às pessoas |
| 13. Ação contra a mudança do clima | Alerta precoce como forma de adaptação a eventos extremos |
| 9. Indústria, inovação e infraestrutura | Sensor e ESP32 de baixo custo, com alerta local mesmo sem internet |
| 3. Saúde e bem-estar | Sair antes reduz ferimentos e o contato com água contaminada |

## 2. Escopo da ideia

### Problema

| Item | Descrição |
|---|---|
| **Local** | Bairro Humaitá, Porto Alegre (RS) |
| **Cidadão beneficiado** | Morador de área alagável que precisa de tempo para salvar seus bens e sair em segurança |
| **Situação de uso** | A pessoa está sob estresse, muitas vezes no celular, e a internet pode falhar |

### Solução

O sistema recebe o nível da água ao longo do tempo, calcula a velocidade de subida, estima quanto falta para o nível crítico e mostra o alerta com uma orientação simples.

| Parte | Função | Situação |
|---|---|---|
| Núcleo de dados | Série de níveis **simulada** e limites das faixas, usados por todas as partes | Concluído |
| Programa em Python | Valida os dados, calcula a estimativa e mostra tudo em um menu de terminal | Concluído |
| Aplicação web | Tela do morador: alerta, tempo até o crítico, histórico e ocorrências | Concluída |
| Dispositivo ESP32 (simulado no Wokwi) | Mede o nível, aciona o alarme local e envia os dados ao ThingSpeak | Planejado |

**Indicador de impacto:** minutos de antecedência entre o primeiro aviso de Alerta e a chegada da água ao nível crítico. Nos dados simulados, o resultado é de **110 minutos**.

### Fora do escopo

- Medições reais: os níveis são simulados, e os limites das faixas são provisórios, a validar com fonte pública.
- Previsão de chuva ou modelo hidrológico: a estimativa supõe que a água continue subindo no mesmo ritmo.
- Cadastro de moradores: o sistema não pede nem guarda dados pessoais.
- Substituição dos canais oficiais: o sistema complementa a Defesa Civil, e não a substitui.

## 3. Telas do produto

A aplicação web é uma única página dividida em seções. Neste relatório, cada seção é tratada como uma tela.

| Tela | Conteúdo |
|---|---|
| **Agora** | Faixa de alerta, o que fazer, tempo até o nível crítico, nível e tendência |
| **Simulação** | Régua de tempo para percorrer os dados simulados |
| **Histórico** | Gráfico das últimas 12 horas, tabela de dados e indicador de impacto |
| **Ocorrências** | Formulário de aviso e lista de alagamentos relatados |
| **Cabeçalho** | Nome do app, bairro, menu e situação da conexão |
| **Rodapé** | Telefones de emergência e origem dos dados |
| **Terminal** | Menu do programa em Python |
| **Display ESP32** | Tela local do dispositivo (planejada) |

## 4. Requisitos Funcionais (RF)

**Situação:** *Concluído* (implementado e testado), *Parcial* (implementado, com teste pendente) ou *Planejado* (ainda não implementado).

| ID | Requisito | Tela | Situação |
|---|---|---|---|
| RF01 | Exibir o nível atual da água, em centímetros | Agora; Terminal (opção 2) | Concluído |
| RF02 | Classificar o nível em Normal, Atenção, Alerta ou Crítico e exibir a faixa com cor, ícone e texto | Agora; Terminal (opção 2) | Concluído |
| RF03 | Exibir uma orientação do que fazer em cada faixa | Agora; Terminal (opção 2) | Concluído |
| RF04 | Calcular e exibir a velocidade de subida (cm/h) e a tendência | Agora; Terminal (opção 2) | Concluído |
| RF05 | Estimar o tempo até o nível crítico e o horário previsto de chegada | Agora; Terminal (opção 3) | Concluído |
| RF06 | Validar as leituras recebidas, ignorar as inválidas e informar que isso ocorreu | Agora; Terminal (opção 5) | Concluído |
| RF07 | Exibir o gráfico do nível nas últimas 12 horas, com os limites das faixas | Histórico | Concluído |
| RF08 | Oferecer os dados do gráfico em forma de tabela | Histórico | Concluído |
| RF09 | Calcular e exibir o indicador de impacto (minutos de antecedência) | Histórico; Terminal (opção 1) | Concluído |
| RF10 | Permitir percorrer os dados simulados no tempo, de forma manual ou automática | Simulação; Terminal (opção 4) | Concluído |
| RF11 | Registrar uma ocorrência de alagamento (rua, gravidade, descrição, data e hora) | Ocorrências | Concluído |
| RF12 | Consultar as ocorrências, da mais recente para a mais antiga | Ocorrências | Concluído |
| RF13 | Editar uma ocorrência existente | Ocorrências | Concluído |
| RF14 | Excluir uma ocorrência, com confirmação prévia | Ocorrências | Concluído |
| RF15 | Validar os campos da ocorrência e indicar o erro em cada campo | Ocorrências | Concluído |
| RF16 | Informar o estado de cada operação (carregando, sucesso, erro, sem dados) e orientar como prosseguir em caso de falha | Agora; Histórico; Ocorrências | Concluído |
| RF17 | Exibir se o aparelho está com internet | Cabeçalho | Concluído |
| RF18 | Exibir a última lista salva no aparelho quando a API não responder, informando quando foi salva | Ocorrências | Concluído |
| RF19 | Avisar quando o sensor estiver há mais de 30 minutos sem enviar dados | Agora | Parcial |
| RF20 | Oferecer os telefones de emergência (199 e 193) com um toque | Rodapé | Concluído |
| RF21 | Ler as medições do canal do ThingSpeak | Agora; Histórico | Parcial |
| RF22 | Medir o nível da água com sensor ultrassônico | Display ESP32 | Planejado |
| RF23 | Acionar LED e/ou buzzer no próprio dispositivo, conforme a faixa | Display ESP32 | Planejado |
| RF24 | Exibir no dispositivo o valor medido, o estado do atuador e a conexão WiFi/MQTT | Display ESP32 | Planejado |
| RF25 | Publicar as medições no ThingSpeak via MQTT | Display ESP32 | Planejado |
| RF26 | Receber comando remoto para acionar o alarme ou alterar a configuração | Display ESP32 | Planejado |

RF19 e RF21 dependem do canal real do ThingSpeak, que será criado junto com o dispositivo. O código existe e as regras têm testes automatizados, mas a leitura de um canal real ainda não foi testada.

## 5. Requisitos Não Funcionais (RNF)

| ID | Categoria | Requisito | Como foi verificado |
|---|---|---|---|
| RNF01 | Usabilidade | Funcionar em celular, tablet e computador, sem cortes nem rolagem horizontal | Teste automatizado no navegador em 360, 768 e 1280 px |
| RNF02 | Acessibilidade | Contraste de pelo menos 4,5:1 nos textos e 3:1 nos contornos de controles e nas linhas do gráfico | Cálculo das combinações de cores do app |
| RNF03 | Acessibilidade | Nenhuma informação depende só de cor: faixas e gravidade têm texto, e as faixas têm ícones de formatos diferentes | Teste de componente e inspeção visual |
| RNF04 | Acessibilidade | Todas as funções acessíveis por teclado, com foco visível | Teste automatizado no navegador, na régua da simulação; demais controles usam elementos nativos |
| RNF05 | Acessibilidade | HTML semântico, campos com rótulo e mensagens anunciadas por tecnologia assistiva | Testes de componente (papéis e rótulos). Teste com leitor de tela real: pendente |
| RNF06 | Usabilidade | Letra base de 18 px e linguagem simples, voltada a quem está sob estresse | Inspeção |
| RNF07 | Usabilidade | Área de toque de pelo menos 44 px de altura nos links e controles, e 48 px nos botões | Inspeção do código de estilos |
| RNF08 | Acessibilidade | Respeitar a preferência do sistema por menos movimento | Inspeção do código de estilos |
| RNF09 | Disponibilidade | Continuar útil sem internet: dados simulados embutidos e cópia local das ocorrências | Teste automatizado no navegador, com a API desligada |
| RNF10 | Desempenho | Encerrar uma requisição à API que passe de 8 segundos e informar o morador | Inspeção do código |
| RNF11 | Manutenibilidade | Acesso à API do CRUD isolado em um único módulo, para a troca de API não afetar o restante | Inspeção do código |
| RNF12 | Manutenibilidade | Dados e limites das faixas em fonte única, compartilhada entre as partes | Teste que confere os mesmos resultados no Python e na web |
| RNF13 | Testabilidade | Regras de negócio separadas da interface e cobertas por testes automatizados | 96 testes (40 no Python e 56 na web), todos passando |
| RNF14 | Privacidade | Não coletar dados pessoais; o formulário orienta a não escrever nomes nem telefones | Inspeção |
| RNF15 | Segurança | Credenciais fora do repositório; no front-end, apenas a chave de leitura do ThingSpeak | `.gitignore` e inspeção do código |
| RNF16 | Desempenho | Dispositivo amostra o sensor a cada 1 s, sem bloquear o programa | Planejado |
| RNF17 | Disponibilidade | Dispositivo mantém o alerta local mesmo sem WiFi ou MQTT | Planejado |

## 6. Regras de Negócio (RN)

| ID | Regra |
|---|---|
| RN01 | As faixas começam em: Normal 0 cm, Atenção 150 cm, Alerta 200 cm e Crítico 250 cm. O valor exato do limite já pertence à faixa nova. **Valores provisórios, a validar com fonte pública.** |
| RN02 | Os limites das faixas vêm de um único arquivo de configuração, e cada faixa precisa começar acima da anterior. |
| RN03 | Uma leitura só é válida com data e hora no formato ISO, nível numérico entre 0 e 400 cm (alcance do sensor) e estação preenchida. |
| RN04 | Entre leituras com a mesma data e hora, vale a primeira. As demais são descartadas. |
| RN05 | A velocidade de subida é a inclinação da reta de mínimos quadrados das leituras dos últimos 60 minutos. São necessárias pelo menos 2 leituras. |
| RN06 | A tendência é *subindo* com velocidade de +2 cm/h ou mais, *descendo* com −2 cm/h ou menos, e *estável* entre esses valores. |
| RN07 | Tempo até o crítico = (limite crítico − nível atual) ÷ velocidade × 60. Se o nível já chegou ao crítico, o sistema informa que foi atingido. Com velocidade abaixo de 2 cm/h, não há previsão. |
| RN08 | A estimativa de tempo na tela Agora e na opção 3 do Terminal deve deixar claro que supõe a continuidade do ritmo atual de subida. |
| RN09 | Antecedência = momento da primeira leitura na faixa Crítico − momento da primeira leitura na faixa Alerta ou superior. |
| RN10 | Sem leitura nova há mais de 30 minutos, o dado do sensor é considerado desatualizado. |
| RN11 | Dados simulados devem estar sempre identificados como tal. |
| RN12 | A ocorrência exige rua (3 a 100 caracteres), descrição (10 a 500 caracteres), gravidade e data e hora. |
| RN13 | A gravidade é Baixa (água na calçada), Média (água entrando nas casas) ou Alta (risco para as pessoas). |
| RN14 | A data da ocorrência não pode estar no futuro, com tolerância de 5 minutos para diferenças de relógio. |
| RN15 | Sem conexão com a API ou sem internet, as ocorrências podem ser consultadas, mas não criadas, editadas ou excluídas. |
| RN16 | A exclusão exige confirmação, e a opção inicial em foco é "Não". |
| RN17 | O dispositivo publica no ThingSpeak com intervalo de pelo menos 15 segundos, por causa do limite da conta gratuita [a validar na documentação atual]. |

## 7. Backlog do Produto

Os épicos e os itens de cada épico estão em ordem de prioridade.

### E1. Alerta do nível da água

| ID | História | Prioridade | Requisitos | Situação |
|---|---|---|---|---|
| PB01 | Como morador, quero ver o nível atual e a faixa de alerta, para entender o risco em segundos | Alta | RF01, RF02, RF06 | Concluído |
| PB02 | Como morador, quero saber o que fazer em cada faixa, para agir sem precisar interpretar números | Alta | RF03 | Concluído |
| PB03 | Como morador, quero saber em quanto tempo a água chega ao nível crítico, para decidir o que salvar e quando sair | Alta | RF04, RF05 | Concluído |
| PB04 | Como morador, quero ligar para a emergência com um toque, para pedir ajuda rapidamente | Alta | RF20 | Concluído |
| PB05 | Como equipe, queremos validar os limites das faixas com fonte pública, para o alerta refletir a realidade do bairro | Alta | RN01 | A fazer |
| PB06 | Como morador, quero receber o aviso sem precisar abrir o app, para ser alertado mesmo dormindo | Alta | Novo requisito | A fazer |

### E2. Dispositivo de medição

| ID | História | Prioridade | Requisitos | Situação |
|---|---|---|---|---|
| PB07 | Como morador, quero que um sensor meça o nível da água, para o alerta usar dados do meu bairro | Alta | RF22, RNF16 | Planejado |
| PB08 | Como morador, quero um alarme sonoro e luminoso no local, para ser avisado mesmo sem internet | Alta | RF23, RNF17 | Planejado |
| PB09 | Como técnico, quero ver no dispositivo a medida, o alarme e a conexão, para saber se ele está funcionando | Alta | RF24 | Planejado |
| PB10 | Como morador, quero que as medições cheguem ao app pela internet, para acompanhar de onde eu estiver | Alta | RF25, RF21, RN17 | Planejado |
| PB11 | Como técnico, quero enviar comandos ao dispositivo, para testar o alarme à distância | Média | RF26 | Planejado |

### E3. Funcionamento com infraestrutura ruim

| ID | História | Prioridade | Requisitos | Situação |
|---|---|---|---|---|
| PB12 | Como morador, quero saber se estou sem internet, para não confiar em informação velha | Alta | RF17 | Concluído |
| PB13 | Como morador, quero ser avisado quando o sensor parar de enviar dados, para não achar que está tudo bem | Alta | RF19, RN10 | Parcial |
| PB14 | Como morador, quero ver a última lista de ocorrências mesmo sem conexão, para continuar informado | Média | RF18, RN15 | Concluído |
| PB15 | Como morador, quero abrir o app sem internet, mesmo que ele não esteja aberto | Média | Novo requisito | A fazer |
| PB16 | Como morador, quero registrar uma ocorrência sem internet e enviá-la quando a conexão voltar | Baixa | Novo requisito | A fazer |

### E4. Ocorrências da vizinhança

| ID | História | Prioridade | Requisitos | Situação |
|---|---|---|---|---|
| PB17 | Como morador, quero avisar sobre uma rua alagada, para alertar a vizinhança | Alta | RF11, RF15, RN12, RN13, RN14 | Concluído |
| PB18 | Como morador, quero ver os alagamentos relatados, para evitar ruas perigosas | Alta | RF12 | Concluído |
| PB19 | Como morador, quero entender o que aconteceu quando algo falha, para saber como prosseguir | Alta | RF16 | Concluído |
| PB20 | Como morador, quero corrigir um aviso que enviei, para manter a informação certa | Média | RF13 | Concluído |
| PB21 | Como morador, quero excluir um aviso errado, sem risco de apagar por engano | Média | RF14, RN16 | Concluído |
| PB22 | Como equipe, queremos usar uma API hospedada, para o app funcionar com um link público | Média | RNF11 | A fazer |

### E5. Histórico e medição de impacto

| ID | História | Prioridade | Requisitos | Situação |
|---|---|---|---|---|
| PB23 | Como morador, quero ver como o nível variou nas últimas horas, para entender se a situação piora | Média | RF07, RF08 | Concluído |
| PB24 | Como gestor, quero medir a antecedência do alerta, para saber se o sistema cumpre seu objetivo | Média | RF09, RN09 | Concluído |
| PB25 | Como apresentador, quero percorrer os dados simulados no tempo, para demonstrar o alerta acontecendo | Média | RF10, RN11 | Concluído |

## 8. Conclusão

O AlertaCheia transforma uma série de leituras em uma resposta para quem está em risco: quanto tempo ainda há para agir. Nos dados simulados, o primeiro Alerta veio 110 minutos antes do nível crítico. Naquele momento, o sistema estimou a chegada da água para as 02:56, e nos dados ela chegou às 03:00.

Os requisitos ligados às telas mostram que a experiência foi organizada pela necessidade do morador sob estresse: a orientação e o tempo restante aparecem antes dos números, a informação nunca depende só de cor, e o app continua útil quando a infraestrutura falha.

Três limitações precisam ficar claras:

- **O resultado ainda não vem de dados reais.** Os níveis são simulados, e os limites das faixas precisam ser validados com fonte pública.
- **O morador precisa abrir o app para ver o alerta.** Esse é o ponto mais importante a evoluir diante do problema original, e por isso a notificação (PB06) tem prioridade alta.
- **A estimativa supõe ritmo constante.** Se a água acelerar, o tempo real será menor do que o exibido.

Os próximos passos são concluir o dispositivo ESP32, que leva medições ao sistema e soa o alarme no próprio local, e validar os limites com fonte pública.
