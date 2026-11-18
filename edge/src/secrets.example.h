// =============================================================
// MODELO de credenciais do AlertaCheia.
//
// 1. Copie este arquivo para "secrets.h" (na mesma pasta src/).
// 2. Preencha com os dados do SEU canal e do SEU dispositivo MQTT
//    criados no ThingSpeak.
//
// O secrets.h está no .gitignore: as credenciais NUNCA vão para o GitHub.
// =============================================================
#pragma once

// WiFi do simulador Wokwi (rede aberta, sem senha; canal 6 conecta mais rápido)
#define WIFI_SSID  "Wokwi-GUEST"
#define WIFI_SENHA ""
#define WIFI_CANAL 6

// ThingSpeak: número do canal (Channel ID), entre aspas
#define TS_CANAL_ID "0000000"

// ThingSpeak: credenciais do dispositivo MQTT (Devices > MQTT)
#define MQTT_CLIENT_ID "COLE_AQUI_O_CLIENT_ID"
#define MQTT_USUARIO   "COLE_AQUI_O_USERNAME"
#define MQTT_SENHA     "COLE_AQUI_A_PASSWORD"
