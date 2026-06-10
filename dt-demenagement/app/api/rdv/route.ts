import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendMail } from '@/lib/mailer'
import { env } from '@/lib/env'

const TEL_RE = /^\+?[0-9\s\-()\s]{8,20}$/

const rdvSchema = z.object({
  website:    z.string().max(0, 'Bot').optional(),
  type:       z.enum(['client', 'entreprise', 'administration']),
  nom:        z.string().min(2).max(100),
  prenom:     z.string().min(2).max(100),
  telephone:  z.string().regex(TEL_RE),
  whatsapp:   z.string().regex(TEL_RE),
  email:      z.string().optional(),
  adresse:    z.string().max(300).optional(),
  dateVisite: z.string().optional(),
  heure:      z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  if ((body as Record<string, unknown>).website) {
    return NextResponse.json({ error: 'Bot détecté' }, { status: 400 })
  }

  const result = rdvSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const d = result.data
  const payload = await getPayload({ config })

  const rdv = await payload.create({
    collection: 'rendez-vous',
    data: {
      statut:     'nouveau',
      type:       d.type,
      nom:        d.nom,
      prenom:     d.prenom,
      telephone:  d.telephone,
      whatsapp:   d.whatsapp,
      email:      d.email ?? '',
      adresse:    d.adresse ?? '',
      dateVisite: d.dateVisite ?? '',
      heure:      d.heure ?? '',
    },
    overrideAccess: true,
  })

  // Emails non-bloquants
  const emailPromises: Promise<void>[] = []

  // 1. Notification admin
  emailPromises.push(
    sendMail({
      to:      env.EMAIL_DEVIS_TO,
      subject: `📅 Nouvelle demande de visite — ${d.prenom} ${d.nom}`,
      html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <div style="background:#0f0f0f;padding:16px 24px;border-radius:8px 8px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:16px;">DT Déménagement — Nouvelle demande de visite</h2>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#f9f9f9;border:1px solid #e0e0e0;border-top:none;">
    <tr><td style="padding:10px 16px;font-weight:bold;width:140px;">Type</td><td style="padding:10px 16px;">${d.type}</td></tr>
    <tr style="background:#fff;"><td style="padding:10px 16px;font-weight:bold;">Nom</td><td style="padding:10px 16px;">${d.prenom} ${d.nom}</td></tr>
    <tr><td style="padding:10px 16px;font-weight:bold;">Téléphone</td><td style="padding:10px 16px;">${d.telephone}</td></tr>
    <tr style="background:#fff;"><td style="padding:10px 16px;font-weight:bold;">WhatsApp</td><td style="padding:10px 16px;">${d.whatsapp}</td></tr>
    ${d.email ? `<tr><td style="padding:10px 16px;font-weight:bold;">Email</td><td style="padding:10px 16px;">${d.email}</td></tr>` : ''}
    ${d.adresse ? `<tr style="background:#fff;"><td style="padding:10px 16px;font-weight:bold;">Adresse</td><td style="padding:10px 16px;">${d.adresse}</td></tr>` : ''}
    ${d.dateVisite ? `<tr><td style="padding:10px 16px;font-weight:bold;">Date souhaitée</td><td style="padding:10px 16px;">${d.dateVisite}${d.heure ? ` à ${d.heure}` : ''}</td></tr>` : ''}
  </table>
</body></html>`,
    }).catch((err: unknown) => { console.error('[rdv] Échec notification admin SMTP :', err) })
  )

  // 2. Confirmation client (si email fourni)
  if (d.email) {
    emailPromises.push(
      sendMail({
        to:      d.email,
        subject: 'Demande de visite reçue — DT Déménagement Tunisie',
        html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr>
          <td style="background:#b52027;padding:20px 28px;">
            <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Bonjour <strong>${d.prenom}</strong>,<br><br>
              Votre demande de visite a bien été reçue. Notre équipe vous contactera dans les plus brefs délais au
              <strong style="color:#c9a84c;">${d.telephone}</strong> pour confirmer le rendez-vous.
            </p>
            ${d.dateVisite ? `<div style="background:#1a1a1a;border-left:3px solid #c9a84c;border-radius:4px;padding:14px 18px;margin-bottom:16px;">
              <p style="margin:0;font-size:13px;color:#a0a0a0;">Date souhaitée</p>
              <p style="margin:4px 0 0;font-size:15px;color:#f8f5f0;font-weight:bold;">${d.dateVisite}${d.heure ? ` à ${d.heure}` : ''}</p>
            </div>` : ''}
            <p style="margin:0;font-size:13px;color:#a0a0a0;">Merci de votre confiance,<br><strong style="color:#f8f5f0;">L'équipe DT Déménagement Tunisie</strong></p>
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
</body></html>`,
      }).catch((err: unknown) => { console.error('[rdv] Échec confirmation client SMTP :', err) })
    )
  }

  await Promise.allSettled(emailPromises)

  return NextResponse.json({ success: true, id: rdv.id }, { status: 201 })
}
