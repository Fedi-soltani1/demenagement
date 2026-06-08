import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

await client.connect()

// List all block tables for the accueil page
const tables = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name LIKE '_pages_v_blocks_%'
  ORDER BY table_name
`)
console.log('Tables _pages_v_blocks_* :')
tables.rows.forEach(r => console.log(' ', r.table_name))

// Check what blocks the accueil page has (in draft version)
const blocks = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name LIKE 'pages_blocks_%'
  ORDER BY table_name
`)
console.log('\nTables pages_blocks_* :')
blocks.rows.forEach(r => console.log(' ', r.table_name))

// Check the actual layout blocks for page id=1
const layoutCheck = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'pages' AND table_schema = 'public'
  ORDER BY ordinal_position
`)
console.log('\nColonnes table pages :')
layoutCheck.rows.forEach(r => console.log(' ', r.column_name))

await client.end()
