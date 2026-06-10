// Déroule un parcours devis complet à travers le moteur, hors WhatsApp.
// Sert de vérification : on lit les réponses du bot dans la console.
import { handleMessage } from './conversation.js'
import { getSession } from './sessions.js'

const NUMERO = '+21652000000'
const inputs = [
  '1',                 // menu -> devis
  '1',                 // type particulier
  'Ahmed',             // prénom
  'Ben Ali',           // nom
  'passer',            // email
  'Tunis',             // ville départ
  'Rue de Rome 12',    // adresse départ
  'Sfax',              // ville arrivée
  'Av. Habib 5',       // adresse arrivée
  '1,5',               // services
  'passer',            // date
  '35',                // volume
  'passer',            // photos
  'passer',            // commentaire
  'oui',               // confirmation
]

let session = getSession(NUMERO)
console.log('--- SIMULATION DEVIS ---')
for (const input of inputs) {
  const res = handleMessage(input, session)
  session = res.session
  console.log(`\n👤 ${input}`)
  res.replies.forEach((r) => console.log(`🤖 ${r}`))
  if (res.action) console.log(`⚡ ACTION: ${res.action.type}  DATA=${JSON.stringify(session.data)}`)
}
