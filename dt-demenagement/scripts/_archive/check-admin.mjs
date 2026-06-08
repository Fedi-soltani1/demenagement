import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
})

await client.connect()

const res = await client.query(`SELECT id, email, role, updated_at FROM admins ORDER BY id`)

console.log('Admins en base :')
res.rows.forEach(r => console.log(` - id:${r.id} | email: ${r.email} | role: ${r.role}`))
console.log('Total :', res.rows.length)

await client.end()
