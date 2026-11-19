// Régua de tempo e botão Reproduzir/Pausar para percorrer os dados simulados
import { Botao } from './Botao.jsx'
import { formatarDataHora } from '../utils/formatacao.js'

export function ControleSimulacao({ leituras, indice, tocando, onMudarIndice, onAlternar }) {
  // Momento da leitura que está selecionada na régua
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
          {/* Cada posição da régua é uma leitura; aria-valuetext lê a data, não o número */}
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
