// Seção "Agora": situação atual da água e controle da simulação
import { CartaoNivelAtual } from '../componentes/CartaoNivelAtual.jsx'
import { ControleSimulacao } from '../componentes/ControleSimulacao.jsx'
import { MensagemEstado } from '../componentes/MensagemEstado.jsx'
import { statusAtual } from '../dominio/analise.js'
import { estaDesatualizada } from '../dominio/leituras.js'
import { formatarDataHora } from '../utils/formatacao.js'

const LIMITE_DESATUALIZADO_MIN = 30

export function SecaoAgora({ dados, visiveis, faixas, simulacao }) {
  const ehSimulada = dados.fonte === 'simulada'

  // Estado: carregando
  if (dados.status === 'carregando') {
    return (
      <section id="agora" className="secao" aria-label="Situação agora">
        <MensagemEstado tipo="carregando" titulo="Carregando o nível da água…" />
      </section>
    )
  }

  // Estado: erro (sem dados e sem cópia salva)
  if (dados.status === 'erro') {
    return (
      <section id="agora" className="secao" aria-label="Situação agora">
        <MensagemEstado
          tipo="erro"
          titulo="Não foi possível obter o nível da água."
          acao={{ rotulo: 'Tentar de novo', onClick: dados.recarregar }}
        >
          <p>Verifique sua internet. Enquanto isso, siga as orientações da Defesa Civil (199).</p>
        </MensagemEstado>
      </section>
    )
  }

  // Estado: vazio (canal ainda sem leituras)
  if (visiveis.length === 0) {
    return (
      <section id="agora" className="secao" aria-label="Situação agora">
        <MensagemEstado tipo="vazio" titulo="Ainda não há leituras do sensor.">
          <p>Assim que o sensor enviar a primeira medição, ela aparece aqui.</p>
        </MensagemEstado>
      </section>
    )
  }

  // Estado: sucesso. Dado real com mais de 30 min é marcado como desatualizado
  const status = statusAtual(visiveis, faixas)
  const desatualizado = !ehSimulada && estaDesatualizada(status.leitura.timestamp, new Date(), LIMITE_DESATUALIZADO_MIN)

  return (
    <section id="agora" className="secao secao--agora" aria-label="Situação agora">
      <div className="agora__principal">
        {/* Avisos acima do cartão: sem conexão, sensor parado, leituras ignoradas */}
        {dados.doCache && (
          <MensagemEstado
            tipo="aviso"
            titulo="Sem conexão: mostrando os últimos dados salvos neste aparelho."
            acao={{ rotulo: 'Tentar de novo', onClick: dados.recarregar }}
          >
            <p>Salvos em {formatarDataHora(dados.salvoEm)}. A situação real pode ter mudado.</p>
          </MensagemEstado>
        )}
        {desatualizado && !dados.doCache && (
          <MensagemEstado tipo="aviso" titulo="O sensor está sem enviar dados há mais de 30 minutos.">
            <p>A informação abaixo pode estar desatualizada. Se a água estiver subindo, não espere: siga as orientações da Defesa Civil.</p>
          </MensagemEstado>
        )}
        {dados.errosDeLinha.length > 0 && (
          <MensagemEstado tipo="aviso" titulo={`${dados.errosDeLinha.length} leitura(s) com problema foram ignoradas.`} />
        )}

        <CartaoNivelAtual status={status} desatualizado={desatualizado} />
      </div>

      {/* A régua de tempo só aparece com dados simulados */}
      {ehSimulada && (
        <ControleSimulacao
          leituras={dados.leituras}
          indice={simulacao.indice}
          tocando={simulacao.tocando}
          onMudarIndice={simulacao.irPara}
          onAlternar={simulacao.alternar}
        />
      )}
    </section>
  )
}
