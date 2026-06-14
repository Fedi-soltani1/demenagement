import { getPayload, type Where } from 'payload'
import config from '@payload-config'

/** Sous-détail PARTENAIRE des demandes NON TRAITÉES (devis « reçu » + RDV « nouveau »).
 *  Les totaux globaux (tous = site + partenaires) viennent de /api/admin/dashboard-stats. */
export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const devisWhere: Where = { and: [{ statut: { equals: 'devis_recu' } }, { sourcePartenaire: { exists: true } }] }
  const rdvWhere:   Where = { and: [{ statut: { equals: 'nouveau'    } }, { sourcePartenaire: { exists: true } }] }

  const [devis, rdv] = await Promise.all([
    payload.find({ collection: 'demenagements', where: devisWhere, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'rendez-vous',  where: rdvWhere,   limit: 100, depth: 0, overrideAccess: true }),
  ])

  const noms = Array.from(new Set(
    [...devis.docs, ...rdv.docs]
      .map((d) => (d as { sourcePartenaireNom?: string | null }).sourcePartenaireNom)
      .filter((n): n is string => Boolean(n))
      .map((n) => n.trim()),
  ))

  return Response.json({ devis: devis.totalDocs, rdv: rdv.totalDocs, partenaires: noms })
}
