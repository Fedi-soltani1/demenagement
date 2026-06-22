import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { z } from 'zod'
import { DevisPDF } from '@/components/pdf/DevisPDF'
import { sendMail } from '@/lib/mailer'
import { generateMagicLink } from '@/lib/generate-magic-link'

const ligneSchema = z.object({
  designation:  z.string().nullish(),
  quantite:     z.number().nullish(),
  prixUnitaire: z.number().nullish(),
}).passthrough()

const overridesSchema = z.object({
  prixTotalTTC:       z.number().nullish(),
  devisValiditeJours: z.number().nullish(),
  devisNotes:         z.string().nullish(),
  lignesDevis:        z.array(ligneSchema).optional(),
})

const schema = z.object({
  dossierId: z.number(),
  overrides: overridesSchema.optional(),
})

type DossierFields = {
  numeroDossier?:      string
  nomComplet?:         string
  clientId?:           string
  prixTotalTTC?:       number
  devisValiditeJours?: number
  devisNotes?:         string
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

  // Merge live overrides from the admin form
  const dossier = {
    ...raw,
    ...Object.fromEntries(
      Object.entries(parsed.data.overrides ?? {}).filter(([, v]) => v !== undefined && v !== null)
    ),
  } as unknown as DossierFields & Record<string, unknown>

  const clientEmail = typeof dossier.clientId === 'string' ? dossier.clientId : ''
  if (!clientEmail || !clientEmail.includes('@')) {
    return Response.json({ error: 'Email client introuvable dans le dossier' }, { status: 422 })
  }

  const element   = createElement(DevisPDF, { dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const filename  = `Devis-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

  // Generate a magic link so the client can access their espace client in one click
  let magicLink: string
  try {
    magicLink = await generateMagicLink(
      clientEmail,
      `/espace-client/${dossier.numeroDossier ?? ''}`,
    )
  } catch {
    // Graceful fallback — still send the email with a standard connexion link
    const base = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') ?? ''
    magicLink = `${base}/connexion?callbackUrl=${encodeURIComponent(`/espace-client/${dossier.numeroDossier ?? ''}`)}`
  }

  try {
    await sendMail({
      to:      clientEmail,
      subject: `Votre devis DT Déménagement — ${dossier.numeroDossier ?? ''}`,
      html:    buildEmailHtml(dossier, magicLink),
      attachments: [{ filename, content: Buffer.from(pdfBuffer) }],
    })
  } catch (mailErr) {
    const msg = mailErr instanceof Error ? mailErr.message : 'Erreur envoi email'
    return Response.json({ error: msg }, { status: 500 })
  }

  await payload.update({
    collection: 'demenagements',
    id: parsed.data.dossierId,
    data: {
      devisStatut:   'envoye',
      devisEnvoyeLe: new Date().toISOString(),
    },
  })

  // Auto-post a system message in the dossier chat to trace the event
  const prixStr = dossier.prixTotalTTC != null
    ? `${Math.round(dossier.prixTotalTTC).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC`
    : 'montant à confirmer'
  const validiteStr = `${dossier.devisValiditeJours ?? 30} jours`
  await payload.create({
    collection: 'messages',
    data: {
      demenagement: parsed.data.dossierId,
      auteur: 'admin',
      clientId: clientEmail,
      contenu: `📤 Devis ${dossier.numeroDossier ?? ''} envoyé par email à ${clientEmail}.\nMontant : ${prixStr} — Validité : ${validiteStr}`,
      lu: true,
    },
    overrideAccess: true,
  }).catch(() => { /* non-blocking — email already sent */ })

  return Response.json({ success: true })
}

function buildEmailHtml(d: DossierFields, magicLink: string): string {
  const validite = d.devisValiditeJours ?? 30
  const prix = d.prixTotalTTC != null
    ? `${Math.round(d.prixTotalTTC).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC`
    : 'sur demande'

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#c9a84c;height:4px;"></td></tr>
        <tr>
          <td style="background:#0f0f0f;padding:24px 32px;">
            <table width="100%"><tr>
              <td>
                <p style="margin:0;font-size:10px;color:#c9a84c;letter-spacing:2px;">SOCIÉTÉ DE DÉMÉNAGEMENT PROFESSIONNEL</p>
                <h1 style="color:#fff;margin:4px 0 0;font-size:20px;font-weight:bold;">DT Déménagement Tunisie</h1>
              </td>
              <td align="right">
                <div style="background:#b52027;border-radius:6px;padding:10px 16px;display:inline-block;">
                  <p style="margin:0;font-size:20px;font-weight:bold;color:#fff;letter-spacing:3px;">DEVIS</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#c9a84c;font-weight:bold;">${d.numeroDossier ?? ''}</p>
                </div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="color:#333;font-size:15px;margin:0 0 10px;">Bonjour ${d.nomComplet ?? 'cher client'},</p>
            <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Nous avons le plaisir de vous faire parvenir votre devis en pièce jointe.<br/>
              Vous pouvez le consulter, l'accepter ou le refuser directement depuis votre espace client.
            </p>
            <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-left:4px solid #b52027;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">Montant total TTC</p>
              <p style="margin:0;font-size:28px;font-weight:bold;color:#b52027;">${prix}</p>
              <p style="margin:6px 0 0;font-size:12px;color:#888;">Validité : ${validite} jours</p>
            </div>
            <!-- CTA bouton espace client -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td align="center" style="background:#b52027;border-radius:8px;">
                  <a href="${magicLink}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                    Consulter et répondre au devis →
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:#888;font-size:12px;margin:0 0 4px;">Ce lien est personnel et valable 24 heures.</p>
            <p style="color:#aaa;font-size:11px;word-break:break-all;margin:0 0 24px;">${magicLink}</p>
            <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 8px;">
              Pour toute question, contactez-nous :
            </p>
            <ul style="color:#555;font-size:14px;line-height:2.2;margin:0 0 24px;">
              <li>Téléphone : <strong>+216 52 880 112</strong></li>
              <li>Email : <strong>contact@demenagement.tn</strong></li>
              <li>WhatsApp : <a href="https://wa.me/21652880112" style="color:#b52027;">+216 52 880 112</a></li>
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
            <p style="color:#555;font-size:11px;margin:0;">DT Déménagement Tunisie — demenagement.tn<br/>+216 52 880 112 | contact@demenagement.tn</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
