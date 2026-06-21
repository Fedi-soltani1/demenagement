import assert from 'node:assert'
import { isEmailInput, isSyntheticIdentity, buildPhoneIdentity, parseLoginIdentity, PHONE_IDENTITY_DOMAIN } from './client-identity'

assert.equal(PHONE_IDENTITY_DOMAIN, 'wa.client', 'domaine identité')

// isEmailInput
assert.equal(isEmailInput('a@b.tn'), true, 'email')
assert.equal(isEmailInput('+216 52 880 311'), false, 'téléphone')

// isSyntheticIdentity
assert.equal(isSyntheticIdentity('21652880311@wa.client'), true, 'synthétique')
assert.equal(isSyntheticIdentity('alice@mail.tn'), false, 'vrai email')
assert.equal(isSyntheticIdentity('wa.21652880311@dt-demenagement.tn'), false, 'ancien format B = PAS @wa.client')
assert.equal(isSyntheticIdentity(null), false, 'null')

// buildPhoneIdentity
assert.equal(buildPhoneIdentity('21652880311'), '21652880311@wa.client', 'build identité')

// parseLoginIdentity
assert.deepEqual(parseLoginIdentity('alice@mail.tn'), { kind: 'email', email: 'alice@mail.tn' }, 'email')
assert.deepEqual(parseLoginIdentity('FOO@MAIL.TN'), { kind: 'email', email: 'foo@mail.tn' }, 'email minuscule')
assert.deepEqual(parseLoginIdentity('21652880311@wa.client'), { kind: 'phone', canonical: '21652880311' }, 'téléphone canonique')

console.log('✅ client-identity.test.ts — toutes les assertions passent')
