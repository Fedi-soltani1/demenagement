/**
 * Migration manuelle — colonnes manquantes (push: false actif à cause du bug drizzle-orm)
 * Usage : node scripts/migrate-add-missing-columns.mjs
 */
import postgres from 'postgres'

const db = postgres(process.env.DATABASE_URL, { ssl: 'require' })

const migrations = [
  // Ajout champ videoYoutube sur le bloc Hero (pages + versions)
  'ALTER TABLE pages_blocks_hero ADD COLUMN IF NOT EXISTS video_youtube VARCHAR',
  'ALTER TABLE _pages_v_blocks_hero ADD COLUMN IF NOT EXISTS video_youtube VARCHAR',
  // Ajout champ videoFichier sur le bloc About (pages + versions)
  'ALTER TABLE pages_blocks_about ADD COLUMN IF NOT EXISTS video_fichier_id INTEGER REFERENCES media(id) ON DELETE SET NULL',
  'ALTER TABLE _pages_v_blocks_about ADD COLUMN IF NOT EXISTS video_fichier_id INTEGER',
  // Ajout champ videoFichier sur le bloc Hero (pages + versions)
  'ALTER TABLE pages_blocks_hero ADD COLUMN IF NOT EXISTS video_fichier_id INTEGER REFERENCES media(id) ON DELETE SET NULL',
  'ALTER TABLE _pages_v_blocks_hero ADD COLUMN IF NOT EXISTS video_fichier_id INTEGER',
]

async function run() {
  try {
    for (const sql of migrations) {
      console.log(`▶ ${sql}`)
      await db.unsafe(sql)
      console.log('  ✅ OK')
    }
    console.log('\n✅ Migration terminée — toutes les colonnes sont en place.')
  } catch (err) {
    console.error('❌ Erreur migration :', err.message)
    process.exit(1)
  } finally {
    await db.end()
  }
}

run()
