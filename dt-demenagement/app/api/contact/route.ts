import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendMail } from '@/lib/mailer'
import { env } from '@/lib/env'

// Endpoint léger pour le bloc « Formulaire de contact » embarquable.
// Collecte un lead simple (nom, téléphone, email, message) et crée
// un enregistrement « rendez-vous » (la collection des prises de contact).
// ⚠️ Rate limiting in-memory simple (sans Redis pour l'instant).
// ⚠️ TODO: Brancher Upstash Redis quand UPSTASH_REDIS_REST_URL est configuré.

const TEL_RE = /^\+?[0-9\s\-()]{6,20}$/

const contactSchema = z.object({
  // Honeypot anti-bot
  website:   z.string().max(0, 'Bot détecté').optional(),
  nom:       z.string().min(2, 'Nom trop court').max(100),
  telephone: z.string().regex(TEL_RE, 'Téléphone invalide'),
  email:     z.string().email('Email invalide').optional().or(z.literal('')),
  message:   z.string().max(2000).optional(),
})

// Rate limiting en mémoire : 5 requêtes / minute / IP.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Rate limiting AVANT tout traitement
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
  }

  // 2. Parse du body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  // 3. Honeypot
  if ((body as Record<string, unknown>).website) {
    return NextResponse.json({ error: 'Bot détecté' }, { status: 400 })
  }

  // 4. Validation Zod côté serveur
  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const d = result.data
  const email = d.email && d.email.length > 0 ? d.email : ''

  // 5. Traitement métier — création d'un lead dans « rendez-vous »
  // La collection « rendez-vous » regroupe les prises de contact reçues
  // depuis le site. Le message est stocké dans le champ libre « adresse ».
  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'rendez-vous',
      data: {
        statut:    'nouveau',
        type:      'client',
        nom:       d.nom,
        prenom:    '—',
        telephone: d.telephone,
        whatsapp:  d.telephone,
        email,
        adresse:   d.message ? `Message du formulaire de contact : ${d.message}` : '',
      },
      overrideAccess: true,
    })
  } catch {
    // Ne jamais logger de données personnelles. On signale un échec générique.
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }

  // Email de notification admin (non-bloquant)
  sendMail({
    to:      env.EMAIL_DEVIS_TO,
    subject: `📩 Nouveau message de contact — ${d.nom}`,
    html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <div style="background:#0f0f0f;padding:16px 24px;border-radius:8px 8px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:16px;">DT Déménagement — Formulaire de contact</h2>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#f9f9f9;border:1px solid #e0e0e0;border-top:none;">
    <tr><td style="padding:10px 16px;font-weight:bold;width:120px;">Nom</td><td style="padding:10px 16px;">${d.nom.replace(/</g, '&lt;')}</td></tr>
    <tr style="background:#fff;"><td style="padding:10px 16px;font-weight:bold;">Téléphone</td><td style="padding:10px 16px;">${d.telephone}</td></tr>
    ${email ? `<tr><td style="padding:10px 16px;font-weight:bold;">Email</td><td style="padding:10px 16px;">${email}</td></tr>` : ''}
    ${d.message ? `<tr style="background:#fff;"><td style="padding:10px 16px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:10px 16px;white-space:pre-wrap;">${d.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td></tr>` : ''}
  </table>
</body></html>`,
  }).catch(() => { /* non-bloquant */ })

  return NextResponse.json({ success: true }, { status: 201 })
}
