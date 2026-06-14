import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyEmailToken } from '@/lib/email-token'
import { sendMail } from '@/lib/mailer'

type RdvDoc = {
  id:          string | number
  statut?:     string
  prenom?:     string
  nom?:        string
  email?:      string
  telephone?:  string
  dateVisite?: string
  heure?:      string
}

function page(title: string, body: string, color: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — DT Déménagement</title></head>
<body style="margin:0;padding:40px 16px;background:#0a0a0a;font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:480px;width:100%;background:#111;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;margin:auto;">
    <div style="background:${color};padding:20px 28px;">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:bold;">DT Déménagement Tunisie</p>
    </div>
    <div style="padding:32px 28px;">
      <p style="margin:0 0 24px;font-size:16px;color:#f8f5f0;line-height:1.6;">${body}</p>
      <a href="${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/admin"
         style="display:inline-block;background:${color};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
        Aller dans l'admin →
      </a>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #2a2a2a;">
      <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
    </div>
  </div>
</body></html>`
}

function clientConfirmEmail(prenom: string, dateVisite: string, heure: string): string {
  const dateStr = dateVisite
    ? new Date(dateVisite).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : ''
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#16a34a;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Confirmation de rendez-vous</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
            Bonjour <strong>${prenom}</strong>,<br><br>
            Votre demande de rendez-vous a été <strong style="color:#4ade80;">confirmée</strong> par notre équipe. 🎉
          </p>
          ${dateStr ? `<div style="background:#1a1a1a;border-left:3px solid #4ade80;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;color:#a0a0a0;">Date et heure confirmées</p>
            <p style="margin:0;font-size:16px;font-weight:bold;color:#f8f5f0;">${dateStr}${heure ? ` à ${heure}` : ''}</p>
          </div>` : ''}
          <p style="margin:0;font-size:13px;color:#a0a0a0;line-height:1.6;">
            Notre équipe sera présente à l'heure convenue. En cas d'imprévu, contactez-nous au
            <strong style="color:#f8f5f0;">+216 52 880 311</strong> ou sur WhatsApp.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">+216 52 880 311 — contact@demenagement.tn</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function clientCancelEmail(prenom: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Annulation de rendez-vous</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
            Bonjour <strong>${prenom}</strong>,<br><br>
            Nous sommes au regret de vous informer que votre rendez-vous a dû être <strong style="color:#f87171;">annulé</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#a0a0a0;line-height:1.6;">
            Notre équipe vous contactera prochainement pour convenir d'une nouvelle date.
            N'hésitez pas à nous appeler au <strong style="color:#f8f5f0;">+216 52 880 311</strong>.
          </p>
          <p style="margin:0;font-size:13px;color:#a0a0a0;">Nous nous excusons pour ce désagrément.<br>
          <strong style="color:#f8f5f0;">L'équipe DT Déménagement Tunisie</strong></p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">+216 52 880 311 — contact@demenagement.tn</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl
  const id     = searchParams.get('id')     ?? ''
  const action = searchParams.get('action') ?? ''
  const token  = searchParams.get('token')  ?? ''

  if (!verifyEmailToken(`rdv:${id}:${action}`, token)) {
    return new Response(page('Lien invalide', '❌ Ce lien est invalide ou a expiré.', '#b52027'), {
      status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (!['confirme', 'annule'].includes(action)) {
    return new Response(page('Action invalide', '❌ Action non reconnue.', '#b52027'), {
      status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  let rdv: RdvDoc
  try {
    const payload = await getPayload({ config })
    rdv = await payload.findByID({
      collection:     'rendez-vous',
      id:             Number(id),
      overrideAccess: true,
    }) as unknown as RdvDoc
  } catch {
    return new Response(page('Introuvable', '❌ Ce rendez-vous est introuvable.', '#b52027'), {
      status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (rdv.statut === 'confirme' || rdv.statut === 'annule') {
    return new Response(
      page('Déjà traité', `ℹ️ Ce rendez-vous a déjà été traité (statut : <strong>${rdv.statut}</strong>).`, '#c9a84c'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const payload = await getPayload({ config })
  await payload.update({
    collection:     'rendez-vous',
    id:             Number(id),
    data:           { statut: action },
    overrideAccess: true,
  })

  const prenom      = rdv.prenom     ?? 'Client'
  const clientEmail = rdv.email      ?? ''
  const dateVisite  = rdv.dateVisite ?? ''
  const heure       = rdv.heure      ?? ''

  if (clientEmail) {
    const subject = action === 'confirme'
      ? '✅ Votre rendez-vous est confirmé — DT Déménagement'
      : '❌ Votre rendez-vous a été annulé — DT Déménagement'
    const html = action === 'confirme'
      ? clientConfirmEmail(prenom, dateVisite, heure)
      : clientCancelEmail(prenom)

    sendMail({ to: clientEmail, subject, html }).catch((e) =>
      console.error('[rdv-action] client email failed:', e)
    )
  }

  const actionLabel = action === 'confirme' ? '✅ Rendez-vous confirmé !' : '❌ Rendez-vous annulé.'
  const detail      = clientEmail
    ? `Un email de ${action === 'confirme' ? 'confirmation' : 'notification'} a été envoyé à <strong>${clientEmail}</strong>.`
    : 'Le client n\'a pas fourni d\'email — contactez-le par téléphone.'
  const color = action === 'confirme' ? '#16a34a' : '#b52027'

  return new Response(page(actionLabel, `${actionLabel}<br><br>${detail}`, color), {
    status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
