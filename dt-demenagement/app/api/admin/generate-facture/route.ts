import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { z } from 'zod'
import { FacturePDF, type FactureDossier } from '@/components/pdf/FacturePDF'

const overridesSchema = z.object({
  facturePrixTTC:    z.number().nullish(),
  factureTauxTVA:    z.number().nullish(),
  factureEcheanceLe: z.string().nullish(),
  factureNotes:      z.string().nullish(),
})

const schema = z.object({
  dossierId: z.number(),
  overrides: overridesSchema.optional(),
})

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.collection !== 'admins') {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body: unknown = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 422 })
    }

    const raw = await payload.findByID({
      collection: 'demenagements',
      id: parsed.data.dossierId,
    })

    if (!raw) {
      return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    if ((raw as Record<string, unknown>).devisStatut !== 'accepte') {
      return Response.json({ error: 'La facture ne peut être générée que si le devis est accepté par le client.' }, { status: 422 })
    }

    let matriculeFiscal = ''
    try {
      const settings = await payload.findGlobal({ slug: 'settings', overrideAccess: true }) as Record<string, unknown>
      matriculeFiscal = typeof settings.matriculeFiscal === 'string' ? settings.matriculeFiscal : ''
    } catch {
      // Settings global unavailable — proceed without matricule fiscal
    }

    const dossier: FactureDossier = {
      ...(raw as unknown as FactureDossier),
      ...Object.fromEntries(
        Object.entries(parsed.data.overrides ?? {}).filter(([, v]) => v !== undefined && v !== null)
      ),
      matriculeFiscal,
    }

    if (dossier.facturePrixTTC == null || dossier.facturePrixTTC <= 0) {
      return Response.json({ error: 'Le montant total TTC doit être renseigné avant de générer la facture.' }, { status: 422 })
    }

    const element   = createElement(FacturePDF, { dossier }) as ReactElement<DocumentProps>
    const pdfBuffer = await renderToBuffer(element)
    const filename  = `Facture-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[generate-facture] error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: `Erreur : ${msg}` }, { status: 500 })
  }
}
