// Estado e operações do CRUD de ocorrências.
//
// status: 'carregando' | 'sucesso' | 'erro'
// operacao: o que está sendo enviado agora ('criando', 'atualizando', 'excluindo')
// aviso: mensagem de resultado da última operação ({tipo, texto, orientacao})
// doCache: true quando a lista veio do aparelho porque a API não respondeu
//          (nesse caso só é possível consultar; criar/editar/excluir ficam bloqueados)
import { useCallback, useEffect, useState } from 'react'
import * as api from '../servicos/ocorrenciasApi.js'
import { lerDoCache, salvarNoCache } from '../servicos/cache.js'
import { ordenarPorData } from '../dominio/ocorrencias.js'

const CHAVE_CACHE = 'ocorrencias'

export function useOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [status, setStatus] = useState('carregando')
  const [erro, setErro] = useState(null)
  const [doCache, setDoCache] = useState(false)
  const [salvoEm, setSalvoEm] = useState(null)
  const [operacao, setOperacao] = useState(null)
  const [aviso, setAviso] = useState(null)

  /** Muda a lista a partir da versão mais recente, sempre em ordem de data. */
  function alterarLista(transformar) {
    setOcorrencias((anterior) => ordenarPorData(transformar(anterior)))
  }

  // Sempre que a lista vinda da API muda, guarda uma cópia no aparelho.
  // (Um único lugar salva o cache: fica mais fácil de entender e de testar.)
  useEffect(() => {
    if (status === 'sucesso' && !doCache) salvarNoCache(CHAVE_CACHE, ocorrencias)
  }, [ocorrencias, status, doCache])

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

  /**
   * Executa uma operação de escrita com o tratamento de erro padrão.
   * @returns {Promise<boolean>} true se deu certo
   */
  async function executar(nomeOperacao, acao, textoSucesso) {
    setOperacao(nomeOperacao)
    setAviso(null)
    try {
      await acao()
      setAviso({ tipo: 'sucesso', texto: textoSucesso })
      return true
    } catch (falha) {
      setAviso({ tipo: 'erro', texto: falha.message, orientacao: falha.orientacao })
      // Se a ocorrência sumiu do servidor, a lista da tela está velha: recarrega.
      if (falha.tipo === 'nao-encontrado') carregar()
      return false
    } finally {
      setOperacao(null)
    }
  }

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
