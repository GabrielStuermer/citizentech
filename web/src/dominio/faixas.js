// Faixas de alerta (normal, atenção, alerta, crítico).
// Mesma regra do Python (python/src/faixas.py). Os limites vêm de
// dados/config_alertas.json: para mudar um limite, edite o JSON.

export const FAIXAS_OBRIGATORIAS = ['normal', 'atencao', 'alerta', 'critico']

/**
 * Transforma o conteúdo do config_alertas.json em uma lista de faixas
 * em ordem crescente de nível.
 * @param {object} config - conteúdo do JSON já convertido em objeto
 * @returns {Array<{chave, codigo, aPartirDeCm, rotulo, mensagem}>}
 * @throws {Error} se faltar alguma faixa ou se os limites estiverem fora de ordem
 */
export function carregarFaixas(config) {
  const doArquivo = config?.faixas ?? {}
  const faltando = FAIXAS_OBRIGATORIAS.filter((chave) => !(chave in doArquivo))
  if (faltando.length > 0) {
    throw new Error(`faixas ausentes na configuração: ${faltando.join(', ')}`)
  }

  const faixas = FAIXAS_OBRIGATORIAS.map((chave) => ({
    chave,
    codigo: Number(doArquivo[chave].codigo),
    aPartirDeCm: Number(doArquivo[chave].a_partir_de_cm),
    rotulo: doArquivo[chave].rotulo,
    mensagem: doArquivo[chave].mensagem,
  }))

  // Cada faixa precisa começar acima da anterior.
  for (let i = 1; i < faixas.length; i++) {
    if (faixas[i].aPartirDeCm <= faixas[i - 1].aPartirDeCm) {
      throw new Error(`o limite de "${faixas[i].chave}" precisa ser maior que o de "${faixas[i - 1].chave}"`)
    }
  }
  return faixas
}

/**
 * Diz em qual faixa um nível está: a ÚLTIMA cujo limite inicial é <= nível.
 * Ex.: limites 0/150/200/250 e nível 210 -> "alerta".
 */
export function classificarNivel(nivelCm, faixas) {
  let encontrada = faixas[0]
  for (const faixa of faixas) {
    if (nivelCm >= faixa.aPartirDeCm) encontrada = faixa
  }
  return encontrada
}

/** Devolve a faixa com a chave informada (ex.: "critico"). */
export function buscarFaixa(chave, faixas) {
  const faixa = faixas.find((f) => f.chave === chave)
  if (!faixa) throw new Error(`faixa não encontrada: ${chave}`)
  return faixa
}
