// Testes das regras de negócio (sem React).
import { describe, expect, it } from 'vitest'
import config from '@dados/config_alertas.json'
import csvSimulado from '@dados/niveis_simulados.csv?raw'
import { buscarFaixa, carregarFaixas, classificarNivel } from './faixas.js'
import { estaDesatualizada, leiturasAte, lerCsv, ultimasHoras, validarLeitura } from './leituras.js'
import {
  calcularAntecedencia,
  minutosAteCritico,
  statusAtual,
  tendencia,
  velocidadeSubida,
} from './analise.js'
import { ordenarPorData, validarOcorrencia } from './ocorrencias.js'

const faixas = carregarFaixas(config)
const INICIO = new Date('2026-11-04T00:00:00')

/** Cria leituras artificiais a cada `intervaloMin` minutos. */
function serie(niveis, intervaloMin = 10) {
  return niveis.map((nivelCm, i) => ({
    timestamp: new Date(INICIO.getTime() + i * intervaloMin * 60000),
    nivelCm,
    estacao: 'Teste',
  }))
}

describe('faixas', () => {
  it('carrega as quatro faixas do config real em ordem', () => {
    expect(faixas.map((f) => f.chave)).toEqual(['normal', 'atencao', 'alerta', 'critico'])
  })

  it.each([
    [0, 'normal'], [149.9, 'normal'], [150, 'atencao'],
    [200, 'alerta'], [250, 'critico'], [400, 'critico'],
  ])('nível %s cm fica na faixa %s', (nivel, esperada) => {
    expect(classificarNivel(nivel, faixas).chave).toBe(esperada)
  })

  it('recusa configuração com faixa faltando', () => {
    expect(() => carregarFaixas({ faixas: { normal: {} } })).toThrow('faixas ausentes')
  })

  it('recusa limites fora de ordem', () => {
    const f = (codigo, limite) => ({ codigo, a_partir_de_cm: limite, rotulo: 'x', mensagem: 'x' })
    const ruim = { faixas: { normal: f(0, 0), atencao: f(1, 220), alerta: f(2, 200), critico: f(3, 250) } }
    expect(() => carregarFaixas(ruim)).toThrow('precisa ser maior')
  })
})

describe('leituras', () => {
  it('valida uma leitura correta', () => {
    const leitura = validarLeitura({ timestamp: '2026-11-04T12:00:00', nivel_cm: '182.5', estacao: 'Humaitá' })
    expect(leitura.nivelCm).toBe(182.5)
    expect(leitura.timestamp).toEqual(new Date('2026-11-04T12:00:00'))
  })

  it.each([
    [{ timestamp: '04/11/2026 12:00', nivel_cm: '10', estacao: 'H' }, 'data/hora inválida'],
    [{ timestamp: '2026-11-04T12:00:00', nivel_cm: 'abc', estacao: 'H' }, 'não é um número'],
    [{ timestamp: '2026-11-04T12:00:00', nivel_cm: '', estacao: 'H' }, 'não é um número'],
    [{ timestamp: '2026-11-04T12:00:00', nivel_cm: '-5', estacao: 'H' }, 'fora do possível'],
    [{ timestamp: '2026-11-04T12:00:00', nivel_cm: '999', estacao: 'H' }, 'fora do possível'],
    [{ timestamp: '2026-11-04T12:00:00', nivel_cm: '10', estacao: ' ' }, 'estação vazia'],
  ])('recusa leitura inválida (%o)', (bruto, mensagem) => {
    expect(() => validarLeitura(bruto)).toThrow(mensagem)
  })

  it('lê CSV separando válidas, inválidas e repetidas', () => {
    const texto = [
      'timestamp,nivel_cm,estacao',
      '2026-11-04T00:20:00,82,Humaitá',
      '2026-11-04T00:00:00,80,Humaitá',
      '2026-11-04T00:10:00,erro,Humaitá',
      '2026-11-04T00:00:00,99,Humaitá',
    ].join('\n')
    const { leituras, erros } = lerCsv(texto)
    expect(leituras.map((l) => l.nivelCm)).toEqual([80, 82])
    expect(erros).toHaveLength(2)
    expect(erros[0]).toMatch(/^linha 4:/)
  })

  it('recusa CSV sem coluna obrigatória', () => {
    expect(() => lerCsv('timestamp,nivel\n2026-11-04T00:00:00,1')).toThrow('colunas obrigatórias')
  })

  it('filtra por momento e pelas últimas horas', () => {
    const leituras = serie([1, 2, 3, 4, 5, 6, 7]) // 0 a 60 min
    expect(leiturasAte(leituras, new Date(INICIO.getTime() + 10 * 60000))).toHaveLength(2)
    expect(ultimasHoras(leituras, 0.5)).toHaveLength(4) // 30, 40, 50, 60 min
  })

  it('detecta leitura desatualizada', () => {
    const leitura = new Date('2026-11-04T12:00:00')
    expect(estaDesatualizada(leitura, new Date('2026-11-04T12:20:00'), 30)).toBe(false)
    expect(estaDesatualizada(leitura, new Date('2026-11-04T12:31:00'), 30)).toBe(true)
  })
})

