# Roteiro do vídeo: Edge (Wokwi + ThingSpeak)

**Duração sugerida:** 3 a 4 minutos. **Gravação:** tela inteira (Win + Alt + R na Xbox Game Bar, ou OBS).

## Antes de gravar

- [ ] Firmware compilado com o `secrets.h` preenchido.
- [ ] Simulação testada uma vez do começo ao fim.
- [ ] Duas janelas lado a lado:
  - **esquerda:** VS Code com o simulador Wokwi e o Serial Monitor visíveis;
  - **direita:** navegador com o canal do ThingSpeak na aba **Private View**, que mostra os gráficos.
- [ ] Uma aba do navegador com o endereço de comando pronto, **sem mostrar a chave na tela**. Deixe o endereço já colado e só aperte Enter na hora.
- [ ] Sensor na distância **320 cm**, ou seja, nível 80 cm (Normal).

## Passo a passo

| # | Ação | O que mostrar e falar |
|---|---|---|
| 1 | Mostrar o `diagram.json` | "ESP32 com sensor ultrassônico, display OLED, quatro LEDs (um por faixa), buzzer e dois botões." |
| 2 | **Start Simulator** | O display liga com `WiFi:--` e depois `WiFi:OK  MQTT:OK`. "Ele conecta no WiFi e no ThingSpeak por MQTT." |
| 3 | Mostrar o Serial Monitor | Uma linha `[amostra]` por segundo. "A leitura é feita a cada 1 segundo, com millis(), sem delay." |
| 4 | Sensor: distância **230 cm** (nível 170) | LED **amarelo**, display `Faixa: ATENCAO`. |
| 5 | Sensor: distância **190 cm** (nível 210) | LED **laranja**, buzzer bipando, display `Alarme: INTERMITENTE`. "O alarme é decidido no próprio dispositivo." |
| 6 | Sensor: distância **140 cm** (nível 260) | LED **vermelho**, bipe contínuo, `Faixa: CRITICO`. |
| 7 | Botão **Silenciar** | Display `Alarme: SILENCIADO`, o buzzer para. |
| 8 | Esperar o envio (até 20 s) | No Serial, `[mqtt] enviado: field1=260.0&field2=3&field3=3`. No ThingSpeak, o ponto novo aparece nos gráficos. "Os dados ficam guardados no canal." |
| 9 | **Comando remoto:** no navegador, `field4=1` | Display `Alarme: TESTE REMOTO`, todos os LEDs acesos, buzzer tocando por 10 s. No Serial, `[comando] 1: teste alarme`. |
| 10 | **Configuração remota:** `field4=300` | Display `Critico remoto:300cm`. Com o nível em 260, a faixa passa para `ALERTA`. "O limite foi alterado pela internet." Depois envie `field4=0` para voltar ao padrão (respeite 15 s entre envios). |
| 11 | Botão **Rede** (1º clique) | Display `WiFi:OK  MQTT:--` e `Teste: MQTT cortado`. "Desconexão do MQTT." |
| 12 | Mudar o sensor para distância **320 cm** | O LED muda para verde mesmo sem MQTT. "O alerta local continua funcionando." |
| 13 | Botão **Rede** (2º clique) | Display `WiFi:--  MQTT:--` e `Teste: WiFi cortado`. "Agora sem WiFi, e o dispositivo segue medindo e alertando." |
| 14 | Botão **Rede** (3º clique) | Reconecta: `WiFi:OK  MQTT:OK`. Mostre um novo envio chegando no ThingSpeak. |
| 15 | Encerramento | "Medição constante, alarme local, display, envio e recepção via MQTT e dashboard no ThingSpeak." |

## Se algo der errado

| Sintoma | Causa provável |
|---|---|
| `MQTT:--` o tempo todo e Serial com `codigo 5` | Credenciais erradas no `secrets.h`, ou o dispositivo MQTT sem o canal autorizado |
| Comando não chega | O canal não foi adicionado ao dispositivo com permissão de **Subscribe**, ou o envio foi feito antes de passarem 15 s do anterior |
| Ponto não aparece no gráfico | Envio feito menos de 15 s depois do anterior (limite do plano gratuito) |
