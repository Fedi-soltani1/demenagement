import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { z } from 'zod'
import { FacturePDF, type FactureDossier } from '@/components/pdf/FacturePDF'
import { sendMail } from '@/lib/mailer'
import { generateMagicLink } from '@/lib/generate-magic-link'

const ligneSchema = z.object({
  designation:  z.string().nullish(),
  quantite:     z.number().nullish(),
  prixUnitaire: z.number().nullish(),
}).passthrough()

const overridesSchema = z.object({
  facturePrixTTC:    z.number().nullish(),
  factureEcheanceLe: z.string().nullish(),
  factureNotes:      z.string().nullish(),
  lignesFacture:     z.array(ligneSchema).optional(),
})

const schema = z.object({
  dossierId: z.number(),
  overrides: overridesSchema.optional(),
})

function fmtPrix(n?: number): string {
  return n != null
    ? `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC`
    : 'sur demande'
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return iso }
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

  const raw = await payload.findByID({ collection: 'demenagements', id: parsed.data.dossierId })
  if (!raw) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const settings = await payload.findGlobal({ slug: 'settings', overrideAccess: true }) as Record<string, unknown>
  const matriculeFiscal = typeof settings.matriculeFiscal === 'string' ? settings.matriculeFiscal : ''

  const dossier: FactureDossier = {
    ...(raw as unknown as FactureDossier),
    ...Object.fromEntries(
      Object.entries(parsed.data.overrides ?? {}).filter(([, v]) => v !== undefined && v !== null)
    ),
    matriculeFiscal,
  }

  const clientEmail = typeof dossier.clientId === 'string' ? dossier.clientId : ''
  if (!clientEmail || !clientEmail.includes('@')) {
    return Response.json({ error: 'Email client introuvable dans le dossier' }, { status: 422 })
  }

  const element   = createElement(FacturePDF, { dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const factureRef = `F-${dossier.numeroDossier ?? parsed.data.dossierId}`
  const filename   = `Facture-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

  let magicLink: string
  try {
    magicLink = await generateMagicLink(
      clientEmail,
      `/espace-client/${dossier.numeroDossier ?? ''}`,
    )
  } catch {
    const base = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') ?? ''
    magicLink = `${base}/connexion?callbackUrl=${encodeURIComponent(`/espace-client/${dossier.numeroDossier ?? ''}`)}`
  }

  try {
    await sendMail({
      to:      clientEmail,
      subject: `Votre facture DT Déménagement — ${factureRef}`,
      html:    buildEmailHtml(dossier, factureRef, magicLink),
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
      factureStatut:  'emise',
      factureEmiseLe: new Date().toISOString(),
    },
  })

  const prixStr    = fmtPrix(dossier.facturePrixTTC)
  const echeanceStr = dossier.factureEcheanceLe ? ` — Échéance : ${fmtDate(dossier.factureEcheanceLe)}` : ''
  await payload.create({
    collection: 'messages',
    data: {
      demenagement: parsed.data.dossierId,
      auteur:  'admin',
      clientId: clientEmail,
      contenu: `📄 Facture ${factureRef} envoyée par email à ${clientEmail}.\nMontant : ${prixStr}${echeanceStr}`,
      lu: true,
    },
    overrideAccess: true,
  }).catch(() => { /* non-blocking */ })

  return Response.json({ success: true })
}

function buildEmailHtml(d: FactureDossier, factureRef: string, magicLink: string): string {
  const prix = d.facturePrixTTC != null
    ? `${Math.round(d.facturePrixTTC).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC`
    : 'sur demande'

  const echeanceHtml = d.factureEcheanceLe
    ? `<p style="margin:6px 0 0;font-size:12px;color:#888;">Échéance : ${new Date(d.factureEcheanceLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>`
    : ''

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
                <div style="background:#c9a84c;border-radius:6px;padding:10px 16px;display:inline-block;">
                  <p style="margin:0;font-size:20px;font-weight:bold;color:#1a1000;letter-spacing:3px;">FACTURE</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#1a1000;font-weight:bold;">${factureRef}</p>
                </div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="color:#333;font-size:15px;margin:0 0 10px;">Bonjour ${d.nomComplet ?? 'cher client'},</p>
            <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Veuillez trouver ci-joint votre facture en pièce jointe.<br/>
              Vous pouvez la consulter et suivre l'état de votre dossier depuis votre espace client.
            </p>
            <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-left:4px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">Montant total TTC</p>
              <p style="margin:0;font-size:28px;font-weight:bold;color:#c9a84c;">${prix}</p>
              ${echeanceHtml}
            </div>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td align="center" style="background:#c9a84c;border-radius:8px;">
                  <a href="${magicLink}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#1a1000;text-decoration:none;letter-spacing:0.3px;">
                    Télécharger ma facture →
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
              <li>Téléphone : <strong>+216 52 880 311</strong></li>
              <li>Email : <strong>contact@demenagement.tn</strong></li>
              <li>WhatsApp : <a href="https://wa.me/21652880311" style="color:#c9a84c;">+216 52 880 311</a></li>
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
            <p style="color:#555;font-size:11px;margin:0;">DT Déménagement Tunisie — demenagement.tn<br/>+216 52 880 311 | contact@demenagement.tn</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
