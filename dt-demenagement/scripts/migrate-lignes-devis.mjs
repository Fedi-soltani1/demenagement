import postgres from 'postgres'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually without dotenv
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
} catch { /* .env.local not found — rely on process.env */ }

const sql = postgres(process.env.DATABASE_URL)

async function migrate() {
  console.log('📦 Creating demenagements_lignes_devis table...')

  await sql`
    CREATE TABLE IF NOT EXISTS demenagements_lignes_devis (
      id            SERIAL PRIMARY KEY,
      _order        INTEGER NOT NULL,
      _parent_id    INTEGER NOT NULL REFERENCES demenagements(id) ON DELETE CASCADE,
      designation   VARCHAR(500),
      quantite      NUMERIC DEFAULT 1,
      prix_unitaire NUMERIC
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS demenagements_lignes_devis_parent_idx
    ON demenagements_lignes_devis (_parent_id)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS demenagements_lignes_devis_order_idx
    ON demenagements_lignes_devis (_order)
  `

  console.log('✅ Migration terminée — table demenagements_lignes_devis créée.')
  await sql.end()
}

migrate().catch((err) => {
  console.error('❌ Migration échouée :', err)
  process.exit(1)
})
