import type { Payload } from 'payload'

export interface PartnerRef { id: number | string; nom: string }

/** Résout un partenaire à partir de la valeur du cookie. `finder` interroge la base.
 *  Renvoie null si pas de slug ou partenaire introuvable (donc pas d'attribution). */
export async function resolvePartner(
  slug: string | undefined,
  finder: (slug: string) => Promise<PartnerRef | null>,
): Promise<PartnerRef | null> {
  if (!slug || !slug.trim()) return null
  return finder(slug.trim())
}

/** Crée un `finder` basé sur le Payload local API. */
export function payloadPartnerFinder(payload: Pick<Payload, 'find'>) {
  return async (slug: string): Promise<PartnerRef | null> => {
    const res = await payload.find({
      collection: 'affiliates',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = res.docs[0]
    return doc ? { id: doc.id, nom: (doc as { nom?: string }).nom ?? '' } : null
  }
}
