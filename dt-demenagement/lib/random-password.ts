import { randomInt } from 'node:crypto'

// Mot de passe temporaire lisible : exclut les caractères ambigus (0, O, 1, l, I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

export function randomPassword(length = 12): string {
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}
