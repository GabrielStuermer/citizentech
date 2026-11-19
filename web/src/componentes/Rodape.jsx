// Rodapé: telefones de emergência (com um toque) e origem dos dados
export function Rodape({ fonte }) {
  return (
    <footer className="rodape">
      <div className="container">
        <h2 className="rodape__titulo">Em emergência, ligue</h2>
        <ul className="rodape__telefones">
          <li><a href="tel:199"><strong>199</strong> Defesa Civil</a></li>
          <li><a href="tel:193"><strong>193</strong> Bombeiros</a></li>
        </ul>
        {/* Deixa claro se os dados são do sensor ou simulados */}
        <p className="rodape__fonte">
          {fonte === 'thingspeak'
            ? 'Dados do sensor do AlertaCheia, publicados no ThingSpeak.'
            : 'Dados de nível SIMULADOS, apenas para demonstração (não são medições reais).'}{' '}
          Limites das faixas provisórios, a validar com fonte pública.
        </p>
        <p className="rodape__projeto">AlertaCheia · Global Solution FIAP 2026</p>
      </div>
    </footer>
  )
}
