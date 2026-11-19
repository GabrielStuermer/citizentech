// Estado do CRUD de ocorrências: lista, carregamento, erros, cache e avisos
import { useCallback, useEffect, useState } from 'react'
import * as api from '../servicos/ocorrenciasApi.js'
import { lerDoCache, salvarNoCache } from '../servicos/cache.js'
import { ordenarPorData } from '../dominio/ocorrencias.js'

const CHAVE_CACHE = 'ocorrencias'

export function useOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [status, setStatus] = useState('carregando')
  const [erro, setErro] = useState(null)
  const [doCache, setDoCache] = useState(false)   // lista veio do aparelho, não da API
  const [salvoEm, setSalvoEm] = useState(null)
  const [operacao, setOperacao] = useState(null)  // 'criando', 'atualizando' ou 'excluindo'
  const [aviso, setAviso] = useState(null)        // mensagem de sucesso ou erro da última operação

  // Altera a lista e mantém a ordem (mais recente primeiro)
  function alterarLista(transformar) {
    setOcorrencias((anterior) => ordenarPorData(transformar(anterior)))
  }

  // Toda lista boa vinda da API é salva no aparelho
  useEffect(() => {
    if (status === 'sucesso' && !doCache) salvarNoCache(CHAVE_CACHE, ocorrencias)
  }, [ocorrencias, status, doCache])

  // Busca a lista na API; se falhar, mostra a cópia salva
  const carregar = useCallback(async () => {
    setStatus('carregando')
    setErro(null)
    try {
      const lista = await api.listarOcorrencias()
      setOcorrencias(ordenarPorData(lista))
      setDoCache(false)
      setStatus('sucesso')
    } catch (falha) {
      setErro(falha)
      const salvo = lerDoCache(CHAVE_CACHE)
      if (salvo) {
        setOcorrencias(salvo.valor)
        setSalvoEm(salvo.salvoEm)
        setDoCache(true)
        setStatus('sucesso')
      } else {
        setStatus('erro')
      }
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Roda uma operação e mostra o resultado; devolve true se deu certo
  async function executar(nomeOperacao, acao, textoSucesso) {
    setOperacao(nomeOperacao)
    setAviso(null)
    try {
      await acao()
      setAviso({ tipo: 'sucesso', texto: textoSucesso })
      return true
    } catch (falha) {
      setAviso({ tipo: 'erro', texto: falha.message, orientacao: falha.orientacao })
      if (falha.tipo === 'nao-encontrado') carregar() // já foi excluída: recarrega a lista
      return false
    } finally {
      setOperacao(null)
    }
  }

  // Criar, atualizar e excluir: chama a API e atualiza a lista na tela
  const criar = (dados) =>
    executar('criando', async () => {
      const nova = await api.criarOcorrencia(dados)
      alterarLista((lista) => [...lista, nova])
    }, 'Ocorrência registrada. Obrigado por avisar a vizinhança!')

  const atualizar = (id, dados) =>
    executar('atualizando', async () => {
      const atualizada = await api.atualizarOcorrencia(id, dados)
      alterarLista((lista) => lista.map((o) => (o.id === id ? atualizada : o)))
    }, 'Ocorrência atualizada.')

  const excluir = (id) =>
    executar('excluindo', async () => {
      await api.excluirOcorrencia(id)
      alterarLista((lista) => lista.filter((o) => o.id !== id))
    }, 'Ocorrência excluída.')

  return {
    ocorrencias, status, erro, doCache, salvoEm, operacao, aviso,
    recarregar: carregar, criar, atualizar, excluir,
    limparAviso: () => setAviso(null),
  }
}
