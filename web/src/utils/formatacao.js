// Formatação de números e datas no padrão brasileiro
const numero1Casa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const dataHora = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

// 182.5 -> "182,5 cm"
export function formatarNivel(cm) {
  return `${numero1Casa.format(cm)} cm`
}

// 27.34 -> "+27,3 cm/h" ("|| 0" evita mostrar "-0,0")
export function formatarVelocidade(cmPorHora) {
  const arredondado = Math.round(cmPorHora * 10) / 10 || 0
  const sinal = arredondado > 0 ? '+' : ''
  return `${sinal}${numero1Casa.format(arredondado)} cm/h`
}

// "05/11/2026 01:10"
export function formatarDataHora(data) {
  return dataHora.format(data).replace(',', '')
}

// "01:10"
export function formatarHora(data) {
  return hora.format(data)
}

// 106 -> "1 h 46 min"
export function formatarDuracao(minutos) {
  const total = Math.round(minutos)
  const horas = Math.floor(total / 60)
  const resto = total % 60
  if (horas === 0) return `${resto} min`
  return `${horas} h ${String(resto).padStart(2, '0')} min`
}

// Texto que aparece na tela para cada tendência
export function textoTendencia(tendencia) {
  return {
    subindo: 'Subindo',
    descendo: 'Descendo',
    estavel: 'Estável',
    'sem-dados': 'Sem dados suficientes',
  }[tendencia]
}

// Date -> "AAAA-MM-DDTHH:MM" (formato do <input type="datetime-local">, hora local)
export function paraCampoDataHora(data) {
  const doisDigitos = (n) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}` +
    `T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
}
