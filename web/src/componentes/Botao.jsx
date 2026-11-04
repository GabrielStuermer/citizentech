// Botão padrão do app. Tamanho mínimo de toque de 48 px (bom para celular).
// variante: 'primario' | 'secundario' | 'perigo'
// carregando: mostra um ícone girando e impede cliques repetidos.
import { Icone } from './Icone.jsx'

export function Botao({
  variante = 'primario',
  icone,
  carregando = false,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...resto
}) {
  return (
    <button
      type={type}
      className={`botao botao--${variante} ${className}`}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? <Icone nome="carregando" className="icone--girando" /> : icone && <Icone nome={icone} />}
      <span>{children}</span>
    </button>
  )
}
