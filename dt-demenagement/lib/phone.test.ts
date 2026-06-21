import assert from 'node:assert'
import { phoneCore, normalizePhoneTN } from './phone'

// phoneCore conservé (compat)
assert.equal(phoneCore('+216 52 880 311'), '52880311', 'phoneCore: 8 derniers')

// normalizePhoneTN — canonique tunisien 216XXXXXXXX
assert.equal(normalizePhoneTN('+216 52 880 311'), '21652880311', 'préfixe +216 espacé')
assert.equal(normalizePhoneTN('21652880311'), '21652880311', 'préfixe 216 collé')
assert.equal(normalizePhoneTN('0021652880311'), '21652880311', 'préfixe 00216')
assert.equal(normalizePhoneTN('52880311'), '21652880311', 'numéro nu 8 chiffres -> +216')
assert.equal(normalizePhoneTN('52 880 311'), '21652880311', 'séparateurs')
assert.equal(normalizePhoneTN('+33 6 12 34 56 78'), '33612345678', 'étranger -> tous les chiffres')
assert.equal(normalizePhoneTN(''), '', 'vide')
assert.equal(normalizePhoneTN(null), '', 'null')

console.log('✅ phone.test.ts — toutes les assertions passent')
