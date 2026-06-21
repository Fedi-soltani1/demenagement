// Source de vérité unique pour l'identité de connexion à l'espace client.
// Email réel OU identité téléphone synthétique « <canonique>@wa.client » (canonique = normalizePhoneTN).
import { normalizePhoneTN } from '@/lib/phone'

export const PHONE_IDENTITY_DOMAIN = 'wa.client'

// Une saisie est un email si elle contient un « @ » (un numéro n'en contient jamais).
export function isEmailInput(input: string): boolean {
  return input.trim().includes('@')
}

// true si la valeur est une identité téléphone synthétique (pas un vrai email).
// Couvre le format actuel « <canonique>@wa.client » ET l'ancien format « wa.<chiffres>@dt-demenagement.tn ».
export function isSyntheticIdentity(value: string | null | undefined): boolean {
  const v = (value ?? '').trim().toLowerCase()
  return v.endsWith(`@${PHONE_IDENTITY_DOMAIN}`) || /^wa\.\d+@dt-demenagement\.tn$/.test(v)
}

export function buildPhoneIdentity(canonical: string): string {
  return `${canonical}@${PHONE_IDENTITY_DOMAIN}`
}

export function parseLoginIdentity(
  identity: string,
): { kind: 'email'; email: string } | { kind: 'phone'; canonical: string } {
  const id = identity.trim().toLowerCase()
  if (id.endsWith(`@${PHONE_IDENTITY_DOMAIN}`)) {
    return { kind: 'phone', canonical: normalizePhoneTN(id.split('@')[0] ?? '') }
  }
  return { kind: 'email', email: id }
}
