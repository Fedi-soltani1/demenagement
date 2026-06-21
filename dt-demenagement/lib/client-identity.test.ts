// lib/client-identity.test.ts
import assert from 'node:assert'
import { isEmailInput, buildPhoneIdentity, parseLoginIdentity, PHONE_IDENTITY_DOMAIN } from './client-identity'

// isEmailInput
assert.equal(isEmailInput('a@b.tn'), true, 'email détecté')
assert.equal(isEmailInput('  Foo@Bar.com '), true, 'email avec espaces/casse')
assert.equal(isEmailInput('+216 52 880 311'), false, 'téléphone non-email')
assert.equal(isEmailInput('52880311'), false, 'chiffres = téléphone')

// buildPhoneIdentity
assert.equal(buildPhoneIdentity('52880311'), `52880311@${PHONE_IDENTITY_DOMAIN}`, 'identité téléphone')

// parseLoginIdentity
assert.deepEqual(parseLoginIdentity('client@mail.tn'), { kind: 'email', email: 'client@mail.tn' }, 'identité email')
assert.deepEqual(parseLoginIdentity('52880311@wa.client'), { kind: 'phone', phoneCore: '52880311' }, 'identité téléphone')
assert.deepEqual(parseLoginIdentity('FOO@MAIL.TN'), { kind: 'email', email: 'foo@mail.tn' }, 'email normalisé en minuscules')

console.log('✅ client-identity.test.ts — toutes les assertions passent')
