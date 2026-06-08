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
  console.log('📦 Creating rendez_vous table...')

  await sql`
    CREATE TABLE IF NOT EXISTS rendez_vous (
      id          SERIAL PRIMARY KEY,
      statut      VARCHAR(20)  NOT NULL DEFAULT 'nouveau',
      type        VARCHAR(20)  NOT NULL DEFAULT 'client',
      nom         VARCHAR(100) NOT NULL,
      prenom      VARCHAR(100) NOT NULL,
      telephone   VARCHAR(30)  NOT NULL,
      whatsapp    VARCHAR(30)  NOT NULL,
      email       VARCHAR(200),
      adresse     TEXT,
      date_visite VARCHAR(20),
      heure       VARCHAR(10),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  console.log('✅ Migration terminée — table rendez_vous créée.')
  await sql.end()
}

migrate().catch((err) => {
  console.error('❌ Migration échouée :', err)
  process.exit(1)
})
