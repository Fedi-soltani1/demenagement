import type { Payload } from 'payload'

// Crée ou met à jour une fiche client, dédupliquée par EMAIL si présent,
// sinon par TÉLÉPHONE (correspondance exacte). Utilisé par toutes les sources
// qui doivent rattacher automatiquement un client : devis, RDV, conversion de lead.
// Email optionnel : un client peut être identifié par email OU par téléphone.

export interface ClientInput {
  email?:     string | null
  telephone?: string | null
  prenom?:    string | null
  nom?:       string | null
}

interface ClientDoc { id: string | number }

export async function upsertClient(payload: Payload, input: ClientInput): Promise<void> {
  const email     = (input.email ?? '').trim() || undefined
  const telephone = (input.telephone ?? '').trim() || undefined

  // Sans identifiant déduplicable, on ne crée rien (éviterait des doublons fantômes).
  if (!email && !telephone) return

  // 1. Recherche d'un client existant : email d'abord (clé fiable), sinon téléphone.
  let existing: ClientDoc | null = null
  if (email) {
    const r = await payload.find({
      collection: 'clients', where: { email: { equals: email } }, limit: 1, overrideAccess: true,
    })
    existing = (r.docs[0] as ClientDoc | undefined) ?? null
  }
  if (!existing && telephone) {
    const r = await payload.find({
      collection: 'clients', where: { telephone: { equals: telephone } }, limit: 1, overrideAccess: true,
    })
    existing = (r.docs[0] as ClientDoc | undefined) ?? null
  }

  // 2. Champs à écrire (on n'écrase pas avec des valeurs vides).
  const data: Record<string, unknown> = {
    ...(input.prenom ? { prenom: input.prenom } : {}),
    ...(input.nom    ? { nom: input.nom }       : {}),
    ...(telephone    ? { telephone }            : {}),
    ...(email        ? { email }                : {}),
  }

  if (existing) {
    await payload.update({ collection: 'clients', id: existing.id, data, overrideAccess: true })
    return
  }

  // 3. Création — prénom/nom requis par la collection → placeholder si absent.
  await payload.create({
    collection: 'clients',
    data: {
      ...(email ? { email } : {}),
      prenom:    input.prenom || '(à compléter)',
      nom:       input.nom    || '(à compléter)',
      ...(telephone ? { telephone } : {}),
    },
    overrideAccess: true,
  })
}
