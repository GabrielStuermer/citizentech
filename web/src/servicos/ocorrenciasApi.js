// Único arquivo que conhece a API do CRUD: trocar de API = mexer só aqui
const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const RECURSO = `${URL_BASE}/ocorrencias`
const TEMPO_LIMITE_MS = 8000 // desiste da requisição depois de 8 s

// Erro com tipo e orientação de como prosseguir, para mostrar na tela
export class ErroApi extends Error {
  constructor(tipo, mensagem, orientacao) {
    super(mensagem)
    this.name = 'ErroApi'
    this.tipo = tipo
    this.orientacao = orientacao
  }
}

// Traduz o código HTTP de erro em mensagem amigável
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

// fetch com tempo limite, JSON e tratamento de erro em um lugar só
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
    // Passou do tempo limite
    if (erro.name === 'AbortError') {
      throw new ErroApi('tempo',
        'O servidor demorou demais para responder.',
        'Verifique sua conexão e tente de novo.')
    }
    // Sem conexão ou API desligada
    throw new ErroApi('rede',
      'Não foi possível conectar ao servidor de ocorrências.',
      'Verifique sua internet. Se estiver testando no computador, confira se a API está rodando (npm run api).')
  } finally {
    clearTimeout(temporizador)
  }

  if (!resposta.ok) throw erroPorStatus(resposta.status)
  const texto = await resposta.text()
  return texto ? JSON.parse(texto) : null // DELETE pode voltar sem corpo
}

// GET /ocorrencias
export function listarOcorrencias() {
  return requisitar(RECURSO)
}

// POST /ocorrencias
export function criarOcorrencia(dados) {
  return requisitar(RECURSO, { method: 'POST', body: JSON.stringify(dados) })
}

// PUT /ocorrencias/:id
export function atualizarOcorrencia(id, dados) {
  return requisitar(`${RECURSO}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...dados, id }),
  })
}

// DELETE /ocorrencias/:id
export async function excluirOcorrencia(id) {
  await requisitar(`${RECURSO}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
