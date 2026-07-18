import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ─────────────────────────────────────────────────────────────────
// Route utilitaire de traduction : écrit des valeurs localisées 'ar'
// sur les globals / documents. Protégée par SEED_SECRET, indisponible
// en production. Appelée pendant la passe de traduction FR → AR.
//
// POST /api/admin/i18n-seed?secret=XXXX
// Body: {
//   locale?: 'ar',
//   globals?: [{ slug: 'settings', data: {...} }],
//   docs?:    [{ collection: 'services', id: 12, data: {...} }]
// }
// ─────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

type GlobalItem = { slug: string; data: Record<string, unknown> }
type DocItem = { collection: string; id: string | number; data: Record<string, unknown> }

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Secret invalide' }, { status: 401 })
  }

  let body: { locale?: string; globals?: GlobalItem[]; docs?: DocItem[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const locale = (body.locale ?? 'ar') as 'ar' | 'fr'
  const results: Array<{ target: string; ok: boolean; error?: string }> = []

  try {
    const payload = await getPayload({ config })

    for (const g of body.globals ?? []) {
      try {
        await payload.updateGlobal({ slug: g.slug as never, locale, data: g.data as never, overrideAccess: true })
        results.push({ target: `global:${g.slug}`, ok: true })
      } catch (err) {
        results.push({ target: `global:${g.slug}`, ok: false, error: err instanceof Error ? err.message : String(err) })
      }
    }

    for (const d of body.docs ?? []) {
      try {
        await payload.update({ collection: d.collection as never, id: d.id, locale, data: d.data as never, overrideAccess: true })
        results.push({ target: `${d.collection}:${d.id}`, ok: true })
      } catch (err) {
        results.push({ target: `${d.collection}:${d.id}`, ok: false, error: err instanceof Error ? err.message : String(err) })
      }
    }

    const okCount = results.filter((r) => r.ok).length
    return NextResponse.json({ success: true, locale, okCount, total: results.length, results })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
