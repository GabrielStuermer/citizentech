// Controle da "máquina do tempo" dos dados simulados.
// Usa um <input type="range"> nativo: funciona com teclado (setas, Home, End)
// e o leitor de tela anuncia a data/hora escolhida (aria-valuetext).
import { Botao } from './Botao.jsx'
import { formatarDataHora } from '../utils/formatacao.js'

/**
 * @param {{
 *   leituras: Array, indice: number, tocando: boolean,
 *   onMudarIndice: (i: number) => void, onAlternar: () => void
 * }} props
 */
export function ControleSimulacao({ leituras, indice, tocando, onMudarIndice, onAlternar }) {
  if (leituras.length < 2) return null
  const momento = leituras[indice].timestamp

  return (
    <section className="simulacao" aria-labelledby="simulacao-titulo">
      <h2 id="simulacao-titulo" className="simulacao__titulo">Simulação</h2>
      <p className="simulacao__explicacao">
        Os dados são <strong>simulados</strong>. Arraste ou aperte “Reproduzir” para ver a água
        subir e o alerta mudar.
      </p>

      <div className="simulacao__controles">
        <Botao
          variante="secundario"
          icone={tocando ? 'pausar' : 'reproduzir'}
          onClick={onAlternar}
          aria-pressed={tocando}
        >
          {tocando ? 'Pausar' : 'Reproduzir'}
        </Botao>

        <div className="simulacao__regua">
          <label htmlFor="simulacao-momento">
            Momento simulado: <strong>{formatarDataHora(momento)}</strong>
          </label>
          <input
            id="simulacao-momento"
            type="range"
            min="0"
            max={leituras.length - 1}
            step="1"
            value={indice}
            onChange={(evento) => onMudarIndice(Number(evento.target.value))}
            aria-valuetext={formatarDataHora(momento)}
          />
        </div>
      </div>
    </section>
  )
}
