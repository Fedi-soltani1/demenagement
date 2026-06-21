// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { rateLimit, clientIp } from './ratelimit'

// (sans UPSTASH_* en env → repli mémoire ; c'est ce qu'on teste ici)
async function main(): Promise<void> {
  // Autorise `limit` requêtes puis bloque, par clé.
  {
    const key = `test-a-${Math.random()}`
    for (let i = 0; i < 3; i++) assert.equal(await rateLimit(key, 3, 60_000), true, `req ${i + 1} autorisée`)
    assert.equal(await rateLimit(key, 3, 60_000), false, '4e req bloquée (limite 3)')
  }

  // Les clés sont indépendantes.
  {
    const a = `test-b-${Math.random()}`
    const b = `test-c-${Math.random()}`
    assert.equal(await rateLimit(a, 1, 60_000), true, 'A 1re ok')
    assert.equal(await rateLimit(a, 1, 60_000), false, 'A 2e bloquée')
    assert.equal(await rateLimit(b, 1, 60_000), true, 'B indépendante de A')
  }

  // La fenêtre expirée réautorise.
  {
    const key = `test-d-${Math.random()}`
    assert.equal(await rateLimit(key, 1, 1), true, '1re ok (fenêtre 1ms)')
    const start = Date.now()
    while (Date.now() <= start + 2) { /* attendre > 1ms */ }
    assert.equal(await rateLimit(key, 1, 1), true, 'réautorisée après expiration fenêtre')
  }

  // clientIp : x-forwarded-for prioritaire, sinon fallback.
  assert.equal(clientIp(new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })), '1.2.3.4', 'xff 1er')
  assert.equal(clientIp(new Request('http://x', { headers: { 'x-real-ip': '9.9.9.9' } })), '9.9.9.9', 'x-real-ip fallback')
  assert.equal(clientIp(new Request('http://x')), 'anonymous', 'aucun en-tête -> anonymous')

  console.log('✅ ratelimit.test.ts — toutes les assertions passent')
}

main().catch((e) => { console.error(e); process.exit(1) })
