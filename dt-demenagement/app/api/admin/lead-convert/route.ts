import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { buildRdvData, buildDevisData, splitNomPrenom, type LeadForConvert } from '@/lib/lead-convert'
import { upsertClient } from '@/lib/upsert-client'

const schema = z.object({
  leadId: z.union([z.string(), z.number()]),
  cible:  z.enum(['rdv', 'devis']),
})

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
  const { leadId, cible } = parsed.data

  // depth: 0 → sourcePartenaire renvoyé comme id (pas un objet peuplé)
  const lead = await payload
    .findByID({ collection: 'leads', id: leadId, depth: 0, overrideAccess: true })
    .catch(() => null) as LeadForConvert | null
  if (!lead) {
    return Response.json({ error: 'Lead introuvable' }, { status: 404 })
  }

  // Rattachement automatique d'une fiche client (par email ou téléphone) — non bloquant.
  const { prenom, nom } = splitNomPrenom(lead.nomPrenom)
  await upsertClient(payload, { email: lead.email, telephone: lead.telephone, prenom, nom })
    .catch((e: unknown) => { payload.logger.error(`[lead-convert] upsert client échoué : ${e instanceof Error ? e.message : String(e)}`) })

  // La validité des données est garantie par les tests de lib/lead-convert.test.ts ;
  // le cast satisfait les types générés de Payload pour payload.create.
  try {
    if (cible === 'rdv') {
      const doc = await payload.create({
        collection: 'rendez-vous',
        data: buildRdvData(lead) as RequiredDataFromCollectionSlug<'rendez-vous'>,
        overrideAccess: true,
      })
      await markLead(payload, leadId, 'rdv_planifie')
      return Response.json({ url: `/admin/collections/rendez-vous/${doc.id}` }, { status: 201 })
    }
    const doc = await payload.create({
      collection: 'demenagements',
      data: buildDevisData(lead) as RequiredDataFromCollectionSlug<'demenagements'>,
      overrideAccess: true,
    })
    await markLead(payload, leadId, 'devis_soumis')
    return Response.json({ url: `/admin/collections/demenagements/${doc.id}` }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Échec de la création du dossier'
    return Response.json({ error: msg }, { status: 500 })
  }
}

// Marquage du lead — non bloquant : le dossier existe déjà, on ne casse pas la réponse.
async function markLead(
  payload: Awaited<ReturnType<typeof getPayload>>,
  leadId: string | number,
  statut: 'rdv_planifie' | 'devis_soumis',
): Promise<void> {
  await payload
    .update({ collection: 'leads', id: leadId, data: { statut }, overrideAccess: true })
    .catch((e: unknown) => {
      payload.logger.error(
        `[lead-convert] Échec marquage lead ${String(leadId)} : ` +
          (e instanceof Error ? e.message : String(e)),
      )
    })
}
