// Ícones em SVG desenhados no próprio código (funcionam sem internet)

// Traço mais grosso para os "pontos" dos ícones (ex.: ponto do "!")
const PONTO = { strokeWidth: 3 }

// Desenho de cada ícone. As faixas usam formatos diferentes:
// círculo (normal/atenção), triângulo (alerta) e octógono (crítico)
const DESENHOS = {
  normal: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="7.5 12.5 10.5 15.5 16.5 9" />
    </>
  ),
  atencao: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12" y2="16.6" {...PONTO} />
    </>
  ),
  alerta: (
    <>
      <path d="M12 3 22 20H2Z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.1" {...PONTO} />
    </>
  ),
  critico: (
    <>
      <polygon points="7.9 2 16.1 2 22 7.9 22 16.1 16.1 22 7.9 22 2 16.1 2 7.9" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12" y2="16.6" {...PONTO} />
    </>
  ),
  online: (
    <>
      <path d="M2 8.5a15 15 0 0 1 20 0" />
      <path d="M5.5 12a10 10 0 0 1 13 0" />
      <path d="M9 15.5a5 5 0 0 1 6 0" />
      <line x1="12" y1="19" x2="12" y2="19.1" {...PONTO} />
    </>
  ),
  offline: (
    <>
      <path d="M2 8.5a15 15 0 0 1 20 0" />
      <path d="M5.5 12a10 10 0 0 1 13 0" />
      <path d="M9 15.5a5 5 0 0 1 6 0" />
      <line x1="12" y1="19" x2="12" y2="19.1" {...PONTO} />
      <line x1="3" y1="3" x2="21" y2="21" />
    </>
  ),
  sucesso: <polyline points="4 12.5 9.5 18 20 6" />,
  erro: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <line x1="12" y1="7.5" x2="12" y2="7.6" {...PONTO} />
    </>
  ),
  carregando: <path d="M12 2a10 10 0 1 0 10 10" />,
  subindo: (
    <>
      <line x1="12" y1="20" x2="12" y2="4" />
      <polyline points="5 11 12 4 19 11" />
    </>
  ),
  descendo: (
    <>
      <line x1="12" y1="4" x2="12" y2="20" />
      <polyline points="19 13 12 20 5 13" />
    </>
  ),
  estavel: (
    <>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </>
  ),
  editar: <path d="M4 20h4L19 9l-4-4L4 16Z" />,
  excluir: (
    <>
      <polyline points="3 6 21 6" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
    </>
  ),
  reproduzir: <polygon points="7 4 20 12 7 20" fill="currentColor" />,
  pausar: (
    <>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </>
  ),
  recarregar: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <polyline points="20 4 20 9 15 9" />
    </>
  ),
}

// Com rótulo: o leitor de tela lê o ícone. Sem rótulo: é decorativo e fica oculto
export function Icone({ nome, tamanho = 24, rotulo, className = '' }) {
  const acessibilidade = rotulo ? { role: 'img', 'aria-label': rotulo } : { 'aria-hidden': true }
  return (
    <svg
      className={`icone icone--${nome} ${className}`}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...acessibilidade}
    >
      {DESENHOS[nome]}
    </svg>
  )
}
