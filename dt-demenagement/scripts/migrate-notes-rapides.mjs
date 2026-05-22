import postgres from 'postgres'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
try {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
} catch { /* rely on process.env */ }

const sql = postgres(process.env.DATABASE_URL)

async function migrate() {
  console.log('📦 Adding notes_rapides column to demenagements table...')

  await sql`
    ALTER TABLE demenagements
    ADD COLUMN IF NOT EXISTS notes_rapides TEXT
  `

  console.log('✅ Migration terminée — colonne notes_rapides ajoutée.')
  await sql.end()
}

migrate().catch((err) => {
  console.error('❌ Migration échouée :', err)
  process.exit(1)
})
