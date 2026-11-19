// De onde vêm as leituras: CSV simulado (padrão) ou canal do ThingSpeak
import csvSimulado from '@dados/niveis_simulados.csv?raw'
import config from '@dados/config_alertas.json'
import { lerCsv, organizarLeituras, validarLeitura } from '../dominio/leituras.js'

// Definido no .env.local (VITE_FONTE_LEITURAS)
const FONTE = import.meta.env.VITE_FONTE_LEITURAS ?? 'simulada'

export function fonteAtual() {
  return FONTE === 'thingspeak' ? 'thingspeak' : 'simulada'
}

// Devolve { leituras, erros } da fonte configurada
export async function buscarLeituras() {
  if (fonteAtual() === 'thingspeak') return buscarDoThingSpeak()
  return lerCsv(csvSimulado) // CSV vem embutido no app: funciona sem internet
}

// Lê os últimos registros do canal e converte para o formato do app
async function buscarDoThingSpeak() {
  const canal = import.meta.env.VITE_THINGSPEAK_CANAL
  const chave = import.meta.env.VITE_THINGSPEAK_CHAVE_LEITURA
  const resultados = import.meta.env.VITE_THINGSPEAK_RESULTADOS ?? '200'
  if (!canal) throw new Error('Canal do ThingSpeak não configurado (VITE_THINGSPEAK_CANAL).')

  // Monta a URL da API de leitura do ThingSpeak
  const parametros = new URLSearchParams({ results: resultados })
  if (chave) parametros.set('api_key', chave)
  const url = `https://api.thingspeak.com/channels/${encodeURIComponent(canal)}/feeds.json?${parametros}`

  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`ThingSpeak respondeu com erro ${resposta.status}.`)
  const corpo = await resposta.json()

  const validas = []
  const erros = []
  for (const registro of corpo.feeds ?? []) {
    // Registros sem field1 são comandos remotos (field4): não são leituras
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
