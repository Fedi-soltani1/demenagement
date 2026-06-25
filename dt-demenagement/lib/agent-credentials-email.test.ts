import assert from 'node:assert'
import { buildAgentCredentialsEmail } from './agent-credentials-email'

const { subject, html } = buildAgentCredentialsEmail({
  prenom: 'Sami', email: 'sami@agence.tn', tempPassword: 'Abc23xyz', appUrl: 'https://demenagement.tn/agent',
})
assert.match(subject, /DT Déménagement/, 'sujet mentionne la marque')
assert.match(html, /Sami/, 'html contient le prénom')
assert.match(html, /sami@agence\.tn/, 'html contient l\'email identifiant')
assert.match(html, /Abc23xyz/, 'html contient le mot de passe temporaire')
assert.match(html, /https:\/\/demenagement\.tn\/agent/, 'html contient le lien de l\'app')
console.log('✅ agent-credentials-email OK')
