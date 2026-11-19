// Cria o db.json da API provisória a partir do exemplo, se ainda não existir
import { copyFileSync, existsSync } from 'node:fs'

const ORIGEM = new URL('../db.exemplo.json', import.meta.url)
const DESTINO = new URL('../db.json', import.meta.url)

// Não sobrescreve: mantém as ocorrências já cadastradas
if (existsSync(DESTINO)) {
  console.log('db.json já existe: usando os dados atuais.')
} else {
  copyFileSync(ORIGEM, DESTINO)
  console.log('db.json criado a partir de db.exemplo.json.')
}
