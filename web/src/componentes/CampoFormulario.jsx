// Campo de formulário acessível: rótulo (<label>), texto de ajuda e erro.
//
// O campo em si (input, select, textarea) é passado como uma função que
// recebe as propriedades de acessibilidade já prontas:
//   <CampoFormulario id="rua" rotulo="Rua" erro={erros.rua}>
//     {(props) => <input {...props} value={rua} onChange={...} />}
//   </CampoFormulario>
// Assim o leitor de tela sempre lê o rótulo, a ajuda e o erro do campo.
import { Icone } from './Icone.jsx'

export function CampoFormulario({ id, rotulo, ajuda, erro, obrigatorio = true, children }) {
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
