// Seção "Ocorrências": CRUD de ocorrências de alagamento relatadas por moradores.
// Liga o hook useOcorrencias (dados) ao formulário e à lista (apresentação).
import { useEffect, useRef, useState } from 'react'
import { FormularioOcorrencia } from '../componentes/FormularioOcorrencia.jsx'
import { ListaOcorrencias } from '../componentes/ListaOcorrencias.jsx'
import { MensagemEstado } from '../componentes/MensagemEstado.jsx'
import { useOcorrencias } from '../hooks/useOcorrencias.js'
import { formatarDataHora } from '../utils/formatacao.js'

export function SecaoOcorrencias({ online }) {
  const ocorrencias = useOcorrencias()
  const [emEdicao, setEmEdicao] = useState(null)
  const { doCache, recarregar } = ocorrencias

  // Sem API (lista do cache) ou sem internet: só dá para consultar.
  const bloqueado = doCache || !online

  // A internet VOLTOU (estava sem e agora tem) e a lista era a salva no
  // aparelho: busca de novo. Guardamos o valor anterior para detectar a mudança.
  const estavaOnline = useRef(online)
  useEffect(() => {
    if (online && !estavaOnline.current && doCache) recarregar()
    estavaOnline.current = online
  }, [online, doCache, recarregar])

  // Ao começar a editar, leva o foco para o primeiro campo do formulário.
  useEffect(() => {
    if (emEdicao) document.getElementById('rua')?.focus()
  }, [emEdicao])

  async function salvar(dados) {
    if (emEdicao) {
      const deuCerto = await ocorrencias.atualizar(emEdicao.id, dados)
      if (deuCerto) setEmEdicao(null)
      return deuCerto
    }
    return ocorrencias.criar(dados)
  }

  async function excluir(id) {
    const deuCerto = await ocorrencias.excluir(id)
    if (deuCerto && emEdicao?.id === id) setEmEdicao(null)
  }

  return (
    <section id="ocorrencias" className="secao" aria-labelledby="ocorrencias-titulo">
      <h2 id="ocorrencias-titulo" className="secao__titulo">Ocorrências de alagamento</h2>
      <p className="secao__intro">Avisos dos moradores sobre ruas alagadas no bairro.</p>

      {ocorrencias.aviso && (
        <MensagemEstado tipo={ocorrencias.aviso.tipo} titulo={ocorrencias.aviso.texto}>
          {ocorrencias.aviso.orientacao && <p>{ocorrencias.aviso.orientacao}</p>}
        </MensagemEstado>
      )}

      {doCache && (
        <MensagemEstado tipo="aviso" titulo="Sem conexão com o servidor de ocorrências." acao={{ rotulo: 'Tentar de novo', onClick: recarregar }}>
          <p>
            Mostrando a lista salva neste aparelho em {formatarDataHora(ocorrencias.salvoEm)}. Para registrar,
            editar ou excluir, aguarde a conexão voltar.
          </p>
        </MensagemEstado>
      )}

      <div className="ocorrencias__grade">
        <FormularioOcorrencia
          key={emEdicao?.id ?? 'nova'}
          ocorrencia={emEdicao}
          enviando={ocorrencias.operacao === 'criando' || ocorrencias.operacao === 'atualizando'}
          bloqueado={bloqueado}
          onSalvar={salvar}
          onCancelar={() => setEmEdicao(null)}
        />

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
