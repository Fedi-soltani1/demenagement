import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { DevisPDF, type Dossier } from '@/components/pdf/DevisPDF'

interface RouteContext {
  params: Promise<{ numeroDossier: string }>
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { numeroDossier } = await context.params

  const payload = await getPayload({ config })

  // Ownership check : numeroDossier + clientId
  const result = await payload.find({
    collection: 'demenagements',
    where: {
      numeroDossier: { equals: numeroDossier },
      clientId:      { equals: session.user.email },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (result.totalDocs === 0) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = result.docs[0]!

  // Ne pas exposer les brouillons
  const devisStatut = dossier.devisStatut as string | undefined
  if (!devisStatut || devisStatut === 'brouillon') {
    return Response.json({ error: 'Devis non disponible' }, { status: 403 })
  }

  const element   = createElement(DevisPDF, { dossier: dossier as unknown as Dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="Devis-${numeroDossier}.pdf"`,
      'Cache-Control':       'private, no-store',
    },
  })
}
