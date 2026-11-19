// Configuração do Vite (servidor/build) e do Vitest (testes)
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pasta dados/ da raiz: a mesma usada pelo Python e pelo ESP32
const pastaDados = fileURLToPath(new URL('../dados', import.meta.url))

export default defineConfig({
  plugins: [react()],

  // Permite importar com '@dados/arquivo'
  resolve: {
    alias: { '@dados': pastaDados },
  },

  // Libera o servidor para ler arquivos fora de web/
  server: {
    fs: { allow: ['..'] },
  },

  // Testes rodam num navegador simulado (jsdom)
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testes/setup.js'],
  },
})
