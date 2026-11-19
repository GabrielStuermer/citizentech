// Busca as leituras de nível e controla carregando / sucesso / erro / cache
import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarLeituras, fonteAtual } from '../servicos/leiturasFonte.js'
import { lerDoCache, salvarNoCache } from '../servicos/cache.js'

const CHAVE_CACHE = 'leituras'
const ATUALIZAR_A_CADA_MS = 15 * 1000 // ThingSpeak: busca de novo a cada 15 s

// O localStorage só guarda texto: datas viram string e voltam a ser Date
const paraSalvar = (leituras) => leituras.map((l) => ({ ...l, timestamp: l.timestamp.toISOString() }))
const doSalvo = (leituras) => leituras.map((l) => ({ ...l, timestamp: new Date(l.timestamp) }))

export function useLeituras() {
  const [estado, setEstado] = useState({
    status: 'carregando',
    leituras: [],
    errosDeLinha: [],
    erro: null,
    doCache: false,
    salvoEm: null,
  })

  // Número da última busca: ignora respostas antigas que chegarem atrasadas
  const ultimaBusca = useRef(0)

  const carregar = useCallback(async () => {
    const minhaBusca = ++ultimaBusca.current
    // Só mostra "carregando" se ainda não há nada na tela
    setEstado((anterior) => ({ ...anterior, status: anterior.leituras.length ? anterior.status : 'carregando' }))

    try {
      const { leituras, erros } = await buscarLeituras()
      if (minhaBusca !== ultimaBusca.current) return
      salvarNoCache(CHAVE_CACHE, paraSalvar(leituras))
      setEstado({ status: 'sucesso', leituras, errosDeLinha: erros, erro: null, doCache: false, salvoEm: new Date() })
    } catch (erro) {
      if (minhaBusca !== ultimaBusca.current) return
      // Falhou: usa a cópia salva no aparelho, se houver
      const salvo = lerDoCache(CHAVE_CACHE)
      if (salvo) {
        setEstado({ status: 'sucesso', leituras: doSalvo(salvo.valor), errosDeLinha: [], erro, doCache: true, salvoEm: salvo.salvoEm })
      } else {
        setEstado({ status: 'erro', leituras: [], errosDeLinha: [], erro, doCache: false, salvoEm: null })
      }
    }
  }, [])

  // Carrega ao abrir; no ThingSpeak, continua atualizando sozinho
  useEffect(() => {
    carregar()
    if (fonteAtual() !== 'thingspeak') return undefined
    const temporizador = setInterval(carregar, ATUALIZAR_A_CADA_MS)
    return () => clearInterval(temporizador)
  }, [carregar])

  return { ...estado, recarregar: carregar, fonte: fonteAtual() }
}
