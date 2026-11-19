// Leituras de nível: validação, leitura do CSV e filtros por tempo
export const NIVEL_MINIMO_CM = 0
export const NIVEL_MAXIMO_CM = 400

const COLUNAS_OBRIGATORIAS = ['timestamp', 'nivel_cm', 'estacao']

// Data/hora ISO: AAAA-MM-DDTHH:MM[:SS[.ms]][Z ou ±HH:MM]
const FORMATO_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/

// Valida uma leitura bruta; devolve { timestamp, nivelCm, estacao } ou lança erro com o motivo
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

// Ordena por data e descarta datas repetidas (fica a primeira)
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

// Lê o texto do CSV; devolve { leituras válidas, erros de cada linha }
export function lerCsv(texto) {
  const linhas = texto.split(/\r?\n/).filter((linha) => linha.trim() !== '')
  if (linhas.length === 0) return { leituras: [], erros: [] }

  // Confere o cabeçalho
  const cabecalho = linhas[0].split(',').map((coluna) => coluna.trim())
  const faltando = COLUNAS_OBRIGATORIAS.filter((coluna) => !cabecalho.includes(coluna))
  if (faltando.length > 0) {
    throw new Error(`colunas obrigatórias ausentes: ${faltando.join(', ')}`)
  }

  // Valida linha a linha; a inválida vira erro e as outras seguem
  const validas = []
  const erros = []
  linhas.slice(1).forEach((linha, indice) => {
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

// Leituras até um momento (usado na simulação)
export function leiturasAte(leituras, momento) {
  return leituras.filter((leitura) => leitura.timestamp <= momento)
}

// Leituras das últimas N horas (usado no gráfico)
export function ultimasHoras(leituras, horas) {
  if (leituras.length === 0) return []
  const fim = leituras.at(-1).timestamp.getTime()
  const inicio = fim - horas * 60 * 60 * 1000
  return leituras.filter((leitura) => leitura.timestamp.getTime() >= inicio)
}

// true se a última leitura tem mais de limiteMin minutos
export function estaDesatualizada(momentoLeitura, agora, limiteMin = 30) {
  return agora.getTime() - momentoLeitura.getTime() > limiteMin * 60 * 1000
}
