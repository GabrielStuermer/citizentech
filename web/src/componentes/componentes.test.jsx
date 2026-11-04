// Testes dos componentes: verificam o que a pessoa vê e faz na tela.
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import config from '@dados/config_alertas.json'
import { carregarFaixas } from '../dominio/faixas.js'
import { statusAtual } from '../dominio/analise.js'
import { CartaoNivelAtual } from './CartaoNivelAtual.jsx'
import { FormularioOcorrencia } from './FormularioOcorrencia.jsx'
import { IndicadorFaixa } from './IndicadorFaixa.jsx'
import { ListaOcorrencias } from './ListaOcorrencias.jsx'
import { MensagemEstado } from './MensagemEstado.jsx'

const faixas = carregarFaixas(config)

function serie(niveis) {
  const inicio = new Date('2026-11-05T00:00:00').getTime()
  return niveis.map((nivelCm, i) => ({ timestamp: new Date(inicio + i * 600000), nivelCm, estacao: 'Teste' }))
}

describe('IndicadorFaixa', () => {
  it('mostra o nome da faixa em texto (não depende só da cor)', () => {
    render(<IndicadorFaixa faixa={faixas[3]} />)
    expect(screen.getByText('Crítico')).toBeInTheDocument()
  })
})

describe('MensagemEstado', () => {
  it('erro é anunciado como alerta e oferece ação', async () => {
    const tentarDeNovo = vi.fn()
    render(<MensagemEstado tipo="erro" titulo="Falhou" acao={{ rotulo: 'Tentar de novo', onClick: tentarDeNovo }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou')
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(tentarDeNovo).toHaveBeenCalledOnce()
  })

  it('sucesso é anunciado como status', () => {
    render(<MensagemEstado tipo="sucesso" titulo="Salvo" />)
    expect(screen.getByRole('status')).toHaveTextContent('Salvo')
  })
})

describe('CartaoNivelAtual', () => {
  it('mostra faixa, mensagem e tempo até o crítico', () => {
    const status = statusAtual(serie([180, 185, 190, 195, 200, 205, 210]), faixas) // 30 cm/h
    render(<CartaoNivelAtual status={status} />)
    expect(screen.getByText('Alerta')).toBeInTheDocument()
    expect(screen.getByText(faixas[2].mensagem)).toBeInTheDocument()
    expect(screen.getByText('1 h 20 min')).toBeInTheDocument()
    expect(screen.getByText('210,0 cm')).toBeInTheDocument()
  })

  it('avisa quando a água já atingiu o crítico', () => {
    const status = statusAtual(serie([255, 256]), faixas)
    render(<CartaoNivelAtual status={status} />)
    expect(screen.getByText(/JÁ ATINGIU/)).toBeInTheDocument()
  })
})

describe('FormularioOcorrencia', () => {
  it('mostra os erros e leva o foco ao primeiro campo inválido', async () => {
    const onSalvar = vi.fn()
    render(<FormularioOcorrencia enviando={false} onSalvar={onSalvar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar aviso' }))

    expect(onSalvar).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Faltam corrigir 3 campos.')
    const campoRua = screen.getByLabelText('Rua ou ponto de referência')
    expect(campoRua).toHaveFocus()
    expect(campoRua).toHaveAttribute('aria-invalid', 'true')
    expect(campoRua).toHaveAccessibleDescription(/Informe a rua/)
  })

  it('envia os dados válidos sem espaços extras', async () => {
    const onSalvar = vi.fn().mockResolvedValue(true)
    render(<FormularioOcorrencia enviando={false} onSalvar={onSalvar} />)

    await userEvent.type(screen.getByLabelText('Rua ou ponto de referência'), '  Rua A (exemplo)  ')
    await userEvent.click(screen.getByLabelText('Média: água entrando nas casas'))
    await userEvent.type(screen.getByLabelText('O que está acontecendo?'), 'Água entrando no térreo')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar aviso' }))

    expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
      rua: 'Rua A (exemplo)',
      gravidade: 'media',
      descricao: 'Água entrando no térreo',
    }))
  })

  it('fica bloqueado quando não há conexão com a API', () => {
    render(<FormularioOcorrencia enviando={false} bloqueado onSalvar={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Enviar aviso' })).toBeDisabled()
  })
})

describe('ListaOcorrencias', () => {
  const ocorrencia = { id: '1', rua: 'Rua A', descricao: 'Água na calçada', gravidade: 'baixa', data: '2026-11-05T00:40' }

  it('mostra mensagem de lista vazia', () => {
    render(<ListaOcorrencias ocorrencias={[]} onEditar={vi.fn()} onExcluir={vi.fn()} />)
    expect(screen.getByText('Nenhuma ocorrência registrada ainda.')).toBeInTheDocument()
  })

  it('pede confirmação antes de excluir', async () => {
    const onExcluir = vi.fn()
    render(<ListaOcorrencias ocorrencias={[ocorrencia]} onEditar={vi.fn()} onExcluir={onExcluir} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onExcluir).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Não' })).toHaveFocus() // opção segura

    await userEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }))
    expect(onExcluir).toHaveBeenCalledWith('1')
  })
})
