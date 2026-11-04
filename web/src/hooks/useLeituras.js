// Carrega as leituras de nível e controla o estado da tela:
// 'carregando' | 'sucesso' | 'erro'.
// Se a fonte falhar (ex.: sem internet), usa a última lista salva no aparelho
// e marca doCache = true, para a tela avisar que pode estar desatualizada.
import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarLeituras, fonteAtual } from '../servicos/leiturasFonte.js'
import { lerDoCache, salvarNoCache } from '../servicos/cache.js'

const CHAVE_CACHE = 'leituras'
const ATUALIZAR_A_CADA_MS = 60 * 1000 // só para a fonte ThingSpeak (dados ao vivo)

// O localStorage só guarda texto: Date vira texto ao salvar e volta a ser Date ao ler.
const paraSalvar = (leituras) => leituras.map((l) => ({ ...l, timestamp: l.timestamp.toISOString() }))
const doSalvo = (leituras) => leituras.map((l) => ({ ...l, timestamp: new Date(l.timestamp) }))

export function useLeituras() {
  const [estado, setEstado] = useState({
    status: 'carregando',
    leituras: [],
    errosDeLinha: [], // linhas inválidas ignoradas
    erro: null,       // falha ao buscar a fonte
    doCache: false,
    salvoEm: null,
  })

  // Evita que uma resposta antiga sobrescreva uma mais nova.
  const ultimaBusca = useRef(0)

  const carregar = useCallback(async () => {
    const minhaBusca = ++ultimaBusca.current
    setEstado((anterior) => ({ ...anterior, status: anterior.leituras.length ? anterior.status : 'carregando' }))

    try {
      const { leituras, erros } = await buscarLeituras()
      if (minhaBusca !== ultimaBusca.current) return
      salvarNoCache(CHAVE_CACHE, paraSalvar(leituras))
      setEstado({ status: 'sucesso', leituras, errosDeLinha: erros, erro: null, doCache: false, salvoEm: new Date() })
    } catch (erro) {
      if (minhaBusca !== ultimaBusca.current) return
      const salvo = lerDoCache(CHAVE_CACHE)
      if (salvo) {
        setEstado({ status: 'sucesso', leituras: doSalvo(salvo.valor), errosDeLinha: [], erro, doCache: true, salvoEm: salvo.salvoEm })
      } else {
        setEstado({ status: 'erro', leituras: [], errosDeLinha: [], erro, doCache: false, salvoEm: null })
      }
    }
  }, [])

  useEffect(() => {
    carregar()
    if (fonteAtual() !== 'thingspeak') return undefined
    const temporizador = setInterval(carregar, ATUALIZAR_A_CADA_MS)
    return () => clearInterval(temporizador)
  }, [carregar])

  return { ...estado, recarregar: carregar, fonte: fonteAtual() }
}
