// Diz se o aparelho está com internet e atualiza quando isso muda
import { useEffect, useState } from 'react'

export function useConexao() {
  const [online, setOnline] = useState(() => navigator.onLine)

  // Ouve os eventos do navegador e remove os ouvintes ao desmontar
  useEffect(() => {
    const ficouOnline = () => setOnline(true)
    const ficouOffline = () => setOnline(false)
    window.addEventListener('online', ficouOnline)
    window.addEventListener('offline', ficouOffline)
    return () => {
      window.removeEventListener('online', ficouOnline)
      window.removeEventListener('offline', ficouOffline)
    }
  }, [])

  return online
}
