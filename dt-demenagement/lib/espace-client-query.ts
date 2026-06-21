// Clauses Payload + vérification exacte pour retrouver les dossiers/le client d'une identité.
// `like` est un préfiltre (ILIKE substring) → on RE-VÉRIFIE l'égalité exacte du numéro canonique.
import type { Where } from 'payload'
import { parseLoginIdentity } from '@/lib/client-identity'
import { normalizePhoneTN } from '@/lib/phone'

// 8 chiffres nationaux (sans le préfixe 216) pour le préfiltre `like` sur des numéros stockés en formats variés.
function nationalDigits(canonical: string): string {
  return canonical.startsWith('216') ? canonical.slice(3) : canonical
}

export function dossierOwnershipWhere(identity: string): Where {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: nationalDigits(parsed.canonical) } }
  }
  return { clientId: { equals: parsed.email } }
}

export function clientLookupWhere(identity: string): Where {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: nationalDigits(parsed.canonical) } }
  }
  return { email: { equals: parsed.email } }
}

// Vérification exacte après le préfiltre `like` (anti-accès inter-clients).
export function matchesIdentity(
  identity: string,
  doc: { clientId?: string | null; telephone?: string | null },
): boolean {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return parsed.canonical.length >= 8 && normalizePhoneTN(doc.telephone) === parsed.canonical
  }
  return true
}
