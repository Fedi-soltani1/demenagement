import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { sendMail } from '@/lib/mailer'
import { escapeHtml } from '@/lib/escape-html'

const phoneSchema = z.object({
  name:      z.string().min(1).max(100),
  telephone: z.string().regex(/^\+?[0-9\s\-().]{8,20}$/),
})

const emailSchema = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email(),
})

function phoneToVirtualEmail(phone: string): string {
  return `wa.${phone.replace(/\D/g, '')}@dt-demenagement.tn`
}

function splitName(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { prenom: parts[0] ?? '', nom: '' }
  return { prenom: parts[0] ?? '', nom: parts.slice(1).join(' ') }
}

export async function POST(request: NextRequest): Promise<Response> {
  const body: unknown = await request.json().catch(() => null)

  // ── Phone / WhatsApp path ───────────────────────────────────────────────────
  const phoneParsed = phoneSchema.safeParse(body)
  if (phoneParsed.success) {
    if (!env.BOT_SEND_URL || !env.BOT_SEND_SECRET)
      return Response.json({ success: true }) // Bot not configured — silent

    const { name, telephone } = phoneParsed.data
    const vEmail = phoneToVirtualEmail(telephone)
    const { prenom, nom } = splitName(name)

    try {
      const payload = await getPayload({ config })

      const existing = await payload.find({
        collection: 'clients',
        where: { email: { equals: vEmail } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'clients',
          data: { email: vEmail, prenom, nom, telephone },
          overrideAccess: true,
        })
      }

      const magicLink = await generateMagicLink(vEmail, '/espace-client')
      const message =
        `Bonjour ${prenom} 👋\n\n` +
        `Votre lien d'accès DT Déménagement :\n\n` +
        `🔗 ${magicLink}\n\n` +
        `⏱ Valable 24 heures — usage unique.\n\n` +
        `Suivez votre dossier et consultez votre devis depuis votre espace client.`

      await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-message`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
        body:    JSON.stringify({ telephone, message }),
      })
    } catch { /* silent — don't block the user */ }

    return Response.json({ success: true })
  }

  // ── Email path ──────────────────────────────────────────────────────────────
  const emailParsed = emailSchema.safeParse(body)
  if (emailParsed.success) {
    const { name, email } = emailParsed.data
    const { prenom, nom } = splitName(name)

    try {
      const payload = await getPayload({ config })

      const existing = await payload.find({
        collection: 'clients',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'clients',
          data: { email, prenom, nom },
          overrideAccess: true,
        })
      }

      const magicLink = await generateMagicLink(email, '/espace-client')

      await sendMail({
        to:      email,
        subject: 'Votre lien d\'accès — DT Déménagement',
        html:    buildAccessEmail(prenom, magicLink),
      })
    } catch { /* silent */ }

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Données invalides' }, { status: 422 })
}

function buildAccessEmail(prenom: string, magicLink: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr>
          <td style="background:#b52027;padding:20px 28px;">
            <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Votre espace client</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 20px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Bonjour <strong>${escapeHtml(prenom)}</strong>,<br><br>
              Accédez à votre espace client pour suivre votre demande de devis en temps réel.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="background:#b52027;border-radius:8px;">
                  <a href="${magicLink}"
                     style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:bold;color:#fff;text-decoration:none;">
                    Accéder à mon espace →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:#555;">Ce lien est personnel et valable 24 heures — usage unique.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;">+216 52 880 311 — contact@demenagement.tn</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
