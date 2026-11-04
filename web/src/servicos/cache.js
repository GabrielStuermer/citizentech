// Cache local (localStorage): guarda o último dado bom para o app
// continuar útil sem internet. Cada item é salvo junto com a hora em que
// foi salvo, para a tela poder avisar que ele está desatualizado.
//
// O localStorage pode falhar (modo privado, armazenamento cheio, bloqueado),
// então toda leitura e escrita fica dentro de try/catch: sem cache o app
// continua funcionando, só perde o modo sem conexão.

const PREFIXO = 'alertacheia:'

/** Salva um valor qualquer (precisa poder virar JSON). */
export function salvarNoCache(chave, valor) {
  try {
    const item = { valor, salvoEm: new Date().toISOString() }
    localStorage.setItem(PREFIXO + chave, JSON.stringify(item))
  } catch {
    // Sem espaço ou sem permissão: segue sem cache.
  }
}

/**
 * Lê um valor salvo.
 * @returns {{valor: any, salvoEm: Date} | null} null se não houver nada salvo
 */
export function lerDoCache(chave) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave)
    if (!texto) return null
    const item = JSON.parse(texto)
    return { valor: item.valor, salvoEm: new Date(item.salvoEm) }
  } catch {
    return null
  }
}
