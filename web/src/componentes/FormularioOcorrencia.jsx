// Formulário para criar ou editar uma ocorrência, com validação por campo
import { useRef, useState } from 'react'
import { Botao } from './Botao.jsx'
import { CampoFormulario } from './CampoFormulario.jsx'
import { Icone } from './Icone.jsx'
import {
  GRAVIDADES,
  LIMITES,
  normalizarOcorrencia,
  ocorrenciaVazia,
  validarOcorrencia,
} from '../dominio/ocorrencias.js'
import { paraCampoDataHora } from '../utils/formatacao.js'

// Ordem dos campos na tela: o foco vai para o primeiro com erro
const ORDEM_CAMPOS = ['rua', 'gravidade', 'descricao', 'data']

export function FormularioOcorrencia({ ocorrencia = null, enviando, bloqueado = false, onSalvar, onCancelar }) {
  const editando = ocorrencia !== null
  // Editando: começa com os dados da ocorrência. Nova: começa com a data/hora de agora
  const [valores, setValores] = useState(() =>
    editando ? { ...ocorrenciaVazia(), ...ocorrencia } : { ...ocorrenciaVazia(), data: paraCampoDataHora(new Date()) },
  )
  const [erros, setErros] = useState({})
  const formularioRef = useRef(null)

  // Atualiza um campo e apaga o erro dele assim que a pessoa corrige
  function mudarCampo(campo, valor) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }))
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  // Valida; com erro, mostra e foca o primeiro campo; sem erro, envia
  async function aoEnviar(evento) {
    evento.preventDefault() // não recarrega a página
    const resultado = validarOcorrencia(valores)
    if (!resultado.valido) {
      setErros(resultado.erros)
      const primeiro = ORDEM_CAMPOS.find((campo) => resultado.erros[campo])
      formularioRef.current.querySelector(`[name="${primeiro}"]`)?.focus()
      return
    }
    setErros({})
    const deuCerto = await onSalvar(normalizarOcorrencia(valores))
    if (deuCerto && !editando) { // criou: limpa o formulário
      setValores({ ...ocorrenciaVazia(), data: paraCampoDataHora(new Date()) })
    }
  }

  const qtdErros = Object.values(erros).filter(Boolean).length

  return (
    <form ref={formularioRef} className="formulario" onSubmit={aoEnviar} noValidate aria-labelledby="formulario-titulo">
      <h3 id="formulario-titulo" className="formulario__titulo">
        {editando ? 'Editar ocorrência' : 'Avisar sobre um alagamento'}
      </h3>

      {/* Resumo dos erros, anunciado pelo leitor de tela */}
      {qtdErros > 0 && (
        <p className="formulario__resumo-erros" role="alert">
          <Icone nome="erro" />
          {qtdErros === 1 ? 'Falta corrigir 1 campo.' : `Faltam corrigir ${qtdErros} campos.`}
        </p>
      )}

      <CampoFormulario id="rua" rotulo="Rua ou ponto de referência" ajuda="Ex.: esquina da Rua A com a Rua B" erro={erros.rua}>
        {(props) => (
          <input
            {...props}
            type="text"
            autoComplete="off"
            maxLength={LIMITES.ruaMax}
            value={valores.rua}
            onChange={(e) => mudarCampo('rua', e.target.value)}
          />
        )}
      </CampoFormulario>

      {/* Gravidade: grupo de opções (radio) com texto, não só cor */}
      <fieldset
        className={`campo campo--grupo ${erros.gravidade ? 'campo--com-erro' : ''}`}
        aria-describedby={erros.gravidade ? 'gravidade-erro' : undefined}
      >
        <legend className="campo__rotulo">Gravidade</legend>
        {erros.gravidade && (
          <p className="campo__erro" id="gravidade-erro">
            <Icone nome="erro" tamanho={20} />
            <span>{erros.gravidade}</span>
          </p>
        )}
        {GRAVIDADES.map((gravidade) => (
          <label key={gravidade.valor} className="opcao">
            <input
              type="radio"
              name="gravidade"
              value={gravidade.valor}
              checked={valores.gravidade === gravidade.valor}
              onChange={() => mudarCampo('gravidade', gravidade.valor)}
            />
            <span>{gravidade.rotulo}</span>
          </label>
        ))}
      </fieldset>

      <CampoFormulario
        id="descricao"
        rotulo="O que está acontecendo?"
        ajuda={`Entre ${LIMITES.descricaoMin} e ${LIMITES.descricaoMax} caracteres. Não escreva nomes nem telefones.`}
        erro={erros.descricao}
      >
        {(props) => (
          <textarea
            {...props}
            rows={4}
            maxLength={LIMITES.descricaoMax}
            value={valores.descricao}
            onChange={(e) => mudarCampo('descricao', e.target.value)}
          />
        )}
      </CampoFormulario>

      <CampoFormulario id="data" rotulo="Data e hora" erro={erros.data}>
        {(props) => (
          <input
            {...props}
            type="datetime-local"
            max={paraCampoDataHora(new Date())}
            value={valores.data}
            onChange={(e) => mudarCampo('data', e.target.value)}
          />
        )}
      </CampoFormulario>

      {/* Enviar fica desativado sem conexão; Cancelar só aparece na edição */}
      <div className="formulario__acoes">
        <Botao type="submit" icone="sucesso" carregando={enviando} disabled={bloqueado}>
          {editando ? 'Salvar alterações' : 'Enviar aviso'}
        </Botao>
        {editando && (
          <Botao variante="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar edição
          </Botao>
        )}
      </div>
    </form>
  )
}
