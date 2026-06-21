import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { sendMail } from '@/lib/mailer'
import { COMPANY } from '@/lib/constants'

const schema = z.object({ dossierId: z.union([z.string(), z.number()]) })

type DemDoc = {
  nomComplet?:    string
  clientId?:      string
  numeroDossier?: string
}

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Données invalides' }, { status: 422 })
  }

  const doc = await payload
    .findByID({ collection: 'demenagements', id: parsed.data.dossierId, overrideAccess: true })
    .catch(() => null) as DemDoc | null

  if (!doc) return Response.json({ error: 'Dossier introuvable' }, { status: 404 })

  const email = (typeof doc.clientId === 'string' ? doc.clientId : '').trim()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Aucun email client dans ce dossier' }, { status: 422 })
  }

  const nom    = (doc.nomComplet ?? '').trim() || 'cher client'
  const dossNo = doc.numeroDossier ?? String(parsed.data.dossierId)

  try {
    await sendMail({
      to:      email,
      subject: `Votre dossier de déménagement — DT Déménagement Tunisie`,
      html:    buildHtml(nom, dossNo),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur envoi email'
    return Response.json({ error: msg }, { status: 500 })
  }

  return Response.json({ success: true })
}

function buildHtml(nom: string, dossNo: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:100%;">
        <tr><td style="background:#c9a84c;height:4px;"></td></tr>
        <tr>
          <td style="background:#0f0f0f;padding:24px 32px;">
            <p style="margin:0;font-size:10px;color:#c9a84c;letter-spacing:2px;text-transform:uppercase;">Société de déménagement professionnel</p>
            <h1 style="color:#fff;margin:4px 0 0;font-size:20px;font-weight:bold;">DT Déménagement Tunisie</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="color:#333;font-size:15px;margin:0 0 14px;">Bonjour ${nom},</p>
            <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 20px;">
              Votre dossier de déménagement <strong>#${dossNo}</strong> a bien été créé chez
              DT Déménagement Tunisie. Nous étudions votre demande et reviendrons vers vous prochainement.
            </p>

            <!-- Demande de photos -->
            <div style="background:#fafafa;border:1px solid #e8e8e8;border-left:4px solid #b52027;border-radius:6px;padding:18px 20px;margin-bottom:24px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#1a1a1a;">
                📸 Aidez-nous à préparer votre devis
              </p>
              <p style="margin:0 0 10px;font-size:13px;color:#555;line-height:1.7;">
                Pour établir un devis précis, merci de nous envoyer quelques photos de :
              </p>
              <ul style="margin:0;padding:0 0 0 18px;color:#555;font-size:13px;line-height:2.0;">
                <li>📦 L'accès au départ — escalier, couloir, parking</li>
                <li>🏠 L'accès à l'arrivée — escalier, couloir, parking</li>
                <li>🛋️ Vos meubles et objets à déménager</li>
              </ul>
              <p style="margin:12px 0 0;font-size:13px;color:#555;">
                Vous pouvez nous les envoyer directement par email en réponse à ce message ou via WhatsApp au
                <strong><a href="https://wa.me/${COMPANY.phone1.replace(/\D/g, '')}" style="color:#128c7e;text-decoration:none;">${COMPANY.phone1}</a></strong>.
              </p>
            </div>

            <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 8px;">Pour toute question :</p>
            <ul style="color:#555;font-size:14px;line-height:2.1;margin:0 0 24px;">
              <li>Téléphone : <strong>${COMPANY.phone1}</strong></li>
              <li>WhatsApp : <a href="https://wa.me/${COMPANY.phone1.replace(/\D/g, '')}" style="color:#b52027;">${COMPANY.phone1}</a></li>
            </ul>

            <p style="color:#555;font-size:14px;margin:0;">
              Merci de votre confiance,<br/>
              <strong>L'équipe DT Déménagement Tunisie</strong>
            </p>
          </td>
        </tr>
        <tr><td style="background:#c9a84c;height:3px;"></td></tr>
        <tr>
          <td style="background:#0f0f0f;padding:14px 32px;text-align:center;">
            <p style="color:#555;font-size:11px;margin:0;">DT Déménagement Tunisie — ${COMPANY.phone1}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
