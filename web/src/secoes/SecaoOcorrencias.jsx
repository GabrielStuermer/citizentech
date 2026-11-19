// Seção "Ocorrências": formulário (criar/editar) e lista (editar/excluir)
import { useEffect, useRef, useState } from 'react'
import { FormularioOcorrencia } from '../componentes/FormularioOcorrencia.jsx'
import { ListaOcorrencias } from '../componentes/ListaOcorrencias.jsx'
import { MensagemEstado } from '../componentes/MensagemEstado.jsx'
import { useOcorrencias } from '../hooks/useOcorrencias.js'
import { formatarDataHora } from '../utils/formatacao.js'

export function SecaoOcorrencias({ online }) {
  const ocorrencias = useOcorrencias()
  const [emEdicao, setEmEdicao] = useState(null) // ocorrência sendo editada (ou null)
  const { doCache, recarregar } = ocorrencias

  // Sem API ou sem internet: só consulta, não altera
  const bloqueado = doCache || !online

  // Internet voltou: busca a lista de novo sozinho
  const estavaOnline = useRef(online)
  useEffect(() => {
    if (online && !estavaOnline.current && doCache) recarregar()
    estavaOnline.current = online
  }, [online, doCache, recarregar])

  // Ao clicar em Editar, leva o foco para o primeiro campo
  useEffect(() => {
    if (emEdicao) document.getElementById('rua')?.focus()
  }, [emEdicao])

  // Salvar: atualiza se estiver editando, senão cria
  async function salvar(dados) {
    if (emEdicao) {
      const deuCerto = await ocorrencias.atualizar(emEdicao.id, dados)
      if (deuCerto) setEmEdicao(null)
      return deuCerto
    }
    return ocorrencias.criar(dados)
  }

  // Excluiu a que estava em edição: sai do modo de edição
  async function excluir(id) {
    const deuCerto = await ocorrencias.excluir(id)
    if (deuCerto && emEdicao?.id === id) setEmEdicao(null)
  }

  return (
    <section id="ocorrencias" className="secao" aria-labelledby="ocorrencias-titulo">
      <h2 id="ocorrencias-titulo" className="secao__titulo">Ocorrências de alagamento</h2>
      <p className="secao__intro">Avisos dos moradores sobre ruas alagadas no bairro.</p>

      {/* Resultado da última operação (sucesso ou erro) */}
      {ocorrencias.aviso && (
        <MensagemEstado tipo={ocorrencias.aviso.tipo} titulo={ocorrencias.aviso.texto}>
          {ocorrencias.aviso.orientacao && <p>{ocorrencias.aviso.orientacao}</p>}
        </MensagemEstado>
      )}

      {/* Mostrando a cópia salva no aparelho */}
      {doCache && (
        <MensagemEstado tipo="aviso" titulo="Sem conexão com o servidor de ocorrências." acao={{ rotulo: 'Tentar de novo', onClick: recarregar }}>
          <p>
            Mostrando a lista salva neste aparelho em {formatarDataHora(ocorrencias.salvoEm)}. Para registrar,
            editar ou excluir, aguarde a conexão voltar.
          </p>
        </MensagemEstado>
      )}

      <div className="ocorrencias__grade">
        {/* key muda ao trocar de ocorrência: o formulário recomeça com os dados certos */}
        <FormularioOcorrencia
          key={emEdicao?.id ?? 'nova'}
          ocorrencia={emEdicao}
          enviando={ocorrencias.operacao === 'criando' || ocorrencias.operacao === 'atualizando'}
          bloqueado={bloqueado}
          onSalvar={salvar}
          onCancelar={() => setEmEdicao(null)}
        />

        {/* Lista com os estados carregando / erro / sucesso */}
        <div className="ocorrencias__lista">
          <h3 className="ocorrencias__lista-titulo">Ocorrências registradas</h3>
          {ocorrencias.status === 'carregando' && <MensagemEstado tipo="carregando" titulo="Carregando ocorrências…" />}
          {ocorrencias.status === 'erro' && (
            <MensagemEstado tipo="erro" titulo={ocorrencias.erro.message} acao={{ rotulo: 'Tentar de novo', onClick: recarregar }}>
              <p>{ocorrencias.erro.orientacao}</p>
            </MensagemEstado>
          )}
          {ocorrencias.status === 'sucesso' && (
            <ListaOcorrencias
              ocorrencias={ocorrencias.ocorrencias}
              idEmEdicao={emEdicao?.id}
              excluindo={ocorrencias.operacao === 'excluindo'}
              bloqueado={bloqueado || ocorrencias.operacao !== null}
              onEditar={setEmEdicao}
              onExcluir={excluir}
            />
          )}
        </div>
      </div>
    </section>
  )
}
