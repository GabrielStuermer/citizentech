// Análise: velocidade de subida, tempo até o nível crítico e indicador de impacto.
// Mesmo algoritmo do Python (python/src/analise.py), para os dois darem
// os mesmos números.

import { buscarFaixa, classificarNivel } from './faixas.js'

// Minutos de leituras usados no cálculo da velocidade.
export const JANELA_PADRAO_MIN = 60

// Abaixo desta velocidade o nível é considerado estável (filtra o ruído do sensor).
export const VELOCIDADE_MINIMA_CM_H = 2

const MS_POR_HORA = 60 * 60 * 1000

/**
 * Velocidade de subida em cm/h: inclinação da reta de mínimos quadrados
 * que passa pelas leituras dos últimos `janelaMin` minutos.
 *   inclinação = soma((x - média_x)(y - média_y)) / soma((x - média_x)²)
 *   x = tempo em horas, y = nível em cm
 * @returns {number|null} null se houver menos de 2 leituras na janela
 */
export function velocidadeSubida(leituras, janelaMin = JANELA_PADRAO_MIN) {
  if (leituras.length === 0) return null

  const fim = leituras.at(-1).timestamp.getTime()
  const inicio = fim - janelaMin * 60 * 1000
  const janela = leituras.filter((l) => l.timestamp.getTime() >= inicio)
  if (janela.length < 2) return null

  const t0 = janela[0].timestamp.getTime()
  const x = janela.map((l) => (l.timestamp.getTime() - t0) / MS_POR_HORA)
  const y = janela.map((l) => l.nivelCm)
  const mediaX = x.reduce((soma, v) => soma + v, 0) / x.length
  const mediaY = y.reduce((soma, v) => soma + v, 0) / y.length

  let numerador = 0
  let denominador = 0
  for (let i = 0; i < x.length; i++) {
    numerador += (x[i] - mediaX) * (y[i] - mediaY)
    denominador += (x[i] - mediaX) ** 2
  }
  if (denominador === 0) return null
  return numerador / denominador
}

/** 'subindo' | 'descendo' | 'estavel' | 'sem-dados' */
export function tendencia(velocidadeCmH) {
  if (velocidadeCmH === null || velocidadeCmH === undefined) return 'sem-dados'
  if (velocidadeCmH >= VELOCIDADE_MINIMA_CM_H) return 'subindo'
  if (velocidadeCmH <= -VELOCIDADE_MINIMA_CM_H) return 'descendo'
  return 'estavel'
}

/**
 * Minutos até o nível crítico, supondo que a água continue no mesmo ritmo:
 *   minutos = (limite - nível atual) / velocidade × 60
 * @returns {number|null} 0 se já está no crítico; null se não está subindo
 */
export function minutosAteCritico(nivelAtualCm, velocidadeCmH, limiteCriticoCm) {
  if (nivelAtualCm >= limiteCriticoCm) return 0
  if (velocidadeCmH === null || velocidadeCmH < VELOCIDADE_MINIMA_CM_H) return null
  return ((limiteCriticoCm - nivelAtualCm) / velocidadeCmH) * 60
}

/**
 * Tudo o que o morador precisa saber sobre a leitura mais recente.
 * @returns {null | {leitura, faixa, velocidadeCmH, tendencia, limiteCriticoCm, minutosAteCritico}}
 */
export function statusAtual(leituras, faixas, janelaMin = JANELA_PADRAO_MIN) {
  if (leituras.length === 0) return null
  const leitura = leituras.at(-1)
  const velocidade = velocidadeSubida(leituras, janelaMin)
  const limiteCritico = buscarFaixa('critico', faixas).aPartirDeCm
  return {
    leitura,
    faixa: classificarNivel(leitura.nivelCm, faixas),
    velocidadeCmH: velocidade,
    tendencia: tendencia(velocidade),
    limiteCriticoCm: limiteCritico,
    minutosAteCritico: minutosAteCritico(leitura.nivelCm, velocidade, limiteCritico),
  }
}

/**
 * INDICADOR DE IMPACTO: minutos entre o primeiro aviso na faixa `faixaAviso`
 * e a chegada da água ao nível crítico.
 * @returns {null | {aviso: Date, critico: Date, minutos: number}}
 */
export function calcularAntecedencia(leituras, faixas, faixaAviso = 'alerta') {
  const codigoAviso = buscarFaixa(faixaAviso, faixas).codigo
  const codigoCritico = buscarFaixa('critico', faixas).codigo

  let momentoAviso = null
  for (const leitura of leituras) {
    const codigo = classificarNivel(leitura.nivelCm, faixas).codigo
    if (momentoAviso === null && codigo >= codigoAviso) momentoAviso = leitura.timestamp
    if (codigo >= codigoCritico) {
      return {
        aviso: momentoAviso,
        critico: leitura.timestamp,
        minutos: (leitura.timestamp - momentoAviso) / 60000,
      }
    }
  }
  return null
}
