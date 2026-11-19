// Análise das leituras (mesmas regras do python/src/analise.py)
import { buscarFaixa, classificarNivel } from './faixas.js'

// Minutos de leituras usados para a velocidade
export const JANELA_PADRAO_MIN = 60

// Abaixo disso (cm/h) o nível é considerado estável
export const VELOCIDADE_MINIMA_CM_H = 2

const MS_POR_HORA = 60 * 60 * 1000

// Velocidade em cm/h: inclinação da reta de mínimos quadrados da última hora
export function velocidadeSubida(leituras, janelaMin = JANELA_PADRAO_MIN) {
  if (leituras.length === 0) return null

  // Só as leituras dentro da janela
  const fim = leituras.at(-1).timestamp.getTime()
  const inicio = fim - janelaMin * 60 * 1000
  const janela = leituras.filter((l) => l.timestamp.getTime() >= inicio)
  if (janela.length < 2) return null

  // x = horas desde a primeira leitura; y = nível em cm
  const t0 = janela[0].timestamp.getTime()
  const x = janela.map((l) => (l.timestamp.getTime() - t0) / MS_POR_HORA)
  const y = janela.map((l) => l.nivelCm)
  const mediaX = x.reduce((soma, v) => soma + v, 0) / x.length
  const mediaY = y.reduce((soma, v) => soma + v, 0) / y.length

  // inclinação = soma((x - médiaX)(y - médiaY)) / soma((x - médiaX)²)
  let numerador = 0
  let denominador = 0
  for (let i = 0; i < x.length; i++) {
    numerador += (x[i] - mediaX) * (y[i] - mediaY)
    denominador += (x[i] - mediaX) ** 2
  }
  if (denominador === 0) return null
  return numerador / denominador
}

// Traduz a velocidade em: subindo, descendo, estavel ou sem-dados
export function tendencia(velocidadeCmH) {
  if (velocidadeCmH === null || velocidadeCmH === undefined) return 'sem-dados'
  if (velocidadeCmH >= VELOCIDADE_MINIMA_CM_H) return 'subindo'
  if (velocidadeCmH <= -VELOCIDADE_MINIMA_CM_H) return 'descendo'
  return 'estavel'
}

// Minutos até o crítico; 0 = já atingiu, null = não está subindo
export function minutosAteCritico(nivelAtualCm, velocidadeCmH, limiteCriticoCm) {
  if (nivelAtualCm >= limiteCriticoCm) return 0
  if (velocidadeCmH === null || velocidadeCmH < VELOCIDADE_MINIMA_CM_H) return null
  return ((limiteCriticoCm - nivelAtualCm) / velocidadeCmH) * 60
}

// Tudo sobre a última leitura: faixa, velocidade, tendência e tempo até o crítico
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

// Indicador de impacto: minutos entre o primeiro Alerta e a chegada ao Crítico
export function calcularAntecedencia(leituras, faixas, faixaAviso = 'alerta') {
  const codigoAviso = buscarFaixa(faixaAviso, faixas).codigo
  const codigoCritico = buscarFaixa('critico', faixas).codigo

  let momentoAviso = null
  for (const leitura of leituras) {
    const codigo = classificarNivel(leitura.nivelCm, faixas).codigo
    // Primeira vez na faixa de aviso
    if (momentoAviso === null && codigo >= codigoAviso) momentoAviso = leitura.timestamp
    // Chegou no crítico: calcula e encerra
    if (codigo >= codigoCritico) {
      return {
        aviso: momentoAviso,
        critico: leitura.timestamp,
        minutos: (leitura.timestamp - momentoAviso) / 60000,
      }
    }
  }
  return null // nunca chegou ao crítico
}
