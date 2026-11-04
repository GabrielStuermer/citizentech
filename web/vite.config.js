// Configuração do Vite (servidor de desenvolvimento e build) e do Vitest (testes).
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Caminho absoluto da pasta dados/ compartilhada (fica fora de web/).
const pastaDados = fileURLToPath(new URL('../dados', import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Atalho: import x from '@dados/config_alertas.json'
    // Assim o app lê os MESMOS arquivos que o Python e o ESP32, sem cópias.
    alias: { '@dados': pastaDados },
  },

  server: {
    // O Vite só serve arquivos de dentro do projeto; liberamos a pasta pai
    // para ele conseguir ler ../dados durante o desenvolvimento.
    fs: { allow: ['..'] },
  },

  test: {
    environment: 'jsdom', // simula o navegador nos testes de componentes
    setupFiles: ['./src/testes/setup.js'],
  },
})
