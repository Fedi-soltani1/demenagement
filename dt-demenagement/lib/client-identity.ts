// Distinction email vs téléphone pour la connexion espace client, et construction/lecture
// de l'identité technique des clients sans email : "<phoneCore>@wa.client".
import { phoneCore } from '@/lib/phone'

export const PHONE_IDENTITY_DOMAIN = 'wa.client'

// Une saisie est un email si elle contient un "@" (les numéros n'en contiennent jamais).
export function isEmailInput(input: string): boolean {
  return input.trim().includes('@')
}

export function buildPhoneIdentity(core: string): string {
  return `${core}@${PHONE_IDENTITY_DOMAIN}`
}

export function parseLoginIdentity(
  identity: string,
): { kind: 'email'; email: string } | { kind: 'phone'; phoneCore: string } {
  const id = identity.trim().toLowerCase()
  if (id.endsWith(`@${PHONE_IDENTITY_DOMAIN}`)) {
    return { kind: 'phone', phoneCore: phoneCore(id.split('@')[0] ?? '') }
  }
  return { kind: 'email', email: id }
}
