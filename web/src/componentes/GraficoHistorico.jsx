// Gráfico SVG do nível com os limites das faixas, dica ao passar o mouse e tabela de dados
import { useState } from 'react'
import { useLargura } from '../hooks/useLargura.js'
import { formatarDataHora, formatarHora, formatarNivel } from '../utils/formatacao.js'

const ALTURA = 260
const LARGURA_ESTREITA = 480 // abaixo disso (celular) os rótulos ficam mais curtos

// Espaço em volta da área do gráfico (eixos e rótulos das faixas)
const margemPara = (largura) => ({
  topo: 12,
  direita: largura < LARGURA_ESTREITA ? 66 : 112,
  base: 32,
  esquerda: 44,
})

// Arredonda para cima no múltiplo do passo (ex.: 287 -> 300)
const arredondarPara = (valor, passo) => Math.ceil(valor / passo) * passo

export function GraficoHistorico({ leituras, faixas, horas }) {
  const [areaRef, largura] = useLargura() // desenha na largura real da tela
  const [indiceDestaque, setIndiceDestaque] = useState(null)

  if (leituras.length < 2) return null

  const MARGEM = margemPara(largura)
  const estreito = largura < LARGURA_ESTREITA
  const larguraUtil = largura - MARGEM.esquerda - MARGEM.direita
  const alturaUtil = ALTURA - MARGEM.topo - MARGEM.base

  // Escala: eixo X vai do início ao fim; eixo Y de 0 até um pouco acima do maior valor
  const inicio = leituras[0].timestamp.getTime()
  const fim = leituras.at(-1).timestamp.getTime()
  const limites = faixas.filter((f) => f.aPartirDeCm > 0)
  const maiorNivel = Math.max(...leituras.map((l) => l.nivelCm), ...limites.map((f) => f.aPartirDeCm))
  const nivelMaximo = arredondarPara(maiorNivel + 20, 50)

  // Convertem tempo e nível em posição na tela (Y cresce para baixo no SVG)
  const x = (tempo) => MARGEM.esquerda + ((tempo - inicio) / (fim - inicio)) * larguraUtil
  const y = (nivel) => MARGEM.topo + alturaUtil - (nivel / nivelMaximo) * alturaUtil

  // Linha do nível: "M" começa, "L" liga ao próximo ponto
  const caminho = leituras
    .map((l, i) => `${i === 0 ? 'M' : 'L'}${x(l.timestamp.getTime()).toFixed(1)},${y(l.nivelCm).toFixed(1)}`)
    .join(' ')

  // Grade a cada 50 cm e 3 ou 5 marcas de horário (menos no celular)
  const linhasGrade = []
  for (let nivel = 0; nivel <= nivelMaximo; nivel += 50) linhasGrade.push(nivel)

  const qtdMarcasTempo = largura < 420 ? 3 : 5
  const marcasTempo = Array.from({ length: qtdMarcasTempo }, (_, i) => inicio + (i / (qtdMarcasTempo - 1)) * (fim - inicio))

  const ultima = leituras.at(-1)
  const destaque = indiceDestaque === null ? null : leituras[indiceDestaque]

  // Mouse/dedo sobre o gráfico: destaca a leitura mais próxima no tempo
  function aoMoverPonteiro(evento) {
    const caixa = evento.currentTarget.getBoundingClientRect()
    const tempo = inicio + ((evento.clientX - caixa.left - MARGEM.esquerda) / larguraUtil) * (fim - inicio)
    let maisProximo = 0
    leituras.forEach((l, i) => {
      if (Math.abs(l.timestamp.getTime() - tempo) < Math.abs(leituras[maisProximo].timestamp.getTime() - tempo)) {
        maisProximo = i
      }
    })
    setIndiceDestaque(maisProximo)
  }

  // Resumo em texto: legenda visível e descrição para o leitor de tela
  const niveis = leituras.map((l) => l.nivelCm)
  const resumo = `Nas últimas ${horas} horas o nível variou de ${formatarNivel(Math.min(...niveis))} ` +
    `a ${formatarNivel(Math.max(...niveis))}. Última leitura: ${formatarNivel(ultima.nivelCm)} ` +
    `às ${formatarHora(ultima.timestamp)}.`

  // Posição da dica, sem deixar sair pelas bordas
  const xDica = destaque ? Math.min(Math.max(x(destaque.timestamp.getTime()), 70), largura - 70) : 0

  return (
    <figure className="grafico">
      <figcaption className="grafico__legenda">
        <span className="grafico__titulo">Nível da água nas últimas {horas} horas (cm)</span>
        <span className="grafico__resumo">{resumo}</span>
      </figcaption>

      <div className="grafico__area" ref={areaRef}>
        <svg
          width={largura}
          height={ALTURA}
          viewBox={`0 0 ${largura} ${ALTURA}`}
          className="grafico__svg"
          role="img"
          aria-label={resumo}
          onPointerMove={aoMoverPonteiro}
          onPointerLeave={() => setIndiceDestaque(null)}
        >
          {/* Grade horizontal e valores do eixo Y */}
          {linhasGrade.map((nivel) => (
            <g key={nivel}>
              <line className="grafico__grade" x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(nivel)} y2={y(nivel)} />
              <text className="grafico__eixo" x={MARGEM.esquerda - 8} y={y(nivel)} textAnchor="end" dominantBaseline="middle">
                {nivel}
              </text>
            </g>
          ))}

          {/* Horários no eixo X */}
          {marcasTempo.map((tempo, i) => (
            <text
              key={tempo}
              className="grafico__eixo"
              x={x(tempo)}
              y={ALTURA - 8}
              textAnchor={i === 0 ? 'start' : i === qtdMarcasTempo - 1 ? 'end' : 'middle'}
            >
              {formatarHora(new Date(tempo))}
            </text>
          ))}

          {/* Linhas tracejadas dos limites das faixas, com o nome ao lado */}
          {limites.map((faixa) => (
            <g key={faixa.chave}>
              <line
                className={`grafico__limite grafico__limite--${faixa.chave}`}
                x1={MARGEM.esquerda}
                x2={largura - MARGEM.direita}
                y1={y(faixa.aPartirDeCm)}
                y2={y(faixa.aPartirDeCm)}
              />
              <text
                className="grafico__rotulo-limite"
                x={largura - MARGEM.direita + 6}
                y={y(faixa.aPartirDeCm)}
                dominantBaseline="middle"
              >
                {estreito ? faixa.rotulo : `${faixa.rotulo} (${faixa.aPartirDeCm})`}
              </text>
            </g>
          ))}

          {/* Linha do nível e ponto da última leitura */}
          <path className="grafico__linha" d={caminho} />

          <circle className="grafico__ponto" cx={x(ultima.timestamp.getTime())} cy={y(ultima.nivelCm)} r="6" />

          {/* Linha vertical e ponto da leitura destacada */}
          {destaque && (
            <g>
              <line
                className="grafico__mira"
                x1={x(destaque.timestamp.getTime())}
                x2={x(destaque.timestamp.getTime())}
                y1={MARGEM.topo}
                y2={MARGEM.topo + alturaUtil}
              />
              <circle className="grafico__ponto" cx={x(destaque.timestamp.getTime())} cy={y(destaque.nivelCm)} r="5" />
            </g>
          )}
        </svg>

        {/* Caixinha com nível e horário da leitura destacada */}
        {destaque && (
          <div className="grafico__dica" style={{ left: `${xDica}px` }} aria-hidden="true">
            <strong>{formatarNivel(destaque.nivelCm)}</strong>
            <span>{formatarDataHora(destaque.timestamp)}</span>
          </div>
        )}
      </div>

      {/* Os mesmos dados em tabela (acessibilidade), da mais recente para a mais antiga */}
      <details className="grafico__tabela">
        <summary>Ver os dados em tabela</summary>
        <div className="grafico__tabela-rolagem">
          <table>
            <caption className="visualmente-oculto">Leituras de nível da água</caption>
            <thead>
              <tr><th scope="col">Data e hora</th><th scope="col">Nível</th></tr>
            </thead>
            <tbody>
              {[...leituras].reverse().map((l) => (
                <tr key={l.timestamp.getTime()}>
                  <td>{formatarDataHora(l.timestamp)}</td>
                  <td>{formatarNivel(l.nivelCm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
