import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

await client.connect()

const blockTables = [
  'pages_blocks_hero',
  'pages_blocks_mini_features',
  'pages_blocks_about',
  'pages_blocks_why_us',
  'pages_blocks_services',
  'pages_blocks_map',
  'pages_blocks_testimonials',
  'pages_blocks_google_reviews',
  'pages_blocks_partners',
  'pages_blocks_instagram_feed',
  'pages_blocks_newsletter',
  'pages_blocks_blog_preview',
  'pages_blocks_cta',
  'pages_blocks_stats',
]

console.log('=== Blocs pour page id=1 (accueil) ===\n')

for (const table of blockTables) {
  const res = await client.query(`SELECT * FROM ${table} WHERE _parent_id = 1 LIMIT 5`)
  if (res.rows.length > 0) {
    console.log(`✅ ${table} (${res.rows.length} ligne(s))`)
    res.rows.forEach((r, i) => {
      const { id, _parent_id, _path, _order, actif, ...rest } = r
      console.log(`   [${i}] order=${_order} actif=${actif}`, JSON.stringify(rest).slice(0, 120))
    })
  } else {
    console.log(`❌ ${table} (vide)`)
  }
}

await client.end()
