// Topo da página: nome do app, bairro, situação da conexão e menu das seções
import { Icone } from './Icone.jsx'

export function Cabecalho({ estacao, online }) {
  return (
    <header className="cabecalho">
      <div className="cabecalho__conteudo container">
        <div className="cabecalho__marca">
          <h1 className="cabecalho__nome">AlertaCheia</h1>
          <p className="cabecalho__local">{estacao} · Porto Alegre</p>
        </div>

        {/* Conectado / Sem internet, com ícone e texto */}
        <p className={`conexao conexao--${online ? 'online' : 'offline'}`}>
          <Icone nome={online ? 'online' : 'offline'} tamanho={20} />
          <span>{online ? 'Conectado' : 'Sem internet'}</span>
        </p>

        {/* Links para as seções da página */}
        <nav className="cabecalho__menu" aria-label="Seções">
          <ul>
            <li><a href="#agora">Agora</a></li>
            <li><a href="#historico">Histórico</a></li>
            <li><a href="#ocorrencias">Ocorrências</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
