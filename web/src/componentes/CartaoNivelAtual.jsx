// Cartão principal: o que o morador precisa saber AGORA.
// Ordem pensada para quem está sob estresse: faixa e o que fazer primeiro,
// depois o tempo até o crítico, e por fim os números de apoio.
import { Icone } from './Icone.jsx'
import { IndicadorFaixa } from './IndicadorFaixa.jsx'
import {
  formatarDataHora,
  formatarDuracao,
  formatarHora,
  formatarNivel,
  formatarVelocidade,
  textoTendencia,
} from '../utils/formatacao.js'

/** Texto principal sobre o tempo até o nível crítico. */
function TempoAteCritico({ minutos, limiteCm, momentoLeitura }) {
  if (minutos === 0) {
    return <p className="cartao__tempo cartao__tempo--urgente">A água JÁ ATINGIU o nível crítico.</p>
  }
  if (minutos === null) {
    return (
      <p className="cartao__tempo">
        A água não está subindo agora. <span className="cartao__tempo-apoio">Sem previsão de chegar ao nível crítico ({formatarNivel(limiteCm)}).</span>
      </p>
    )
  }
  const previsao = new Date(momentoLeitura.getTime() + minutos * 60000)
  return (
    <p className="cartao__tempo">
      Nível crítico em cerca de <strong className="cartao__tempo-numero">{formatarDuracao(minutos)}</strong>
      <span className="cartao__tempo-apoio">
        por volta das {formatarHora(previsao)}, se a água continuar subindo neste ritmo.
      </span>
    </p>
  )
}

/**
 * @param {{status: ReturnType<import('../dominio/analise.js').statusAtual>, desatualizado?: boolean}} props
 */
export function CartaoNivelAtual({ status, desatualizado = false }) {
  const { leitura, faixa, velocidadeCmH, tendencia, limiteCriticoCm, minutosAteCritico } = status

  return (
    <article className={`cartao cartao--${faixa.chave}`} aria-labelledby="cartao-titulo">
      <header className="cartao__topo">
        <h2 id="cartao-titulo" className="cartao__titulo">Situação da água</h2>
        <IndicadorFaixa faixa={faixa} tamanho="grande" />
      </header>

      <p className="cartao__mensagem">{faixa.mensagem}</p>

      <TempoAteCritico minutos={minutosAteCritico} limiteCm={limiteCriticoCm} momentoLeitura={leitura.timestamp} />

      <dl className="cartao__dados">
        <div>
          <dt>Nível agora</dt>
          <dd className="cartao__nivel">{formatarNivel(leitura.nivelCm)}</dd>
        </div>
        <div>
          <dt>Tendência</dt>
          <dd className="cartao__tendencia">
            <Icone nome={tendencia === 'sem-dados' ? 'info' : tendencia} />
            {textoTendencia(tendencia)}
            {velocidadeCmH !== null && <span className="cartao__velocidade"> ({formatarVelocidade(velocidadeCmH)})</span>}
          </dd>
        </div>
        <div>
          <dt>Nível crítico</dt>
          <dd>{formatarNivel(limiteCriticoCm)}</dd>
        </div>
        <div>
          <dt>Última leitura</dt>
          <dd>
            <time dateTime={leitura.timestamp.toISOString()}>{formatarDataHora(leitura.timestamp)}</time>
            {desatualizado && <span className="cartao__desatualizado"> (desatualizada)</span>}
          </dd>
        </div>
      </dl>
    </article>
  )
}
