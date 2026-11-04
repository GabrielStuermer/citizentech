// Roda antes de cada arquivo de teste.
// Adiciona verificações como expect(elemento).toBeInTheDocument().
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Desmonta os componentes renderizados depois de cada teste.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
