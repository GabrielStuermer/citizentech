// Selo da faixa de alerta: cor + ícone + texto (nunca só cor).
// Cada faixa tem um ícone de formato diferente (círculo, triângulo,
// octógono), o que ajuda quem não distingue cores.
import { Icone } from './Icone.jsx'

/**
 * @param {{faixa: {chave: string, rotulo: string}, tamanho?: 'normal'|'grande'}} props
 */
export function IndicadorFaixa({ faixa, tamanho = 'normal' }) {
  return (
    <span className={`faixa faixa--${faixa.chave} faixa--${tamanho}`}>
      <Icone nome={faixa.chave} tamanho={tamanho === 'grande' ? 32 : 22} />
      <span className="faixa__texto">{faixa.rotulo}</span>
    </span>
  )
}
