// scripts/migrate-notes-rapides.mjs
// Adds notes_rapides column to the demenagements table.
// Run: node scripts/migrate-notes-rapides.mjs
import pg from 'pg'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

try {
  await pool.query(`
    ALTER TABLE demenagements
    ADD COLUMN IF NOT EXISTS notes_rapides TEXT;
  `)
  console.log('✅  Column notes_rapides added to demenagements (or already existed).')
} catch (err) {
  console.error('❌  Migration failed:', err)
  process.exit(1)
} finally {
  await pool.end()
}
