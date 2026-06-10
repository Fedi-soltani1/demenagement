import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendMail } from '@/lib/mailer'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { env } from '@/lib/env'

const schema = z.object({
  dossierId: z.number(),
  contenu:   z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { dossierId, contenu } = result.data

  const message = await payload.create({
    collection: 'messages',
    data: {
      demenagement: dossierId,
      auteur:       'admin',
      contenu,
      lu:           true,
    },
    overrideAccess: true,
  })

  // Marquer tous les messages client non lus de ce dossier comme lus
  const unread = await payload.find({
    collection: 'messages',
    where: {
      and: [
        { demenagement: { equals: dossierId } },
        { auteur:        { equals: 'client' } },
        { lu:            { equals: false } },
      ],
    },
    limit: 100,
    overrideAccess: true,
  })

  await Promise.all(
    unread.docs.map((msg) =>
      payload.update({
        collection: 'messages',
        id:         msg.id,
        data:       { lu: true },
        overrideAccess: true,
      })
    )
  )

  // Notifier le client par email (non-bloquant)
  const dossier = await payload.findByID({
    collection: 'demenagements',
    id: dossierId,
    overrideAccess: true,
  }).catch(() => null)

  const clientEmail = typeof (dossier as Record<string, unknown> | null)?.clientId === 'string'
    ? (dossier as Record<string, unknown>).clientId as string
    : null
  const numeroDossier = typeof (dossier as Record<string, unknown> | null)?.numeroDossier === 'string'
    ? (dossier as Record<string, unknown>).numeroDossier as string
    : String(dossierId)

  if (clientEmail) {
    generateMagicLink(clientEmail, `/espace-client/${numeroDossier}`)
      .then((magicLink) =>
        sendMail({
          to:      clientEmail,
          subject: `💬 Nouveau message de DT Déménagement — Dossier ${numeroDossier}`,
          html: `<!DOCTYPE html>
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
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Nouveau message concernant votre dossier</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Vous avez reçu un nouveau message de notre équipe concernant votre dossier
              <strong style="color:#c9a84c;">${numeroDossier}</strong>.
            </p>
            <div style="background:#1a1a1a;border-left:3px solid #b52027;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#f8f5f0;white-space:pre-wrap;">${contenu.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="background:#b52027;border-radius:8px;">
                  <a href="${magicLink}"
                     style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:bold;color:#fff;text-decoration:none;">
                    Accéder à mon espace et répondre →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:#555;">Ce lien est personnel et valable 24 heures.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie — contact@demenagement.tn</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        })
      )
      .catch((err: unknown) => { console.error(`[admin/message] Échec notification client SMTP (dossier ${numeroDossier}) :`, err) })
  }

  // Lien admin vers le dossier pour référence
  void env

  return NextResponse.json({ message }, { status: 201 })
}
