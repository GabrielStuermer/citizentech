// Acesso à API de ocorrências de alagamento (CRUD).
//
// ESTE É O ÚNICO ARQUIVO QUE CONHECE A API. Hoje ela é um json-server local
// (provisório). Quando a API definitiva for escolhida, basta adaptar as
// funções abaixo: o resto do app continua igual.
//
// Endereço configurável no arquivo .env (veja .env.example):
//   VITE_API_URL=http://localhost:3001

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const RECURSO = `${URL_BASE}/ocorrencias`
const TEMPO_LIMITE_MS = 8000

/**
 * Erro de API com uma mensagem simples para o morador e uma orientação
 * de como prosseguir.
 * tipo: 'rede' | 'tempo' | 'nao-encontrado' | 'dados-invalidos' | 'servidor'
 */
export class ErroApi extends Error {
  constructor(tipo, mensagem, orientacao) {
    super(mensagem)
    this.name = 'ErroApi'
    this.tipo = tipo
    this.orientacao = orientacao
  }
}

/** Converte o código HTTP de erro em um ErroApi com texto amigável. */
function erroPorStatus(status) {
  if (status === 404) {
    return new ErroApi('nao-encontrado',
      'Esta ocorrência não foi encontrada. Talvez ela já tenha sido excluída.',
      'Atualize a lista para ver as ocorrências atuais.')
  }
  if (status === 400 || status === 422) {
    return new ErroApi('dados-invalidos',
      'O servidor não aceitou os dados enviados.',
      'Confira os campos do formulário e tente de novo.')
  }
  return new ErroApi('servidor',
    `O servidor teve um problema (código ${status}).`,
    'Aguarde alguns minutos e tente de novo.')
}

/**
 * Faz uma requisição com tempo limite e transforma qualquer falha em ErroApi.
 * @returns {Promise<any>} o JSON da resposta (ou null quando não há corpo)
 */
async function requisitar(url, opcoes = {}) {
  const controle = new AbortController()
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS)

  let resposta
  try {
    resposta = await fetch(url, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
      signal: controle.signal,
    })
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw new ErroApi('tempo',
        'O servidor demorou demais para responder.',
        'Verifique sua conexão e tente de novo.')
    }
    throw new ErroApi('rede',
      'Não foi possível conectar ao servidor de ocorrências.',
      'Verifique sua internet. Se estiver testando no computador, confira se a API está rodando (npm run api).')
  } finally {
    clearTimeout(temporizador)
  }

  if (!resposta.ok) throw erroPorStatus(resposta.status)
  const texto = await resposta.text()
  return texto ? JSON.parse(texto) : null
}

// ---------------- Operações do CRUD ----------------

/** Consultar: lista todas as ocorrências. */
export function listarOcorrencias() {
  return requisitar(RECURSO)
}

/** Criar: envia uma nova ocorrência e devolve a ocorrência salva (com id). */
export function criarOcorrencia(dados) {
  return requisitar(RECURSO, { method: 'POST', body: JSON.stringify(dados) })
}

/** Atualizar: substitui os dados de uma ocorrência existente. */
export function atualizarOcorrencia(id, dados) {
  return requisitar(`${RECURSO}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...dados, id }),
  })
}

/** Excluir: remove uma ocorrência. */
export async function excluirOcorrencia(id) {
  await requisitar(`${RECURSO}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
