// Faixas de alerta (mesmas regras do python/src/faixas.py)
export const FAIXAS_OBRIGATORIAS = ['normal', 'atencao', 'alerta', 'critico']

// Converte o config_alertas.json numa lista de faixas validada
export function carregarFaixas(config) {
  // Nenhuma faixa pode faltar
  const doArquivo = config?.faixas ?? {}
  const faltando = FAIXAS_OBRIGATORIAS.filter((chave) => !(chave in doArquivo))
  if (faltando.length > 0) {
    throw new Error(`faixas ausentes na configuração: ${faltando.join(', ')}`)
  }

  // Formato usado no app (camelCase)
  const faixas = FAIXAS_OBRIGATORIAS.map((chave) => ({
    chave,
    codigo: Number(doArquivo[chave].codigo),
    aPartirDeCm: Number(doArquivo[chave].a_partir_de_cm),
    rotulo: doArquivo[chave].rotulo,
    mensagem: doArquivo[chave].mensagem,
  }))

  // Cada faixa precisa começar acima da anterior
  for (let i = 1; i < faixas.length; i++) {
    if (faixas[i].aPartirDeCm <= faixas[i - 1].aPartirDeCm) {
      throw new Error(`o limite de "${faixas[i].chave}" precisa ser maior que o de "${faixas[i - 1].chave}"`)
    }
  }
  return faixas
}

// Última faixa cujo limite é <= ao nível
export function classificarNivel(nivelCm, faixas) {
  let encontrada = faixas[0]
  for (const faixa of faixas) {
    if (nivelCm >= faixa.aPartirDeCm) encontrada = faixa
  }
  return encontrada
}

// Procura uma faixa pela chave (ex.: 'critico')
export function buscarFaixa(chave, faixas) {
  const faixa = faixas.find((f) => f.chave === chave)
  if (!faixa) throw new Error(`faixa não encontrada: ${chave}`)
  return faixa
}
