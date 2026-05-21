import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { Resend } from 'resend'
import { z } from 'zod'
import { DevisPDF } from '@/components/pdf/DevisPDF'
import { env } from '@/lib/env'

const schema = z.object({ dossierId: z.number() })

type DossierFields = {
  numeroDossier?: string
  nomComplet?: string
  clientId?: string
  prixTotalTTC?: number
  devisValiditeJours?: number
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

  const raw = await payload.findByID({
    collection: 'demenagements',
    id: parsed.data.dossierId,
  })

  if (!raw) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = raw as unknown as DossierFields & Record<string, unknown>

  const clientEmail = typeof dossier.clientId === 'string' ? dossier.clientId : ''
  if (!clientEmail || !clientEmail.includes('@')) {
    return Response.json({ error: 'Email client introuvable dans le dossier' }, { status: 422 })
  }

  if (!env.RESEND_API_KEY) {
    return Response.json({ error: 'RESEND_API_KEY non configurée — envoi email désactivé' }, { status: 500 })
  }

  const element   = createElement(DevisPDF, { dossier: raw }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const filename  = `Devis-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

  const resend = new Resend(env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM || 'DT Déménagement <contact@demenagement.tn>',
    to: clientEmail,
    subject: `Votre devis DT Déménagement — ${dossier.numeroDossier ?? ''}`,
    html: buildEmailHtml(dossier),
    attachments: [{ filename, content: Buffer.from(pdfBuffer).toString('base64') }],
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  await payload.update({
    collection: 'demenagements',
    id: parsed.data.dossierId,
    data: { devisStatut: 'envoye' },
  })

  return Response.json({ success: true })
}

function buildEmailHtml(d: DossierFields): string {
  const validite = d.devisValiditeJours ?? 30
  const prix = d.prixTotalTTC != null
    ? `${Number(d.prixTotalTTC).toLocaleString('fr-TN')} DT TTC`
    : 'sur demande'

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#b52027;padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:bold;">DT Déménagement Tunisie</h1>
            <p style="color:#c9a84c;margin:4px 0 0;font-size:12px;letter-spacing:1px;">VOTRE DEVIS EN PIÈCE JOINTE</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#333;font-size:15px;">Bonjour ${d.nomComplet ?? 'cher client'},</p>
            <p style="color:#555;font-size:14px;line-height:1.7;">
              Nous avons le plaisir de vous faire parvenir votre devis <strong>${d.numeroDossier ?? ''}</strong> en pièce jointe.
            </p>
            <div style="background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Montant total TTC</p>
              <p style="margin:0;font-size:24px;font-weight:bold;color:#b52027;">${prix}</p>
            </div>
            <p style="color:#555;font-size:14px;line-height:1.7;">
              Ce devis est valable <strong>${validite} jours</strong> à compter de sa date d'émission.<br/>
              Pour l'accepter ou toute question :
            </p>
            <ul style="color:#555;font-size:14px;line-height:2.2;">
              <li>Téléphone : <strong>+216 52 880 311</strong></li>
              <li>Email : <strong>contact@demenagement.tn</strong></li>
              <li>WhatsApp : <a href="https://wa.me/21652880311" style="color:#b52027;">+216 52 880 311</a></li>
            </ul>
            <p style="color:#555;font-size:14px;margin-top:24px;">
              Merci de votre confiance,<br/>
              <strong>L'équipe DT Déménagement Tunisie</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;padding:14px 32px;text-align:center;">
            <p style="color:#888;font-size:11px;margin:0;">DT Déménagement Tunisie — demenagement.tn<br/>+216 52 880 311 | contact@demenagement.tn</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
