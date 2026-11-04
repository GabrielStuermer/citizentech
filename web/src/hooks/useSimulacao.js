// "Máquina do tempo" dos dados simulados: escolhe qual leitura é o "agora".
// Permite pausar, avançar automaticamente e arrastar para qualquer momento.
// Serve para demonstrar o alerta acontecendo durante a subida da água.
import { useEffect, useState } from 'react'

export const PASSO_MS = 800 // a cada 0,8 s avança uma leitura (10 min nos dados)

/**
 * @param {number} total - quantidade de leituras disponíveis
 * @returns {{indice, irPara, tocando, alternar}}
 *   indice: posição da leitura considerada "agora" (padrão: a mais recente)
 */
export function useSimulacao(total) {
  const [escolhido, setEscolhido] = useState(null) // null = acompanhar a mais recente
  const [tocando, setTocando] = useState(false)

  const ultimo = Math.max(total - 1, 0)
  const indice = escolhido === null ? ultimo : Math.min(escolhido, ultimo)

  // Avança uma leitura a cada PASSO_MS enquanto estiver tocando.
  useEffect(() => {
    if (!tocando) return undefined
    const temporizador = setInterval(() => {
      setEscolhido((atual) => Math.min((atual ?? ultimo) + 1, ultimo))
    }, PASSO_MS)
    return () => clearInterval(temporizador)
  }, [tocando, ultimo])

  // Chegou ao fim: para sozinho.
  useEffect(() => {
    if (tocando && indice >= ultimo) setTocando(false)
  }, [tocando, indice, ultimo])

  function alternar() {
    // Se já está no fim, recomeça do início ao apertar "Reproduzir".
    if (!tocando && indice >= ultimo) setEscolhido(0)
    setTocando((t) => !t)
  }

  function irPara(novoIndice) {
    setEscolhido(Math.max(0, Math.min(novoIndice, ultimo)))
  }

  return { indice, irPara, tocando, alternar }
}
