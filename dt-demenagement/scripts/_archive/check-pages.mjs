import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
})

await client.connect()

const res = await client.query(`SELECT id, slug, publie, _status FROM pages ORDER BY id`)
console.log('Pages en base :')
if (res.rows.length === 0) {
  console.log('  ❌ Aucune page trouvée — le seed n\'a pas créé de page accueil')
} else {
  res.rows.forEach(r => console.log(`  - id:${r.id} | slug: ${r.slug} | publie: ${r.publie} | status: ${r._status}`))
}

await client.end()
