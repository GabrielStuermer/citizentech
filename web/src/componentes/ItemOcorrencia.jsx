// Uma ocorrência da lista, com Editar e Excluir (com confirmação)
import { useEffect, useRef, useState } from 'react'
import { Botao } from './Botao.jsx'
import { buscarGravidade } from '../dominio/ocorrencias.js'
import { formatarDataHora } from '../utils/formatacao.js'

export function ItemOcorrencia({ ocorrencia, emEdicao, excluindo, bloqueado, onEditar, onExcluir }) {
  const [confirmando, setConfirmando] = useState(false)
  const botaoNaoRef = useRef(null)
  const gravidade = buscarGravidade(ocorrencia.gravidade)
  const idTitulo = `ocorrencia-${ocorrencia.id}`

  // Ao pedir confirmação, o foco vai para "Não" (evita excluir sem querer)
  useEffect(() => {
    if (confirmando) botaoNaoRef.current?.focus()
  }, [confirmando])

  return (
    <li className={`ocorrencia ${emEdicao ? 'ocorrencia--em-edicao' : ''}`} aria-labelledby={idTitulo}>
      <div className="ocorrencia__topo">
        <h4 id={idTitulo} className="ocorrencia__rua">{ocorrencia.rua}</h4>
        {gravidade && (
          <span className={`gravidade gravidade--${gravidade.valor}`}>Gravidade: {gravidade.curto}</span>
        )}
      </div>
      <p className="ocorrencia__data">
        <time dateTime={ocorrencia.data}>{formatarDataHora(new Date(ocorrencia.data))}</time>
        {emEdicao && <strong> · sendo editada</strong>}
      </p>
      <p className="ocorrencia__descricao">{ocorrencia.descricao}</p>

      {/* Confirmação na própria tela, ou os botões Editar/Excluir */}
      {confirmando ? (
        <div className="ocorrencia__confirmacao" role="group" aria-label="Confirmar exclusão">
          <p>Excluir esta ocorrência? Essa ação não pode ser desfeita.</p>
          <div className="ocorrencia__acoes">
            <Botao variante="perigo" icone="excluir" carregando={excluindo} onClick={() => onExcluir(ocorrencia.id)}>
              Sim, excluir
            </Botao>
            <Botao ref={botaoNaoRef} variante="secundario" onClick={() => setConfirmando(false)} disabled={excluindo}>
              Não
            </Botao>
          </div>
        </div>
      ) : (
        <div className="ocorrencia__acoes">
          <Botao variante="secundario" icone="editar" onClick={() => onEditar(ocorrencia)} disabled={bloqueado}
            aria-describedby={idTitulo}>
            Editar
          </Botao>
          <Botao variante="secundario" icone="excluir" onClick={() => setConfirmando(true)} disabled={bloqueado}
            aria-describedby={idTitulo}>
            Excluir
          </Botao>
        </div>
      )}
    </li>
  )
}
