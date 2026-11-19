// Mensagem de estado (carregando, sucesso, erro, vazio, aviso) com ação opcional
import { Botao } from './Botao.jsx'
import { Icone } from './Icone.jsx'

// Ícone usado em cada tipo de mensagem
const ICONE_POR_TIPO = {
  carregando: 'carregando',
  sucesso: 'sucesso',
  erro: 'erro',
  vazio: 'info',
  aviso: 'atencao',
}

export function MensagemEstado({ tipo, titulo, children, acao }) {
  // Erro é anunciado na hora pelo leitor de tela (alert); o resto, sem interromper (status)
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
        {/* Botão opcional, ex.: "Tentar de novo" */}
        {acao && (
          <Botao variante="secundario" icone={acao.icone ?? 'recarregar'} onClick={acao.onClick}>
            {acao.rotulo}
          </Botao>
        )}
      </div>
    </div>
  )
}
