// Mensagem padrão para os estados da tela: carregando, sucesso, erro,
// vazio (sem dados) e aviso. Sempre com ícone + texto, e anunciada pelo
// leitor de tela (role="alert" para erro, role="status" para o resto).
import { Botao } from './Botao.jsx'
import { Icone } from './Icone.jsx'

const ICONE_POR_TIPO = {
  carregando: 'carregando',
  sucesso: 'sucesso',
  erro: 'erro',
  vazio: 'info',
  aviso: 'atencao',
}

/**
 * @param {{
 *   tipo: 'carregando'|'sucesso'|'erro'|'vazio'|'aviso',
 *   titulo: string,
 *   children?: React.ReactNode,          texto de apoio / orientação
 *   acao?: {rotulo: string, onClick: () => void, icone?: string}
 * }} props
 */
export function MensagemEstado({ tipo, titulo, children, acao }) {
  return (
    <div className={`mensagem mensagem--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <Icone
        nome={ICONE_POR_TIPO[tipo]}
        tamanho={28}
        className={tipo === 'carregando' ? 'icone--girando' : ''}
      />
      <div className="mensagem__conteudo">
        <p className="mensagem__titulo">{titulo}</p>
        {children && <div className="mensagem__texto">{children}</div>}
        {acao && (
          <Botao variante="secundario" icone={acao.icone ?? 'recarregar'} onClick={acao.onClick}>
            {acao.rotulo}
          </Botao>
        )}
      </div>
    </div>
  )
}
