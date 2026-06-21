// Construit les clauses Payload pour retrouver les dossiers et la fiche d'un client
// à partir de son identité de session : email réel OU identité technique téléphone.
import { parseLoginIdentity } from '@/lib/client-identity'

export function dossierOwnershipWhere(identity: string): Record<string, unknown> {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: parsed.phoneCore } }
  }
  return { clientId: { equals: parsed.email } }
}

export function clientLookupWhere(identity: string): Record<string, unknown> {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: parsed.phoneCore } }
  }
  return { email: { equals: parsed.email } }
}
