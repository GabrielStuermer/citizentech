// Prepara o banco da API provisória (json-server).
//
// O json-server grava as alterações no próprio db.json. Para não versionar
// dados de teste, o repositório guarda só o db.exemplo.json (dados de
// exemplo, fictícios). Este script cria o db.json a partir dele quando
// ainda não existe. Para recomeçar do zero: apague o db.json.
import { copyFileSync, existsSync } from 'node:fs'

const ORIGEM = new URL('../db.exemplo.json', import.meta.url)
const DESTINO = new URL('../db.json', import.meta.url)

if (existsSync(DESTINO)) {
  console.log('db.json já existe: usando os dados atuais.')
} else {
  copyFileSync(ORIGEM, DESTINO)
  console.log('db.json criado a partir de db.exemplo.json.')
}
