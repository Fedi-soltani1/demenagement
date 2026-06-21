import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendMail } from '@/lib/mailer'
import { env } from '@/lib/env'
import { rateLimit, clientIp } from '@/lib/ratelimit'

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

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Rate limiting AVANT tout traitement (5 requêtes / minute / IP)
  if (!(await rateLimit(`contact:${clientIp(request)}`, 5, 60_000))) {
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

  const adminUrl = `${(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/admin/collections/rendez-vous`

  // Email de notification admin (non-bloquant)
  sendMail({
    to:      env.EMAIL_DEVIS_TO,
    subject: `📩 Nouveau message de contact — ${d.nom}`,
    html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement — Message de contact</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Formulaire site web</p>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;width:120px;">NOM</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;font-weight:bold;">${d.nom.replace(/</g, '&lt;')}</td></tr>
            <tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">TÉLÉPHONE</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${d.telephone}</td></tr>
            ${email ? `<tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">EMAIL</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${email}</td></tr>` : ''}
            ${d.message ? `<tr><td style="padding:10px 0;color:#a0a0a0;font-size:12px;vertical-align:top;">MESSAGE</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;white-space:pre-wrap;">${d.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td></tr>` : ''}
          </table>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <a href="${adminUrl}" style="display:inline-block;background:#c9a84c;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            📋 Voir dans l'admin →
          </a>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  }).catch((err: unknown) => {
    console.error('[contact] Échec notification admin SMTP :', err)
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
