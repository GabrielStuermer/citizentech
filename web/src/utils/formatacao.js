// Formatação de números, datas e textos para o padrão brasileiro.
// Só apresentação: nenhuma regra de negócio aqui.

const numero1Casa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const dataHora = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** 201.8 -> "201,8 cm" */
export function formatarNivel(cm) {
  return `${numero1Casa.format(cm)} cm`
}

/** 27.34 -> "+27,3 cm/h" */
export function formatarVelocidade(cmPorHora) {
  // Arredonda antes de decidir o sinal: -0,04 vira "0,0" (e não "-0,0").
  const arredondado = Math.round(cmPorHora * 10) / 10 || 0 // "|| 0" troca -0 por 0
  const sinal = arredondado > 0 ? '+' : ''
  return `${sinal}${numero1Casa.format(arredondado)} cm/h`
}

/** Date -> "05/11/2026 01:10" */
export function formatarDataHora(data) {
  return dataHora.format(data).replace(',', '')
}

/** Date -> "01:10" */
export function formatarHora(data) {
  return hora.format(data)
}

/** 106.4 -> "1 h 46 min"; 45 -> "45 min" */
export function formatarDuracao(minutos) {
  const total = Math.round(minutos)
  const horas = Math.floor(total / 60)
  const resto = total % 60
  if (horas === 0) return `${resto} min`
  return `${horas} h ${String(resto).padStart(2, '0')} min`
}

/** Tendência em texto simples. */
export function textoTendencia(tendencia) {
  return {
    subindo: 'Subindo',
    descendo: 'Descendo',
    estavel: 'Estável',
    'sem-dados': 'Sem dados suficientes',
  }[tendencia]
}

/** Date -> "2026-11-05T01:10" (formato do <input type="datetime-local">) */
export function paraCampoDataHora(data) {
  const doisDigitos = (n) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}` +
    `T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
}
