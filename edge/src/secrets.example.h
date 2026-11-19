// Modelo de credenciais: copie para "secrets.h" e preencha.
// O secrets.h está no .gitignore e nunca vai para o GitHub.
#pragma once

// WiFi do simulador Wokwi (rede aberta; canal 6 conecta mais rápido)
#define WIFI_SSID  "Wokwi-GUEST"
#define WIFI_SENHA ""
#define WIFI_CANAL 6

// ID do canal do ThingSpeak
#define TS_CANAL_ID "0000000"

// Credenciais do dispositivo MQTT do ThingSpeak (Devices > MQTT)
#define MQTT_CLIENT_ID "COLE_AQUI_O_CLIENT_ID"
#define MQTT_USUARIO   "COLE_AQUI_O_USERNAME"
#define MQTT_SENHA     "COLE_AQUI_A_PASSWORD"
