// Mede a largura real de um elemento e atualiza quando a tela muda de tamanho.
// Usado pelo gráfico para desenhar no tamanho exato da tela: assim o texto
// do gráfico nunca fica minúsculo no celular.
//
// Devolve [refDeCallback, largura]. A ref é uma função (e não useRef) para
// voltar a medir sempre que o elemento aparecer na tela, mesmo que ele não
// exista na primeira renderização.
import { useEffect, useState } from 'react'

export function useLargura(larguraPadrao = 640) {
  const [elemento, setElemento] = useState(null)
  const [largura, setLargura] = useState(larguraPadrao)

  useEffect(() => {
    // ResizeObserver não existe em navegadores muito antigos nem nos testes.
    if (!elemento || typeof ResizeObserver === 'undefined') return undefined
    const observador = new ResizeObserver(([entrada]) => {
      setLargura(Math.round(entrada.contentRect.width))
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [elemento])

  return [setElemento, largura]
}
