import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { buildDossierData, type RdvForConvert } from '@/lib/rdv-to-dossier'

const schema = z.object({ rdvId: z.union([z.string(), z.number()]) })

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })

  // Auth admin — même pattern que les autres routes /api/admin/*
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Données invalides' }, { status: 422 })
  }

  // depth: 0 → sourcePartenaire renvoyé comme id (pas un objet peuplé)
  const rdv = await payload
    .findByID({ collection: 'rendez-vous', id: parsed.data.rdvId, depth: 0, overrideAccess: true })
    .catch(() => null) as RdvForConvert | null
  if (!rdv) {
    return Response.json({ error: 'Rendez-vous introuvable' }, { status: 404 })
  }

  // La validité des données est garantie par les tests de lib/rdv-to-dossier.test.ts ;
  // le cast satisfait les types générés de Payload pour payload.create.
  try {
    const doc = await payload.create({
      collection: 'demenagements',
      data: buildDossierData(rdv) as RequiredDataFromCollectionSlug<'demenagements'>,
      overrideAccess: true,
    })

    // Anti-doublon : le RDV est désormais devenu un dossier → on retire la ligne
    // de la liste Rendez-vous (toutes les infos ont été recopiées dans le dossier).
    await payload
      .delete({ collection: 'rendez-vous', id: parsed.data.rdvId, overrideAccess: true })
      .catch((e: unknown) => {
        payload.logger.error(
          `[rdv-to-dossier] Dossier ${String(doc.id)} créé mais échec suppression du RDV ` +
            `${String(parsed.data.rdvId)} : ` + (e instanceof Error ? e.message : String(e)),
        )
      })

    return Response.json({ url: `/admin/collections/demenagements/${doc.id}` }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Échec de la création du dossier'
    return Response.json({ error: msg }, { status: 500 })
  }
}
