import assert from 'node:assert'
import { buildAgentNotificationEmail } from './agent-notification-email'

const { subject, html } = buildAgentNotificationEmail({
  prenom: 'Sami', titre: 'Commission', message: 'Commission de 10% sur le dossier Ben Ali.', appUrl: 'https://demenagement.tn/agent',
})
assert.match(subject, /DT Déménagement/, 'sujet mentionne la marque')
assert.match(html, /Sami/, 'contient le prénom')
assert.match(html, /Commission de 10%/, 'contient le message')
assert.match(html, /https:\/\/demenagement\.tn\/agent/, 'contient le lien de l\'app')
// Sans titre : pas de crash
const r2 = buildAgentNotificationEmail({ prenom: 'X', titre: '', message: 'Hello', appUrl: 'u' })
assert.match(r2.html, /Hello/, 'gère titre vide')
console.log('✅ agent-notification-email OK')
