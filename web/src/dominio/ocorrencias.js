// Regras das ocorrências de alagamento (validação e ordenação)

// Níveis de gravidade: valor salvo, texto curto e texto do formulário
export const GRAVIDADES = [
  { valor: 'baixa', curto: 'Baixa', rotulo: 'Baixa: água na calçada' },
  { valor: 'media', curto: 'Média', rotulo: 'Média: água entrando nas casas' },
  { valor: 'alta', curto: 'Alta', rotulo: 'Alta: risco para as pessoas' },
]

export function buscarGravidade(valor) {
  return GRAVIDADES.find((g) => g.valor === valor) ?? null
}

// Tamanhos mínimo e máximo dos campos de texto
export const LIMITES = {
  ruaMin: 3,
  ruaMax: 100,
  descricaoMin: 10,
  descricaoMax: 500,
}

// Formulário em branco
export function ocorrenciaVazia() {
  return { rua: '', descricao: '', gravidade: '', data: '' }
}

// Valida o formulário; devolve { valido, erros } com uma mensagem por campo
export function validarOcorrencia(dados, agora = new Date()) {
  const erros = {}

  const rua = (dados.rua ?? '').trim()
  if (!rua) erros.rua = 'Informe a rua ou o ponto de referência.'
  else if (rua.length < LIMITES.ruaMin) erros.rua = `Use pelo menos ${LIMITES.ruaMin} letras.`
  else if (rua.length > LIMITES.ruaMax) erros.rua = `Use no máximo ${LIMITES.ruaMax} caracteres.`

  const descricao = (dados.descricao ?? '').trim()
  if (!descricao) erros.descricao = 'Conte o que está acontecendo.'
  else if (descricao.length < LIMITES.descricaoMin) erros.descricao = `Escreva pelo menos ${LIMITES.descricaoMin} caracteres.`
  else if (descricao.length > LIMITES.descricaoMax) erros.descricao = `Use no máximo ${LIMITES.descricaoMax} caracteres.`

  if (!GRAVIDADES.some((g) => g.valor === dados.gravidade)) {
    erros.gravidade = 'Escolha a gravidade.'
  }

  // Data obrigatória e não futura (tolerância de 5 min para diferença de relógio)
  const data = new Date(dados.data ?? '')
  if (!dados.data || Number.isNaN(data.getTime())) {
    erros.data = 'Informe a data e a hora.'
  } else if (data.getTime() > agora.getTime() + 5 * 60 * 1000) {
    erros.data = 'A data não pode estar no futuro.'
  }

  return { valido: Object.keys(erros).length === 0, erros }
}

// Limpa os espaços extras antes de enviar para a API
export function normalizarOcorrencia(dados) {
  return {
    rua: dados.rua.trim(),
    descricao: dados.descricao.trim(),
    gravidade: dados.gravidade,
    data: dados.data,
  }
}

// Da mais recente para a mais antiga
export function ordenarPorData(ocorrencias) {
  return [...ocorrencias].sort((a, b) => new Date(b.data) - new Date(a.data))
}
