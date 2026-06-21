import assert from 'node:assert'

// Set dummy env vars BEFORE loading any modules that depend on lib/env.ts
// This is needed because tsx compiles all modules eagerly
process.env.DATABASE_URL ??= 'postgresql://dummy'
process.env.PAYLOAD_SECRET ??= 'dummy-secret-at-least-32-chars-long-for-zod'
process.env.AUTH_SECRET ??= 'dummy-secret-at-least-32-chars-long-for-zod'
process.env.NEXT_PUBLIC_SERVER_URL ??= 'http://localhost:3000'
process.env.CRON_SECRET ??= 'dummy-cron-secret'
process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??= '+216 99 999 999'
process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??= 'Bonjour'

import { resolveIdentity } from './login-link'

// Email réel prioritaire
assert.equal(resolveIdentity({ email: 'Alice@Mail.TN', telephone: '+216 52 880 311' }), 'alice@mail.tn', 'email prioritaire (minuscule)')
// Pas d'email -> identité téléphone canonique
assert.equal(resolveIdentity({ telephone: '52 880 311' }), '21652880311@wa.client', 'téléphone seul')
// Email synthétique stocké => traité comme PAS un vrai email -> téléphone
assert.equal(resolveIdentity({ email: 'wa.21652880311@dt-demenagement.tn', telephone: '+216 52 880 311' }), '21652880311@wa.client', 'ancien faux email B ignoré')
assert.equal(resolveIdentity({ email: '21652880311@wa.client', telephone: '52880311' }), '21652880311@wa.client', 'faux email unifié ignoré')

console.log('✅ login-link.test.ts — toutes les assertions passent')
