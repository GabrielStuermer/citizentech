// Lista das ocorrências de alagamento (a mais recente primeiro).
// Sem ocorrências, mostra uma mensagem de "sem dados" explicando o que fazer.
import { ItemOcorrencia } from './ItemOcorrencia.jsx'
import { MensagemEstado } from './MensagemEstado.jsx'

export function ListaOcorrencias({ ocorrencias, idEmEdicao, excluindo, bloqueado, onEditar, onExcluir }) {
  if (ocorrencias.length === 0) {
    return (
      <MensagemEstado tipo="vazio" titulo="Nenhuma ocorrência registrada ainda.">
        Viu a água subindo na sua rua? Use o formulário para avisar a vizinhança.
      </MensagemEstado>
    )
  }

  return (
    <ul className="lista-ocorrencias">
      {ocorrencias.map((ocorrencia) => (
        <ItemOcorrencia
          key={ocorrencia.id}
          ocorrencia={ocorrencia}
          emEdicao={ocorrencia.id === idEmEdicao}
          excluindo={excluindo}
          bloqueado={bloqueado}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </ul>
  )
}
