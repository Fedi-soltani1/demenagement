// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { slugify } from './slugify'

assert.equal(slugify('Agence Immo Tunis'), 'agence-immo-tunis', 'minuscules + tirets')
assert.equal(slugify('Déménageur Privé'), 'demenageur-prive', 'retire les accents')
assert.equal(slugify('  Société  A.B.C ! '), 'societe-a-b-c', 'ponctuation + tirets en trop')
assert.equal(slugify(''), '', 'chaîne vide')

console.log('✅ slugify.test.ts — toutes les assertions passent')