describe('análise', () => {
  it('calcula a velocidade de uma reta perfeita (30 cm/h)', () => {
    expect(velocidadeSubida(serie([100, 105, 110, 115, 120, 125, 130]))).toBeCloseTo(30)
  })

  it('não calcula velocidade com uma leitura só', () => {
    expect(velocidadeSubida(serie([100]))).toBeNull()
  })

  it.each([[10, 'subindo'], [0.5, 'estavel'], [-10, 'descendo'], [null, 'sem-dados']])(
    'velocidade %s -> %s', (v, esperado) => expect(tendencia(v)).toBe(esperado),
  )

  it('estima os minutos até o crítico', () => {
    expect(minutosAteCritico(200, 25, 250)).toBeCloseTo(120)
    expect(minutosAteCritico(260, 0, 250)).toBe(0)
    expect(minutosAteCritico(100, 0, 250)).toBeNull()
  })

  it('monta o status atual', () => {
    const status = statusAtual(serie([180, 185, 190, 195, 200, 205, 210]), faixas)
    expect(status.faixa.chave).toBe('alerta')
    expect(status.tendencia).toBe('subindo')
    expect(status.minutosAteCritico).toBeCloseTo(80)
  })

  it('devolve null no status sem leituras', () => {
    expect(statusAtual([], faixas)).toBeNull()
  })

  it('calcula a antecedência em série artificial', () => {
    expect(calcularAntecedencia(serie([150, 180, 200, 220, 240, 250]), faixas).minutos).toBe(30)
    expect(calcularAntecedencia(serie([80, 90, 210]), faixas)).toBeNull()
  })
})

describe('paridade com o Python (mesmo CSV, mesmos números)', () => {
  const { leituras, erros } = lerCsv(csvSimulado)

  it('lê as 204 leituras simuladas sem erros', () => {
    expect(erros).toEqual([])
    expect(leituras).toHaveLength(204)
  })

  it('dá 110 minutos de antecedência', () => {
    expect(calcularAntecedencia(leituras, faixas).minutos).toBe(110)
  })

  it('às 01:10 do dia 05/11 estima cerca de 106 minutos até o crítico', () => {
    const ateAli = leiturasAte(leituras, new Date('2026-11-05T01:10:00'))
    const status = statusAtual(ateAli, faixas)
    expect(status.faixa.chave).toBe('alerta')
    expect(status.velocidadeCmH).toBeCloseTo(27.3, 1)
    expect(Math.round(status.minutosAteCritico)).toBe(106)
    expect(buscarFaixa('critico', faixas).aPartirDeCm).toBe(250)
  })
})

describe('ocorrências', () => {
  const agora = new Date('2026-11-05T10:00:00')
  const valida = { rua: 'Rua A (exemplo)', descricao: 'Água chegando na calçada', gravidade: 'baixa', data: '2026-11-05T09:30' }

  it('aceita uma ocorrência válida', () => {
    expect(validarOcorrencia(valida, agora)).toEqual({ valido: true, erros: {} })
  })

  it('aponta um erro por campo', () => {
    const { valido, erros } = validarOcorrencia({ rua: 'a', descricao: 'curta', gravidade: 'x', data: '' }, agora)
    expect(valido).toBe(false)
    expect(Object.keys(erros).sort()).toEqual(['data', 'descricao', 'gravidade', 'rua'])
  })

  it('recusa data no futuro', () => {
    const { erros } = validarOcorrencia({ ...valida, data: '2026-11-06T09:00' }, agora)
    expect(erros.data).toMatch(/futuro/)
  })

  it('ordena da mais recente para a mais antiga', () => {
    const lista = [{ id: '1', data: '2026-11-04T10:00' }, { id: '2', data: '2026-11-05T10:00' }]
    expect(ordenarPorData(lista).map((o) => o.id)).toEqual(['2', '1'])
  })
})
