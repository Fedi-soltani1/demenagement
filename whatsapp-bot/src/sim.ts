// Déroule un parcours devis complet à travers le moteur, hors WhatsApp.
// Sert de vérification : on lit les réponses du bot dans la console.
//
// Séquence préambule + devis :
//   'salut'         → greeting émis + question prénom (message non consommé = 1ère interaction)
//   'Ahmed'         → prénom
//   'Ben Ali'       → nom
//   '1'             → canal WhatsApp (email sauté)
//   '1'             → intention Devis → bascule flux devis
//   '1'             → type Particulier
//   'Tunis'         → villeDepart
//   'Rue des Roses' → adresseDepart
//   'Sfax'          → villeArrivee
//   'Avenue Habib'  → adresseArrivee
//   '1,3'           → services
//   'passer'        → dateSouhaitee (optionnel)
//   'passer'        → volumeEstime (optionnel)
//   'passer'        → photos (optionnel)
//   'passer'        → commentaire (optionnel)
//   'oui'           → confirmation → submit-devis
import { handleMessage } from './conversation.js'
import { getSession } from './sessions.js'

const NUMERO = '+21652000000'
const inputs = [
  'salut',            // 1ère interaction → greeting + demande prénom (non consommé)
  'Ahmed',            // prénom
  'Ben Ali',          // nom
  '1',                // canal WhatsApp (email sauté)
  '1',                // intention Devis → bascule flux devis
  '1',                // type Particulier
  'Tunis',            // villeDepart
  'Rue des Roses',    // adresseDepart
  'Sfax',             // villeArrivee
  'Avenue Habib',     // adresseArrivee
  '1,3',              // services
  'passer',           // dateSouhaitee (optionnel)
  'passer',           // volumeEstime (optionnel)
  'passer',           // photos (optionnel)
  'passer',           // commentaire (optionnel)
  'oui',              // confirmation → submit-devis
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
