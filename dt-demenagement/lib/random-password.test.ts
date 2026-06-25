import assert from 'node:assert'
import { randomPassword } from './random-password'

const pwd = randomPassword()
assert.equal(typeof pwd, 'string', 'retourne une chaîne')
assert.equal(pwd.length, 12, 'longueur par défaut = 12')
assert.match(pwd, /^[A-HJ-NP-Za-hj-np-z2-9]+$/, 'pas de caractères ambigus (0,O,1,l,I)')
assert.notEqual(randomPassword(), randomPassword(), 'deux appels diffèrent')
assert.equal(randomPassword(20).length, 20, 'longueur paramétrable')
console.log('✅ random-password OK')
