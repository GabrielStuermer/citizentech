// Mede a largura real de um elemento (o gráfico usa para se desenhar no tamanho da tela)
import { useEffect, useState } from 'react'

export function useLargura(larguraPadrao = 640) {
  const [elemento, setElemento] = useState(null)
  const [largura, setLargura] = useState(larguraPadrao)

  // Observa mudanças de tamanho do elemento
  useEffect(() => {
    if (!elemento || typeof ResizeObserver === 'undefined') return undefined
    const observador = new ResizeObserver(([entrada]) => {
      setLargura(Math.round(entrada.contentRect.width))
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [elemento])

  // setElemento vai no "ref" do elemento que será medido
  return [setElemento, largura]
}
