// Construit les clauses Payload pour retrouver les dossiers et la fiche d'un client
// à partir de son identité de session : email réel OU identité technique téléphone.
import type { Where } from 'payload'
import { parseLoginIdentity } from '@/lib/client-identity'
import { phoneCore } from '@/lib/phone'

export function dossierOwnershipWhere(identity: string): Where {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: parsed.phoneCore } }
  }
  return { clientId: { equals: parsed.email } }
}

export function clientLookupWhere(identity: string): Where {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: parsed.phoneCore } }
  }
  return { email: { equals: parsed.email } }
}

// `like` est une sous-chaîne (ILIKE '%core%') côté SQL → on RE-VÉRIFIE en code
// l'égalité exacte du cœur de numéro (8 chiffres). Pour une identité email,
// la clause SQL `equals` est déjà exacte → toujours true ici.
export function matchesIdentity(
  identity: string,
  doc: { clientId?: string | null; telephone?: string | null },
): boolean {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return parsed.phoneCore.length >= 8 && phoneCore(doc.telephone) === parsed.phoneCore
  }
  return true
}
