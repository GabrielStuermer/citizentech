// Testes do módulo de API: simulamos o fetch para não depender de servidor.
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ErroApi,
  atualizarOcorrencia,
  criarOcorrencia,
  excluirOcorrencia,
  listarOcorrencias,
} from './ocorrenciasApi.js'
import { lerDoCache, salvarNoCache } from './cache.js'

/** Troca o fetch global por uma versão falsa que devolve `resposta`. */
function simularFetch(resposta) {
  const falso = vi.fn().mockResolvedValue({
    ok: resposta.status >= 200 && resposta.status < 300,
    status: resposta.status,
    text: async () => (resposta.corpo === undefined ? '' : JSON.stringify(resposta.corpo)),
  })
  vi.stubGlobal('fetch', falso)
  return falso
}

afterEach(() => vi.unstubAllGlobals())

describe('ocorrenciasApi', () => {
  it('lista as ocorrências', async () => {
    simularFetch({ status: 200, corpo: [{ id: '1' }] })
    await expect(listarOcorrencias()).resolves.toEqual([{ id: '1' }])
  })

  it('cria com POST e envia os dados em JSON', async () => {
    const fetchFalso = simularFetch({ status: 201, corpo: { id: '9', rua: 'Rua A' } })
    await criarOcorrencia({ rua: 'Rua A' })
    const [url, opcoes] = fetchFalso.mock.calls[0]
    expect(url).toMatch(/\/ocorrencias$/)
    expect(opcoes.method).toBe('POST')
    expect(JSON.parse(opcoes.body)).toEqual({ rua: 'Rua A' })
  })

  it('atualiza com PUT na URL da ocorrência', async () => {
    const fetchFalso = simularFetch({ status: 200, corpo: { id: '9' } })
    await atualizarOcorrencia('9', { rua: 'Rua B' })
    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/ocorrencias\/9$/)
    expect(fetchFalso.mock.calls[0][1].method).toBe('PUT')
  })

  it('exclui com DELETE mesmo sem corpo na resposta', async () => {
    simularFetch({ status: 200 })
    await expect(excluirOcorrencia('9')).resolves.toBeUndefined()
  })

  it('traduz 404 em mensagem amigável com orientação', async () => {
    simularFetch({ status: 404 })
    const erro = await listarOcorrencias().catch((e) => e)
    expect(erro).toBeInstanceOf(ErroApi)
    expect(erro.tipo).toBe('nao-encontrado')
    expect(erro.orientacao).toBeTruthy()
  })

  it('traduz erro 500 em erro de servidor', async () => {
    simularFetch({ status: 500 })
    await expect(listarOcorrencias()).rejects.toMatchObject({ tipo: 'servidor' })
  })

  it('traduz falha de conexão em erro de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(listarOcorrencias()).rejects.toMatchObject({ tipo: 'rede' })
  })
})

describe('cache', () => {
  it('guarda e devolve o valor com a hora em que foi salvo', () => {
    salvarNoCache('teste', [1, 2])
    const item = lerDoCache('teste')
    expect(item.valor).toEqual([1, 2])
    expect(item.salvoEm).toBeInstanceOf(Date)
  })

  it('devolve null quando não há nada salvo', () => {
    expect(lerDoCache('nada')).toBeNull()
  })
})
