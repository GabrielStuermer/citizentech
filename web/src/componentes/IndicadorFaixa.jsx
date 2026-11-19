// Selo da faixa: cor + ícone de formato diferente + texto (nunca só cor)
import { Icone } from './Icone.jsx'

export function IndicadorFaixa({ faixa, tamanho = 'normal' }) {
  return (
    <span className={`faixa faixa--${faixa.chave} faixa--${tamanho}`}>
      <Icone nome={faixa.chave} tamanho={tamanho === 'grande' ? 32 : 22} />
      <span className="faixa__texto">{faixa.rotulo}</span>
    </span>
  )
}
