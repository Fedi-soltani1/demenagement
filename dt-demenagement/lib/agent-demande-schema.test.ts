import assert from 'node:assert'
import { agentDemandeSchema } from './agent-demande-schema'

const ok = agentDemandeSchema.safeParse({
  type: 'devis', clientNom: 'Ben Ali', clientTelephone: '21652000000',
  villeDepart: 'Tunis', villeArrivee: 'Sousse', dateApprox: 'Juillet 2026',
})
assert.equal(ok.success, true, 'essentiels suffisent')

const missing = agentDemandeSchema.safeParse({ type: 'devis', clientNom: 'X' })
assert.equal(missing.success, false, 'téléphone/villes/date requis')

const badType = agentDemandeSchema.safeParse({
  type: 'autre', clientNom: 'X', clientTelephone: '2165', villeDepart: 'a', villeArrivee: 'b', dateApprox: 'c',
})
assert.equal(badType.success, false, 'type invalide rejeté')
console.log('✅ agent-demande-schema OK')
