import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { env } from '@/lib/env'
import { sendMail } from '@/lib/mailer'

const schema = z.object({
  dossierId:   z.string().min(1),
  contenu:     z.string().min(1).max(2000),
  clientEmail: z.string().email(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
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

  const { dossierId, contenu, clientEmail } = result.data

  if (clientEmail !== session.user.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const dossierCheck = await payload.find({
    collection: 'demenagements',
    where:      { id: { equals: Number(dossierId) }, clientId: { equals: session.user.email } },
    limit:      1,
    overrideAccess: true,
  })
  if (dossierCheck.totalDocs === 0) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const message = await payload.create({
    collection: 'messages',
    data: {
      demenagement: Number(dossierId),
      auteur:       'client',
      contenu,
      lu:           false,
      clientId:     session.user.email,
    },
    overrideAccess: true,
  })

  // Email de notification admin — non-bloquant
  if (env.EMAIL_DEVIS_TO) {
    const dossier       = dossierCheck.docs[0]
    const numeroDossier = String((dossier as Record<string, unknown>).numeroDossier ?? dossierId)
    const adminUrl      = `${env.NEXT_PUBLIC_SERVER_URL}/admin/collections/demenagements/${dossierId}`
    const contenuSafe   = contenu.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    sendMail({
      to:      env.EMAIL_DEVIS_TO,
      subject: `💬 Nouveau message client — Dossier ${numeroDossier}`,
      html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Nouveau message client</p>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #2a2a2a;">
              <td style="padding:10px 0;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:130px;">Dossier</td>
              <td style="padding:10px 0;color:#c9a84c;font-size:14px;font-weight:bold;">${numeroDossier}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a2a2a;">
              <td style="padding:10px 0;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Client</td>
              <td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${clientEmail}</td>
            </tr>
          </table>
          <p style="margin:20px 0 8px;font-size:12px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <div style="background:#1a1a1a;border-left:3px solid #b52027;border-radius:4px;padding:14px 18px;">
            <p style="margin:0;font-size:14px;color:#f8f5f0;line-height:1.7;white-space:pre-wrap;">${contenuSafe}</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <a href="${adminUrl}" style="display:inline-block;background:#c9a84c;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            📋 Ouvrir dans l'admin →
          </a>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    }).catch((err: unknown) => { console.error('[client/message] Échec notification admin :', err) })
  }

  return NextResponse.json({ message }, { status: 201 })
}
