import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendMail } from '@/lib/mailer'
import { env } from '@/lib/env'
import { resolvePartner, payloadPartnerFinder } from '@/lib/partner-attribution'
import { signEmailToken } from '@/lib/email-token'
import { markLeadConverted } from '@/lib/leads'
import { upsertClient } from '@/lib/upsert-client'
import { escapeHtml } from '@/lib/escape-html'
import { rateLimit, clientIp } from '@/lib/ratelimit'

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
  // Rate limiting AVANT tout traitement (5 requêtes / minute / IP)
  if (!rateLimit(`rdv:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
  }

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

  // Attribution partenaire (cookie dt_partenaire posé par la landing /partenaire/[slug])
  const partenaireSlug = (await cookies()).get('dt_partenaire')?.value
  const partenaire = await resolvePartner(partenaireSlug, payloadPartnerFinder(payload))

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
      sourcePartenaire:    partenaire ? partenaire.id : undefined,
      sourcePartenaireNom: partenaire ? partenaire.nom : undefined,
    },
    overrideAccess: true,
  })

  // Le prospect a TERMINÉ le process → son lead initial n'est plus un abandon.
  // On le marque « rdv_planifie » pour qu'il quitte la liste des leads.
  await markLeadConverted(payload, d.telephone, 'rdv_planifie')

  // Rattachement automatique d'une fiche client (par email ou téléphone) — non bloquant.
  await upsertClient(payload, { email: d.email, telephone: d.telephone, prenom: d.prenom, nom: d.nom })
    .catch((e: unknown) => { console.error('[rdv] upsert client échoué :', e) })

  // Emails non-bloquants
  const emailPromises: Promise<void>[] = []

  // 1. Notification admin avec boutons Confirmer / Annuler
  const base         = (env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const rdvIdStr     = String(rdv.id)
  const tokenConfirm = signEmailToken(`rdv:${rdvIdStr}:confirme`)
  const tokenAnnule  = signEmailToken(`rdv:${rdvIdStr}:annule`)
  const urlConfirm   = `${base}/api/admin/rdv-action?id=${rdvIdStr}&action=confirme&token=${tokenConfirm}`
  const urlAnnule    = `${base}/api/admin/rdv-action?id=${rdvIdStr}&action=annule&token=${tokenAnnule}`
  const adminUrl     = `${base}/admin/collections/rendez-vous/${rdvIdStr}`

  emailPromises.push(
    sendMail({
      to:      env.EMAIL_DEVIS_TO,
      subject: `📅 Nouvelle demande de visite — ${d.prenom} ${d.nom}${partenaire ? ` (via ${partenaire.nom})` : ''}`,
      html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:580px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement — Nouvelle demande de visite</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Action requise</p>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;width:130px;">TYPE</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${escapeHtml(d.type)}</td></tr>
            <tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">NOM</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;font-weight:bold;">${escapeHtml(d.prenom)} ${escapeHtml(d.nom)}</td></tr>
            <tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">TÉLÉPHONE</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;"><a href="tel:${d.telephone.replace(/[^0-9+]/g, '')}" style="color:#c9a84c;text-decoration:none;">${escapeHtml(d.telephone)}</a></td></tr>
            <tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">WHATSAPP</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;"><a href="https://wa.me/${d.whatsapp.replace(/\D/g, '')}" style="color:#c9a84c;text-decoration:none;">${escapeHtml(d.whatsapp)}</a></td></tr>
            ${d.email ? `<tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">EMAIL</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${escapeHtml(d.email)}</td></tr>` : ''}
            ${d.adresse ? `<tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">ADRESSE</td><td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${escapeHtml(d.adresse)}</td></tr>` : ''}
            ${d.dateVisite ? `<tr><td style="padding:10px 0;color:#a0a0a0;font-size:12px;">DATE SOUHAITÉE</td><td style="padding:10px 0;color:#c9a84c;font-size:14px;font-weight:bold;">${escapeHtml(d.dateVisite)}${d.heure ? ` à ${escapeHtml(d.heure)}` : ''}</td></tr>` : ''}
          </table>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <p style="margin:0 0 16px;font-size:13px;color:#a0a0a0;">Répondre directement depuis cet email :</p>
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;">
              <a href="${urlConfirm}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
                ✅ Confirmer le RDV
              </a>
            </td>
            <td>
              <a href="${urlAnnule}" style="display:inline-block;background:#b52027;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
                ❌ Annuler le RDV
              </a>
            </td>
          </tr></table>
          <p style="margin:16px 0 0;font-size:11px;color:#555;">
            Ou <a href="${adminUrl}" style="color:#c9a84c;text-decoration:none;">ouvrir dans l'admin →</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
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
              Bonjour <strong>${escapeHtml(d.prenom)}</strong>,<br><br>
              Votre demande de visite a bien été reçue. Notre équipe vous contactera dans les plus brefs délais au
              <strong style="color:#c9a84c;">${escapeHtml(d.telephone)}</strong> pour confirmer le rendez-vous.
            </p>
            ${d.dateVisite ? `<div style="background:#1a1a1a;border-left:3px solid #c9a84c;border-radius:4px;padding:14px 18px;margin-bottom:16px;">
              <p style="margin:0;font-size:13px;color:#a0a0a0;">Date souhaitée</p>
              <p style="margin:4px 0 0;font-size:15px;color:#f8f5f0;font-weight:bold;">${escapeHtml(d.dateVisite)}${d.heure ? ` à ${escapeHtml(d.heure)}` : ''}</p>
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
