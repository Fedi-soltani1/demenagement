import type { Payload } from 'payload'
import { normalizePhoneTN } from '@/lib/phone'
import { buildPhoneIdentity, isSyntheticIdentity } from '@/lib/client-identity'

export interface ClientInput {
  email?:     string | null
  telephone?: string | null
  prenom?:    string | null
  nom?:       string | null
}

interface ClientDoc { id: string | number; email?: string | null; telephone?: string | null }

// Crée/maj UNE fiche client, dédupliquée par vrai email si présent, sinon par téléphone canonique.
// Un client sans vrai email reçoit l'identité synthétique « <canonique>@wa.client » dans `email`
// (pour dédup + historique). Tout email synthétique stocké est ignoré comme « pas un vrai email ».
export async function upsertClient(payload: Payload, input: ClientInput): Promise<void> {
  const realEmail = input.email && !isSyntheticIdentity(input.email) ? input.email.trim().toLowerCase() : undefined
  const canonical = normalizePhoneTN(input.telephone)
  if (!realEmail && !canonical) return

  // 1. Recherche : vrai email d'abord, sinon téléphone canonique (préfiltre like + filtre exact).
  let existing: ClientDoc | null = null
  if (realEmail) {
    const r = await payload.find({ collection: 'clients', where: { email: { equals: realEmail } }, limit: 1, overrideAccess: true })
    existing = (r.docs[0] as ClientDoc | undefined) ?? null
  }
  if (!existing && canonical) {
    const national = canonical.startsWith('216') ? canonical.slice(3) : canonical
    const r = await payload.find({ collection: 'clients', where: { telephone: { like: national } }, limit: 20, overrideAccess: true })
    existing = (r.docs as ClientDoc[]).find((c) => normalizePhoneTN(c.telephone) === canonical) ?? null
  }

  // 2. email à écrire : vrai email prioritaire ; sinon identité synthétique ; sinon on n'y touche pas.
  const emailToWrite = realEmail ?? (canonical ? buildPhoneIdentity(canonical) : undefined)

  const data: Record<string, unknown> = {
    ...(input.prenom ? { prenom: input.prenom } : {}),
    ...(input.nom ? { nom: input.nom } : {}),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    // Ne pas écraser un vrai email existant par une identité synthétique :
    ...(realEmail ? { email: realEmail } : {}),
  }

  if (existing) {
    await payload.update({ collection: 'clients', id: existing.id, data, overrideAccess: true })
    return
  }

  await payload.create({
    collection: 'clients',
    data: {
      ...(emailToWrite ? { email: emailToWrite } : {}),
      prenom:    input.prenom || '(à compléter)',
      nom:       input.nom || '(à compléter)',
      ...(input.telephone ? { telephone: input.telephone } : {}),
    },
    overrideAccess: true,
  })
}
