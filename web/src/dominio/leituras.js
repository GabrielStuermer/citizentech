// Leituras de nível da água: conversão do CSV e validação.
// Mesmas regras do Python (python/src/leitura.py).
//
// Formato de cada leitura dentro do app (camelCase, padrão do JavaScript):
//   { timestamp: Date, nivelCm: number, estacao: string }
// No arquivo e na API o nome é nivel_cm (contrato de dados); a conversão
// acontece só aqui, na entrada dos dados.

// Alcance físico do sensor HC-SR04 (cerca de 400 cm): fora disso é erro de leitura.
export const NIVEL_MINIMO_CM = 0
export const NIVEL_MAXIMO_CM = 400

const COLUNAS_OBRIGATORIAS = ['timestamp', 'nivel_cm', 'estacao']

// Formato ISO aceito: AAAA-MM-DDTHH:MM(:SS), com fuso opcional (Z ou +03:00).
const FORMATO_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/

/**
 * Valida um registro bruto e devolve uma leitura pronta para uso.
 * @param {{timestamp?: string, nivel_cm?: string|number, estacao?: string}} bruto
 * @returns {{timestamp: Date, nivelCm: number, estacao: string}}
 * @throws {Error} com uma mensagem simples explicando o problema
 */
export function validarLeitura(bruto) {
  const textoData = String(bruto.timestamp ?? '').trim()
  const momento = new Date(textoData)
  if (!FORMATO_ISO.test(textoData) || Number.isNaN(momento.getTime())) {
    throw new Error(`data/hora inválida: "${textoData}"`)
  }

  const textoNivel = String(bruto.nivel_cm ?? '').trim()
  const nivel = Number(textoNivel)
  if (textoNivel === '' || Number.isNaN(nivel)) {
    throw new Error(`nível não é um número: "${textoNivel}"`)
  }
  if (nivel < NIVEL_MINIMO_CM || nivel > NIVEL_MAXIMO_CM) {
    throw new Error(`nível fora do possível (${nivel} cm; esperado de ${NIVEL_MINIMO_CM} a ${NIVEL_MAXIMO_CM} cm)`)
  }

  const estacao = String(bruto.estacao ?? '').trim()
  if (!estacao) throw new Error('estação vazia')

  return { timestamp: momento, nivelCm: nivel, estacao }
}

/**
 * Ordena por data/hora e remove datas repetidas (fica a primeira).
 * @returns {{leituras: Array, erros: string[]}}
 */
export function organizarLeituras(leituras) {
  const ordenadas = [...leituras].sort((a, b) => a.timestamp - b.timestamp)
  const vistos = new Set()
  const unicas = []
  const erros = []
  for (const leitura of ordenadas) {
    const chave = leitura.timestamp.getTime()
    if (vistos.has(chave)) {
      erros.push(`data/hora repetida, leitura ignorada: ${leitura.timestamp.toISOString()}`)
    } else {
      vistos.add(chave)
      unicas.push(leitura)
    }
  }
  return { leituras: unicas, erros }
}

/**
 * Converte o texto de um CSV (contrato de dados) em leituras válidas.
 * Linhas inválidas são ignoradas e o motivo vai para a lista de erros.
 * @param {string} texto - conteúdo do arquivo CSV
 * @returns {{leituras: Array, erros: string[]}}
 * @throws {Error} se faltar alguma coluna obrigatória no cabeçalho
 */
export function lerCsv(texto) {
  const linhas = texto.split(/\r?\n/).filter((linha) => linha.trim() !== '')
  if (linhas.length === 0) return { leituras: [], erros: [] }

  const cabecalho = linhas[0].split(',').map((coluna) => coluna.trim())
  const faltando = COLUNAS_OBRIGATORIAS.filter((coluna) => !cabecalho.includes(coluna))
  if (faltando.length > 0) {
    throw new Error(`colunas obrigatórias ausentes: ${faltando.join(', ')}`)
  }

  const validas = []
  const erros = []
  linhas.slice(1).forEach((linha, indice) => {
    // Monta um objeto { timestamp, nivel_cm, estacao } a partir das colunas.
    const valores = linha.split(',')
    const bruto = Object.fromEntries(cabecalho.map((coluna, i) => [coluna, valores[i]]))
    try {
      validas.push(validarLeitura(bruto))
    } catch (erro) {
      erros.push(`linha ${indice + 2}: ${erro.message}`) // +2: cabeçalho é a linha 1
    }
  })

  const organizadas = organizarLeituras(validas)
  return { leituras: organizadas.leituras, erros: [...erros, ...organizadas.erros] }
}

/** Só as leituras feitas até o momento informado (inclusive). */
export function leiturasAte(leituras, momento) {
  return leituras.filter((leitura) => leitura.timestamp <= momento)
}

/** Só as leituras das últimas `horas` horas antes da última leitura. */
export function ultimasHoras(leituras, horas) {
  if (leituras.length === 0) return []
  const fim = leituras.at(-1).timestamp.getTime()
  const inicio = fim - horas * 60 * 60 * 1000
  return leituras.filter((leitura) => leitura.timestamp.getTime() >= inicio)
}

/**
 * A leitura está velha demais para confiar? (ex.: sensor sem internet)
 * @param {Date} momentoLeitura
 * @param {Date} agora
 * @param {number} limiteMin - minutos sem leitura nova para considerar desatualizado
 */
export function estaDesatualizada(momentoLeitura, agora, limiteMin = 30) {
  return agora.getTime() - momentoLeitura.getTime() > limiteMin * 60 * 1000
}
