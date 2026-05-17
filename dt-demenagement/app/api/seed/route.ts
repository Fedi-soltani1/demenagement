import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from '@/payload/seed'

// ─────────────────────────────────────────────────────────────────
// Route : GET /api/seed?secret=XXXX
// Lancée par : pnpm seed (voir package.json)
// Protégée par SEED_SECRET — non disponible en production
// ─────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Secret invalide — ajoute SEED_SECRET dans .env.local' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seed(payload)
    return NextResponse.json({ success: true, message: 'Seed terminé — voir les logs du terminal' })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
