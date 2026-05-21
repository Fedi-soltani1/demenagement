import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { z } from 'zod'
import { DevisPDF } from '@/components/pdf/DevisPDF'

const schema = z.object({ dossierId: z.number() })

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Données invalides' }, { status: 422 })
  }

  const dossier = await payload.findByID({
    collection: 'demenagements',
    id: parsed.data.dossierId,
  })

  if (!dossier) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const pdfBuffer = await renderToBuffer(createElement(DevisPDF, { dossier }))

  const filename = `Devis-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
