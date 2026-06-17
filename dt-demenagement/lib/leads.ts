import type { Payload } from 'payload'

// Statuts de conversion possibles d'un lead initial (popup « Devis Gratuit »).
// Un lead reste « nouveau » tant qu'il n'a PAS terminé le process. Dès qu'il
// soumet un devis complet ou planifie un RDV en ligne, il quitte la liste des
// abandons via l'un de ces statuts.
type LeadConversionStatut = 'devis_soumis' | 'rdv_planifie'

// On compare les téléphones uniquement sur leurs chiffres : le numéro saisi
// dans le popup peut différer du numéro final (espaces, +216, tirets…) sans
// que ce soit deux personnes différentes.
function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Marque comme « converti » le(s) lead(s) au statut « nouveau » correspondant
 * au téléphone fourni, lorsqu'un prospect TERMINE le process (devis ou RDV).
 *
 * Le rapprochement se fait sur les chiffres du téléphone (normalisé) pour
 * résister aux différences de format. Volontairement non bloquant : si la mise
 * à jour échoue, on ne casse jamais la création du devis/RDV — on logue.
 */
export async function markLeadConverted(
  payload: Payload,
  telephone: string,
  statut: LeadConversionStatut,
): Promise<void> {
  const cible = normalizePhone(telephone)
  if (!cible) return

  try {
    // On parcourt TOUTES les pages de leads encore « nouveau » (les abandons
    // potentiels) — pas de plafond, pour ne manquer aucune correspondance.
    const aConvertir: (string | number)[] = []
    let page = 1
    for (;;) {
      const lot = await payload.find({
        collection: 'leads',
        where: { statut: { equals: 'nouveau' } },
        limit: 200,
        page,
        overrideAccess: true,
      })
      for (const lead of lot.docs) {
        if (typeof lead.telephone === 'string' && normalizePhone(lead.telephone) === cible) {
          aConvertir.push(lead.id)
        }
      }
      if (!lot.hasNextPage) break
      page += 1
    }

    await Promise.all(
      aConvertir.map((id) =>
        payload.update({
          collection: 'leads',
          id,
          data: { statut },
          overrideAccess: true,
        }),
      ),
    )
  } catch (err) {
    payload.logger.error(
      `[leads] Échec marquage conversion (${statut}) pour ${cible} : ` +
        (err instanceof Error ? err.message : String(err)),
    )
  }
}
