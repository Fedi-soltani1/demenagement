import assert from 'node:assert'
import { agentOwnerWhere } from './isAgentOwner'

assert.equal(agentOwnerWhere({ collection: 'admins', id: 1, role: 'super-admin' }), true, 'super-admin → tout')
assert.deepEqual(agentOwnerWhere({ collection: 'agents', id: 7 }), { agent: { equals: 7 } }, 'agent → ses demandes')
assert.equal(agentOwnerWhere(null), false, 'non connecté → rien')
assert.equal(agentOwnerWhere({ collection: 'admins', id: 2, role: 'seo' }), false, 'seo → rien (pas super-admin, pas agent)')
console.log('✅ isAgentOwner OK')
