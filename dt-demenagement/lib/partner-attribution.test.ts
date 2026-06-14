// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { resolvePartner, type PartnerRef } from './partner-attribution'

const finder = async (slug: string): Promise<PartnerRef | null> =>
  slug === 'agence-x' ? { id: 7, nom: 'Agence X' } : null

const main = async (): Promise<void> => {
  assert.equal(await resolvePartner(undefined, finder), null, 'pas de slug -> null')
  assert.equal(await resolvePartner('', finder), null, 'slug vide -> null')
  assert.equal(await resolvePartner('inconnu', finder), null, 'introuvable -> null')
  assert.deepEqual(await resolvePartner('agence-x', finder), { id: 7, nom: 'Agence X' }, 'trouvé -> {id, nom}')
  console.log('✅ partner-attribution.test.ts — toutes les assertions passent')
}

void main()
