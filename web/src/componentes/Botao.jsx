// Botão padrão (primario, secundario, perigo) com estado "carregando"
import { Icone } from './Icone.jsx'

export function Botao({
  variante = 'primario',
  icone,
  carregando = false,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...resto // demais props (onClick, ref, aria-*) vão direto para o <button>
}) {
  return (
    <button
      type={type}
      className={`botao botao--${variante} ${className}`}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {/* Carregando: troca o ícone por um que gira e desativa o botão */}
      {carregando ? <Icone nome="carregando" className="icone--girando" /> : icone && <Icone nome={icone} />}
      <span>{children}</span>
    </button>
  )
}
