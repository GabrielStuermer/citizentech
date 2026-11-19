// Campo de formulário acessível: rótulo, ajuda e erro ligados ao campo
import { Icone } from './Icone.jsx'

export function CampoFormulario({ id, rotulo, ajuda, erro, obrigatorio = true, children }) {
  // IDs da ajuda e do erro, lidos pelo leitor de tela via aria-describedby
  const idAjuda = ajuda ? `${id}-ajuda` : null
  const idErro = erro ? `${id}-erro` : null
  const descritoPor = [idAjuda, idErro].filter(Boolean).join(' ') || undefined

  return (
    <div className={`campo ${erro ? 'campo--com-erro' : ''}`}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
        {!obrigatorio && <span className="campo__opcional"> (opcional)</span>}
      </label>
      {ajuda && <p className="campo__ajuda" id={idAjuda}>{ajuda}</p>}
      {erro && (
        <p className="campo__erro" id={idErro}>
          <Icone nome="erro" tamanho={20} />
          <span>{erro}</span>
        </p>
      )}
      {/* O campo em si vem de fora (input ou textarea) e recebe as props de acessibilidade */}
      {children({
        id,
        name: id,
        required: obrigatorio,
        'aria-invalid': erro ? true : undefined,
        'aria-describedby': descritoPor,
      })}
    </div>
  )
}
