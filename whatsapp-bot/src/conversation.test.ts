import assert from 'node:assert'
import { handleMessage, GREETING } from './conversation.js'
import { type Session } from './sessions.js'

function fresh(): Session {
  return { numero: '+21653064275', flux: 'menu', stepIndex: 0, data: {}, mediaIds: [], updatedAt: 0 }
}
// Joue une suite de messages et renvoie le dernier EngineResult.
function run(session: Session, inputs: string[]) {
  let res = handleMessage(inputs[0]!, session)
  for (const i of inputs.slice(1)) res = handleMessage(i, res.session)
  return res
}

// 1. Première interaction → salutation + demande prénom (sans consommer le texte)
{
  const r = handleMessage('Bonjour', fresh())
  assert.equal(r.replies[0], GREETING, 'salutation en premier')
  assert.ok(r.replies[1]?.includes('prénom'), 'puis demande le prénom')
  assert.equal(r.session.flux, 'preambule', 'passe en préambule')
}

// 2. Préambule complet (canal WhatsApp → email sauté) → "pas maintenant" → action lead
{
  const r = run(fresh(), ['salut', 'Fedi', 'Soltani', '1', '3'])
  // 'salut'→greeting+prénom ; 'Fedi'→nom ; 'Soltani'→canal ; '1'(whatsapp)→intention (email sauté) ; '3'→lead
  assert.deepEqual(r.action, { type: 'submit-lead' }, 'pas maintenant -> submit-lead')
  assert.equal(r.session.data.prenom, 'Fedi')
  assert.equal(r.session.data.nom, 'Soltani')
  assert.equal(r.session.data.canal, 'whatsapp')
  assert.equal(r.session.data.email, undefined, 'email non demandé si WhatsApp')
}

// 3. Canal WhatsApp → Devis : le flux devis NE redemande PAS l'identité (1re question = type)
{
  const r = run(fresh(), ['salut', 'Fedi', 'Soltani', '1', '1'])
  // '1'(canal whatsapp) ; '1'(intention devis)
  assert.equal(r.session.flux, 'devis', 'passe au flux devis')
  assert.ok(r.replies[0]?.includes('Type de client'), 'devis commence par le type, pas le prénom')
}

// 4. Canal Email → email demandé ; invalide rejeté ; valide accepté
{
  let r = run(fresh(), ['salut', 'Fedi', 'Soltani', '2'])  // canal email
  assert.ok(r.replies[0]?.toLowerCase().includes('email'), 'demande l\'email si canal email')
  r = handleMessage('pas-un-email', r.session)
  assert.ok(r.replies[0]?.toLowerCase().includes('invalide'), 'email invalide rejeté')
  r = handleMessage('fedi@mail.tn', r.session)
  assert.ok(r.replies[0]?.includes('souhaitez'), 'email valide -> passe à l\'intention')
  assert.equal(r.session.data.email, 'fedi@mail.tn')
}

// 5. "annuler" recommence au préambule
{
  const r = run(fresh(), ['salut', 'Fedi', 'annuler'])
  assert.equal(r.session.flux, 'preambule')
  assert.equal(r.session.data.prenom, undefined, 'données effacées')
  assert.ok(r.replies.some((x) => x.includes('prénom')), 'redemande le prénom')
}

console.log('✅ conversation.test.ts — toutes les assertions passent')
