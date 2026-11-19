// Lista de ocorrências, ou mensagem de lista vazia
import { ItemOcorrencia } from './ItemOcorrencia.jsx'
import { MensagemEstado } from './MensagemEstado.jsx'

export function ListaOcorrencias({ ocorrencias, idEmEdicao, excluindo, bloqueado, onEditar, onExcluir }) {
  // Estado: vazio
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
