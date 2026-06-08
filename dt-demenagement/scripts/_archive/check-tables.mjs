import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
})

await client.connect()

// Vérifier quelles tables pages_blocks_* existent
const res = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name LIKE 'pages_blocks_%'
  ORDER BY table_name
`)

console.log('Tables pages_blocks_* existantes :')
res.rows.forEach(r => console.log(' -', r.table_name))
console.log('\nTotal :', res.rows.length, 'tables')

// Vérifier lesquelles ont déjà la colonne actif
const colRes = await client.query(`
  SELECT table_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name LIKE 'pages_blocks_%'
  AND column_name = 'actif'
  ORDER BY table_name
`)

console.log('\nTables qui ont déjà la colonne "actif" :')
colRes.rows.forEach(r => console.log(' ✅', r.table_name))
console.log('Total :', colRes.rows.length)

await client.end()
