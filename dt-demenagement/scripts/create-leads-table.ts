import 'dotenv/config'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL ?? ''
if (!DATABASE_URL) { console.error('DATABASE_URL manquant'); process.exit(1) }

// Remove sslmode from URL — postgres package handles SSL separately
const cleanUrl = DATABASE_URL
  .replace(/[?&]sslmode=[^&]*/g, '')
  .replace(/[?&]channel_binding=[^&]*/g, '')
  .replace(/\?$/, '')

const sql = postgres(cleanUrl, { ssl: 'require', max: 1 })

async function run() {
  try {
    // Check if table already exists
    const exists = await sql`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'leads'
    `
    if (exists.length > 0) {
      console.log('✅ La table leads existe déjà.')
      return
    }

    await sql`
      CREATE TABLE leads (
        id          text        PRIMARY KEY DEFAULT gen_random_uuid()::text,
        nom_prenom  text        NOT NULL,
        telephone   text        NOT NULL,
        email       text,
        statut      text        NOT NULL DEFAULT 'nouveau',
        service     text,
        ville       text,
        source      text,
        updated_at  timestamptz NOT NULL DEFAULT now(),
        created_at  timestamptz NOT NULL DEFAULT now()
      )
    `
    console.log('✅ Table leads créée avec succès.')

    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `
    console.log('Tables:', tables.map(t => t.table_name).join(', '))
  } finally {
    await sql.end()
  }
}

run().catch(err => { console.error('Erreur :', err.message); process.exit(1) })
