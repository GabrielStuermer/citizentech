// "Máquina do tempo" dos dados simulados: posição na régua e Reproduzir/Pausar
import { useEffect, useState } from 'react'

export const PASSO_MS = 800 // avança uma leitura a cada 0,8 s

export function useSimulacao(total) {
  const [escolhido, setEscolhido] = useState(null) // null = última leitura
  const [tocando, setTocando] = useState(false)

  const ultimo = Math.max(total - 1, 0)
  const indice = escolhido === null ? ultimo : Math.min(escolhido, ultimo)

  // Enquanto toca, avança um passo por vez
  useEffect(() => {
    if (!tocando) return undefined
    const temporizador = setInterval(() => {
      setEscolhido((atual) => Math.min((atual ?? ultimo) + 1, ultimo))
    }, PASSO_MS)
    return () => clearInterval(temporizador)
  }, [tocando, ultimo])

  // Chegou ao fim: para sozinho
  useEffect(() => {
    if (tocando && indice >= ultimo) setTocando(false)
  }, [tocando, indice, ultimo])

  // Reproduzir/Pausar; se já está no fim, recomeça do início
  function alternar() {
    if (!tocando && indice >= ultimo) setEscolhido(0)
    setTocando((t) => !t)
  }

  // Vai para uma posição da régua (sem sair dos limites)
  function irPara(novoIndice) {
    setEscolhido(Math.max(0, Math.min(novoIndice, ultimo)))
  }

  return { indice, irPara, tocando, alternar }
}
