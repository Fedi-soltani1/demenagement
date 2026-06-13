import assert from 'node:assert'
import { senderNumero } from './numero.js'

// Numéro direct (@s.whatsapp.net)
assert.equal(senderNumero({ remoteJid: '21653064275@s.whatsapp.net' }), '+21653064275', 'pn direct')

// Avec suffixe de device (:12)
assert.equal(senderNumero({ remoteJid: '21653064275:12@s.whatsapp.net' }), '+21653064275', 'suffixe device')

// LID seul → null (NE PLUS produire +271197841408022)
assert.equal(senderNumero({ remoteJid: '271197841408022@lid' }), null, 'lid seul -> null')

// LID + senderPn → on prend le vrai numéro
assert.equal(
  senderNumero({ remoteJid: '271197841408022@lid', senderPn: '21653064275@s.whatsapp.net' }),
  '+21653064275',
  'lid + senderPn -> vrai numéro',
)

// Rien → null
assert.equal(senderNumero({}), null, 'vide -> null')

console.log('✅ numero.test.ts — toutes les assertions passent')
