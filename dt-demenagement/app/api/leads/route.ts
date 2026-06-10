import { NextResponse } from 'next/server'
import { getPayloadSafe } from '@/lib/payload-safe'

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>

    const nomPrenom = typeof body.nomPrenom === 'string' ? body.nomPrenom.trim() : ''
    const telephone = typeof body.telephone === 'string' ? body.telephone.trim() : ''
    const email     = typeof body.email     === 'string' ? body.email.trim()     : ''
    const source    = typeof body.source    === 'string' ? body.source            : ''
    const service   = typeof body.service   === 'string' ? body.service           : ''
    const ville     = typeof body.ville     === 'string' ? body.ville             : ''

    if (!nomPrenom || !telephone) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const payload = await getPayloadSafe()
    if (payload) {
      await payload.create({
        collection: 'leads',
        data: {
          nomPrenom,
          telephone,
          ...(email   ? { email }   : {}),
          ...(source  ? { source }  : {}),
          ...(service ? { service } : {}),
          ...(ville   ? { ville }   : {}),
          statut: 'nouveau',
        },
        overrideAccess: true,
      })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[leads] Échec enregistrement lead :', err)
    // Ne jamais bloquer l'UX — on répond 200 même en cas d'erreur
    return NextResponse.json({ ok: true })
  }
}
