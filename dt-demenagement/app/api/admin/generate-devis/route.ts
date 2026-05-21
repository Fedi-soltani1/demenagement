import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { z } from 'zod'
import { DevisPDF, type Dossier } from '@/components/pdf/DevisPDF'

const ligneSchema = z.object({
  designation:  z.string().nullish(),
  quantite:     z.number().nullish(),
  prixUnitaire: z.number().nullish(),
}).passthrough()

const overridesSchema = z.object({
  prixTotalTTC:       z.number().nullish(),
  devisValiditeJours: z.number().nullish(),
  devisNotes:         z.string().nullish(),
  lignesDevis:        z.array(ligneSchema).optional(),
})

const schema = z.object({
  dossierId: z.number(),
  overrides: overridesSchema.optional(),
})

export async function POST(request: NextRequest): Promise<Response> {
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

  // Merge live overrides from the admin form (unsaved field values)
  const dossier = {
    ...raw,
    ...Object.fromEntries(
      Object.entries(parsed.data.overrides ?? {}).filter(([, v]) => v !== undefined && v !== null)
    ),
  }

  const element   = createElement(DevisPDF, { dossier: dossier as unknown as Dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const filename  = `Devis-${(dossier.numeroDossier as string | undefined) ?? parsed.data.dossierId}.pdf`

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
