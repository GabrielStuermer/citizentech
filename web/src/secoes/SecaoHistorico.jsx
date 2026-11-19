// Seção "Histórico": gráfico das últimas 12 h e indicador de impacto
import { GraficoHistorico } from '../componentes/GraficoHistorico.jsx'
import { MensagemEstado } from '../componentes/MensagemEstado.jsx'
import { calcularAntecedencia } from '../dominio/analise.js'
import { ultimasHoras } from '../dominio/leituras.js'
import { formatarDuracao, formatarHora } from '../utils/formatacao.js'

const HORAS_NO_GRAFICO = 12

export function SecaoHistorico({ visiveis, faixas, carregando }) {
  if (carregando) return null // a seção Agora já mostra o "carregando"

  const janela = ultimasHoras(visiveis, HORAS_NO_GRAFICO)
  const antecedencia = calcularAntecedencia(visiveis, faixas)

  return (
    <section id="historico" className="secao" aria-labelledby="historico-titulo">
      <h2 id="historico-titulo" className="secao__titulo">Histórico</h2>

      {/* Gráfico precisa de pelo menos duas leituras */}
      {janela.length < 2 ? (
        <MensagemEstado tipo="vazio" titulo="Ainda não há leituras suficientes para o gráfico.">
          <p>São necessárias pelo menos duas leituras.</p>
        </MensagemEstado>
      ) : (
        <GraficoHistorico leituras={janela} faixas={faixas} horas={HORAS_NO_GRAFICO} />
      )}

      {/* Indicador de impacto: só aparece depois que a água chegou ao crítico */}
      {antecedencia && (
        <aside className="destaque-impacto" aria-label="Indicador de impacto">
          <p className="destaque-impacto__numero">{formatarDuracao(antecedencia.minutos)}</p>
          <p>
            de antecedência: o primeiro <strong>Alerta</strong> veio às {formatarHora(antecedencia.aviso)} e a
            água chegou ao nível <strong>Crítico</strong> às {formatarHora(antecedencia.critico)}. Esse é o tempo
            que o morador teve para proteger seus bens e sair com segurança.
          </p>
        </aside>
      )}
    </section>
  )
}
