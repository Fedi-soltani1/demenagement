import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadSafe } from '@/lib/payload-safe'
import { sendMail } from '@/lib/mailer'
import { env } from '@/lib/env'
import { escapeHtml } from '@/lib/escape-html'
import { resolvePartner, payloadPartnerFinder, type PartnerRef } from '@/lib/partner-attribution'
import { rateLimit, clientIp } from '@/lib/ratelimit'

export async function POST(request: Request) {
  // Rate limiting AVANT tout traitement (10 requêtes / minute / IP)
  if (!rateLimit(`lead:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
  }
  try {
    const body = await request.json() as Record<string, unknown>

    const nomPrenom = typeof body.nomPrenom === 'string' ? body.nomPrenom.trim() : ''
    const telephone = typeof body.telephone === 'string' ? body.telephone.trim() : ''
    const email     = typeof body.email     === 'string' ? body.email.trim()     : ''
    const source    = typeof body.source    === 'string' ? body.source            : ''
    const service   = typeof body.service   === 'string' ? body.service           : ''
    const ville     = typeof body.ville     === 'string' ? body.ville             : ''

    if (!nomPrenom || !telephone) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const payload = await getPayloadSafe()

    // Attribution partenaire — même cookie que /api/devis et /api/rdv
    // (dt_partenaire posé par la landing /partenaire/[slug], last-touch 30j).
    // Envoyé automatiquement avec le fetch/sendBeacon same-origin.
    let partenaire: PartnerRef | null = null
    if (payload) {
      const partenaireSlug = (await cookies()).get('dt_partenaire')?.value
      partenaire = await resolvePartner(partenaireSlug, payloadPartnerFinder(payload))

      await payload.create({
        collection: 'leads',
        data: {
          nomPrenom,
          telephone,
          ...(email   ? { email }   : {}),
          ...(source  ? { source }  : {}),
          ...(service ? { service } : {}),
          ...(ville   ? { ville }   : {}),
          ...(partenaire ? { sourcePartenaire: partenaire.id, sourcePartenaireNom: partenaire.nom } : {}),
          statut: 'nouveau',
        },
        overrideAccess: true,
      })
    }

    // Notification admin — un lead = un prospect à RAPPELER (a laissé ses
    // coordonnées sans finaliser devis ni RDV). Non bloquant : un échec SMTP
    // ne doit jamais casser la capture du lead.
    await sendMail({
      to:      env.EMAIL_DEVIS_TO,
      subject: `🔔 Prospect à rappeler — ${nomPrenom}${partenaire ? ` (via ${partenaire.nom})` : ''}`,
      html:    buildLeadEmail({ nomPrenom, telephone, email, source, service, ville, partenaireNom: partenaire?.nom ?? '' }),
    }).catch((err: unknown) => {
      console.error('[leads] Échec notification admin SMTP :', err)
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[leads] Échec enregistrement lead :', err)
    // Ne jamais bloquer l'UX — on répond 200 même en cas d'erreur
    return NextResponse.json({ ok: true })
  }
}

interface LeadEmailData {
  nomPrenom:     string
  telephone:     string
  email:         string
  source:        string
  service:       string
  ville:         string
  partenaireNom: string
}

function buildLeadEmail(d: LeadEmailData): string {
  const base    = (env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const telDigits = d.telephone.replace(/\D/g, '')
  const waLink  = `https://wa.me/${telDigits}`
  const adminUrl = `${base}/admin/collections/leads`

  // Valeurs fournies par l'utilisateur → échappées avant injection dans l'email.
  const nom   = escapeHtml(d.nomPrenom)
  const tel   = escapeHtml(d.telephone)
  const email = escapeHtml(d.email)
  const svc   = escapeHtml(d.service)
  const ville = escapeHtml(d.ville)
  const src   = escapeHtml(d.source)
  const origine = d.partenaireNom
    ? `🤝 Partenaire : <strong>${escapeHtml(d.partenaireNom)}</strong>`
    : '🌐 Site direct'

  const row = (label: string, value: string) =>
    `<tr style="border-bottom:1px solid #2a2a2a;">
       <td style="padding:10px 0;color:#a0a0a0;font-size:12px;width:130px;">${label}</td>
       <td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${value}</td>
     </tr>`

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:580px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement — Prospect à rappeler</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">A laissé ses coordonnées sans finaliser de devis ni de RDV</p>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            ${row('NOM', `<strong>${nom}</strong>`)}
            ${row('ORIGINE', origine)}
            ${row('TÉLÉPHONE', `<a href="tel:${telDigits}" style="color:#c9a84c;text-decoration:none;">${tel}</a>`)}
            ${row('WHATSAPP', `<a href="${waLink}" style="color:#c9a84c;text-decoration:none;">${tel}</a>`)}
            ${d.email   ? row('EMAIL', email) : ''}
            ${d.service ? row('SERVICE', svc) : ''}
            ${d.ville   ? row('VILLE', ville) : ''}
            ${d.source  ? row('PAGE SOURCE', src) : ''}
          </table>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <a href="${adminUrl}" style="display:inline-block;background:#c9a84c;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            📋 Ouvrir les leads dans l'admin →
          </a>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}
