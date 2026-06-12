// Extraction du numéro de téléphone réel depuis la clé d'un message WhatsApp. Module PUR.
//
// ⚠️ WhatsApp adresse parfois la conversation via un JID `@lid` (Linked ID : un identifiant
// interne de confidentialité, qui N'EST PAS le numéro de téléphone). Si on le prend pour
// un numéro, on stocke un faux numéro (ex. +271197841408022). Dans ce cas, le vrai numéro
// se trouve dans `key.senderPn` (un JID `@s.whatsapp.net`).

export interface JidKey {
  remoteJid?: string | null
  senderPn?:  string | null
}

/**
 * Renvoie le numéro réel de l'expéditeur au format `+<chiffres>`, ou `null` si on ne peut
 * pas le déterminer de façon fiable (ex. message en `@lid` sans `senderPn`).
 * On préfère TOUJOURS un vrai numéro à un faux : mieux vaut null que des chiffres LID.
 */
export function senderNumero(key: JidKey): string | null {
  // Le numéro de téléphone (senderPn) prime ; sinon le remoteJid s'il est déjà un numéro.
  const pnJid = key.senderPn ?? key.remoteJid ?? ''
  if (pnJid.endsWith('@lid')) return null // on n'a qu'un LID → pas de vrai numéro
  const digits = pnJid.split('@')[0]?.split(':')[0] ?? '' // retire @domaine et :suffixe-device
  return /^[0-9]{6,15}$/.test(digits) ? '+' + digits : null
}
