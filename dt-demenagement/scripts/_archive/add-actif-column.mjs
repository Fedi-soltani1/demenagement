import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
})

await client.connect()

const tables = [
  'pages_blocks_hero',
  'pages_blocks_mini_features',
  'pages_blocks_services',
  'pages_blocks_about',
  'pages_blocks_stats',
  'pages_blocks_why_us',
  'pages_blocks_testimonials',
  'pages_blocks_google_reviews',
  'pages_blocks_partners',
  'pages_blocks_blog_preview',
  'pages_blocks_cta',
  'pages_blocks_faq',
  'pages_blocks_map',
  'pages_blocks_gallery',
  'pages_blocks_video',
  'pages_blocks_instagram_feed',
  'pages_blocks_newsletter',
  'pages_blocks_custom',
  // tables draft (_pages_v_)
  '_pages_v_blocks_hero',
  '_pages_v_blocks_mini_features',
  '_pages_v_blocks_services',
  '_pages_v_blocks_about',
  '_pages_v_blocks_stats',
  '_pages_v_blocks_why_us',
  '_pages_v_blocks_testimonials',
  '_pages_v_blocks_google_reviews',
  '_pages_v_blocks_partners',
  '_pages_v_blocks_blog_preview',
  '_pages_v_blocks_cta',
  '_pages_v_blocks_faq',
  '_pages_v_blocks_map',
  '_pages_v_blocks_gallery',
  '_pages_v_blocks_video',
  '_pages_v_blocks_instagram_feed',
  '_pages_v_blocks_newsletter',
  '_pages_v_blocks_custom',
]

for (const table of tables) {
  try {
    await client.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS actif boolean DEFAULT true`)
    console.log(`✅ ${table}`)
  } catch (e) {
    console.log(`⚠️  ${table} — ${e.message}`)
  }
}

await client.end()
console.log('\nTerminé.')
