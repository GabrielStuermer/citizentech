// De onde vêm as leituras de nível da água.
//
// Duas fontes, escolhidas no arquivo .env (veja .env.example):
//   VITE_FONTE_LEITURAS=simulada    (padrão) CSV simulado da pasta dados/
//   VITE_FONTE_LEITURAS=thingspeak  canal do ThingSpeak alimentado pelo ESP32
//
// As duas devolvem o mesmo formato, então a tela não precisa saber qual
// está em uso.

import csvSimulado from '@dados/niveis_simulados.csv?raw'
import config from '@dados/config_alertas.json'
import { lerCsv, organizarLeituras, validarLeitura } from '../dominio/leituras.js'

const FONTE = import.meta.env.VITE_FONTE_LEITURAS ?? 'simulada'

/** Fonte em uso, para a tela poder informar o morador. */
export function fonteAtual() {
  return FONTE === 'thingspeak' ? 'thingspeak' : 'simulada'
}

/**
 * Busca as leituras na fonte configurada.
 * @returns {Promise<{leituras: Array, erros: string[]}>}
 */
export async function buscarLeituras() {
  if (fonteAtual() === 'thingspeak') return buscarDoThingSpeak()
  // O CSV vem junto com o app (é importado no build), então funciona sem internet.
  return lerCsv(csvSimulado)
}

// ---------------- ThingSpeak (opcional) ----------------
// API de leitura do ThingSpeak [a validar na documentação atual]:
//   GET https://api.thingspeak.com/channels/<ID>/feeds.json?results=<N>&api_key=<CHAVE DE LEITURA>
// Resposta: { feeds: [ { created_at: "2026-11-05T01:10:00Z", field1: "201.8", ... } ] }
// field1 = nivel_cm (mesmo campo que o ESP32 publica).
// A chave de LEITURA pode ficar no front-end; a de ESCRITA nunca.

async function buscarDoThingSpeak() {
  const canal = import.meta.env.VITE_THINGSPEAK_CANAL
  const chave = import.meta.env.VITE_THINGSPEAK_CHAVE_LEITURA
  const resultados = import.meta.env.VITE_THINGSPEAK_RESULTADOS ?? '200'
  if (!canal) throw new Error('Canal do ThingSpeak não configurado (VITE_THINGSPEAK_CANAL).')

  const parametros = new URLSearchParams({ results: resultados })
  if (chave) parametros.set('api_key', chave)
  const url = `https://api.thingspeak.com/channels/${encodeURIComponent(canal)}/feeds.json?${parametros}`

  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`ThingSpeak respondeu com erro ${resposta.status}.`)
  const corpo = await resposta.json()

  // Converte cada registro do ThingSpeak para o contrato de dados e valida.
  const validas = []
  const erros = []
  for (const registro of corpo.feeds ?? []) {
    // Entradas sem nível (field1 vazio) não são leituras: são os comandos
    // remotos enviados pelo field4. Ignoramos sem contar como erro.
    if (registro.field1 === null || registro.field1 === undefined || registro.field1 === '') continue
    try {
      validas.push(validarLeitura({
        timestamp: registro.created_at,
        nivel_cm: registro.field1,
        estacao: config.estacao,
      }))
    } catch (erro) {
      erros.push(`registro ${registro.entry_id}: ${erro.message}`)
    }
  }
  const organizadas = organizarLeituras(validas)
  return { leituras: organizadas.leituras, erros: [...erros, ...organizadas.erros] }
}
