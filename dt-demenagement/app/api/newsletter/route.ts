import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { env } from '@/lib/env'
import { rateLimit, clientIp } from '@/lib/ratelimit'

const schema = z.object({
  website: z.string().max(0).optional(), // honeypot
  email:   z.string().email(),
  locale:  z.enum(['fr', 'ar', 'en']).default('fr'),
})

export async function POST(request: Request) {
  // Rate limiting AVANT tout traitement (5 requêtes / minute / IP)
  if (!(await rateLimit(`newsletter:${clientIp(request)}`, 5, 60_000))) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  // Honeypot
  if ((body as Record<string, unknown>).website) {
    return NextResponse.json({ error: 'Bot' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { email, locale } = result.data

  // 1. Sauvegarder dans Payload CMS (collection Newsletter)
  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'newsletter',
      data: { email, locale, actif: true },
      overrideAccess: true,
    })
  } catch {
    // L'email existe peut-être déjà — ce n'est pas bloquant
  }

  // 2. Ajouter à la liste Brevo
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method:  'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds:        [Number(env.BREVO_LIST_ID)],
        updateEnabled:  true,
        attributes:     { LANGUE: locale.toUpperCase() },
      }),
    })
  } catch {
    // Brevo non bloquant
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
