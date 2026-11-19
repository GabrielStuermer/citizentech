// Preparação dos testes: matchers extras (toBeInTheDocument etc.)
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Depois de cada teste: desmonta a tela e limpa o cache local
afterEach(() => {
  cleanup()
  localStorage.clear()
})
