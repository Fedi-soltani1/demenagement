// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { phoneCore } from './phone'

assert.equal(phoneCore('+216 52 880 311'), '52880311', 'format espacé avec indicatif')
assert.equal(phoneCore('21652880311'), '52880311', 'indicatif collé')
assert.equal(phoneCore('52880311'), '52880311', 'numéro nu')
assert.equal(phoneCore('+216-52-880-311'), '52880311', 'séparateurs tirets')
assert.equal(phoneCore(''), '', 'vide')
assert.equal(phoneCore(null), '', 'null')
assert.equal(phoneCore('12345'), '12345', 'moins de 8 chiffres -> inchangé')

console.log('✅ phone.test.ts — toutes les assertions passent')
