import assert from 'node:assert'
import { buildAgentCredentialsWhatsApp } from './agent-credentials-whatsapp'

const msg = buildAgentCredentialsWhatsApp({
  prenom: 'Sami', email: 'sami@agence.tn', tempPassword: 'Abc23xyz', appUrl: 'https://demenagement.tn/agent',
})
assert.equal(typeof msg, 'string', 'retourne une chaîne')
assert.match(msg, /Sami/, 'contient le prénom')
assert.match(msg, /sami@agence\.tn/, 'contient l\'email identifiant')
assert.match(msg, /Abc23xyz/, 'contient le mot de passe')
assert.match(msg, /https:\/\/demenagement\.tn\/agent/, 'contient le lien de l\'app')
assert.match(msg, /DT Déménagement/, 'mentionne la marque')
console.log('✅ agent-credentials-whatsapp OK')
