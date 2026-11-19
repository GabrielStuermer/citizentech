// Página única do app: cabeçalho, seções (Agora, Histórico, Ocorrências) e rodapé
import config from '@dados/config_alertas.json'
import { Cabecalho } from './componentes/Cabecalho.jsx'
import { Rodape } from './componentes/Rodape.jsx'
import { carregarFaixas } from './dominio/faixas.js'
import { useConexao } from './hooks/useConexao.js'
import { useLeituras } from './hooks/useLeituras.js'
import { useSimulacao } from './hooks/useSimulacao.js'
import { SecaoAgora } from './secoes/SecaoAgora.jsx'
import { SecaoHistorico } from './secoes/SecaoHistorico.jsx'
import { SecaoOcorrencias } from './secoes/SecaoOcorrencias.jsx'

// Faixas carregadas uma vez, do mesmo JSON do Python e do ESP32
const FAIXAS = carregarFaixas(config)

export default function App() {
  const online = useConexao()
  const dados = useLeituras()
  const simulacao = useSimulacao(dados.leituras.length)

  // Na simulação, mostra só as leituras até o momento escolhido na régua
  const visiveis = dados.fonte === 'simulada' ? dados.leituras.slice(0, simulacao.indice + 1) : dados.leituras

  return (
    <>
      {/* Atalho de teclado para pular o menu */}
      <a className="pular-para-conteudo" href="#conteudo">Pular para o conteúdo</a>
      <Cabecalho estacao={config.estacao} online={online} />

      <main id="conteudo" className="container" tabIndex={-1}>
        <SecaoAgora dados={dados} visiveis={visiveis} faixas={FAIXAS} simulacao={simulacao} />
        <SecaoHistorico visiveis={visiveis} faixas={FAIXAS} carregando={dados.status !== 'sucesso'} />
        <SecaoOcorrencias online={online} />
      </main>

      <Rodape fonte={dados.fonte} />
    </>
  )
}
