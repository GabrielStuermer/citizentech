// Cópia local (localStorage) para o app continuar útil sem internet
const PREFIXO = 'alertacheia:'

// Guarda o valor junto com a hora em que foi salvo
export function salvarNoCache(chave, valor) {
  try {
    const item = { valor, salvoEm: new Date().toISOString() }
    localStorage.setItem(PREFIXO + chave, JSON.stringify(item))
  } catch {
    // Armazenamento cheio ou bloqueado: segue sem cache
  }
}

// Devolve { valor, salvoEm } ou null se não houver nada salvo
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
