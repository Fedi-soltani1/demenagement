// One-time migration: add devis columns to demenagements table
import postgres from 'postgres'

const sql = postgres('postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')

try {
  await sql`
    ALTER TABLE demenagements
      ADD COLUMN IF NOT EXISTS prix_total_t_t_c NUMERIC,
      ADD COLUMN IF NOT EXISTS devis_validite_jours INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS devis_notes TEXT,
      ADD COLUMN IF NOT EXISTS devis_statut VARCHAR(50) DEFAULT 'brouillon'
  `
  console.log('✅ Migration OK — devis columns added to demenagements')
} catch (e) {
  console.error('❌ Migration failed:', e.message)
} finally {
  await sql.end()
}
