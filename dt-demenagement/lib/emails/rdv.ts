// Templates email partagés pour les rendez-vous de visite.
// Extraits de app/api/admin/rdv-action/route.ts pour être réutilisés par
// le bouton « Confirmer + envoyer email » de la fiche RDV (RDVActions).

import { COMPANY } from '@/lib/constants'

/** Email de confirmation de rendez-vous envoyé au client. */
export function clientConfirmEmail(prenom: string, dateVisite: string, heure: string): string {
  const dateStr = dateVisite
    ? new Date(dateVisite).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
            <strong style="color:#f8f5f0;">${COMPANY.phone1}</strong> ou sur WhatsApp.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">${COMPANY.phone1} — ${COMPANY.email}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

/** Email d'annulation de rendez-vous envoyé au client. */
export function clientCancelEmail(prenom: string): string {
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
            N'hésitez pas à nous appeler au <strong style="color:#f8f5f0;">${COMPANY.phone1}</strong>.
          </p>
          <p style="margin:0;font-size:13px;color:#a0a0a0;">Nous nous excusons pour ce désagrément.<br>
          <strong style="color:#f8f5f0;">L'équipe DT Déménagement Tunisie</strong></p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">${COMPANY.phone1} — ${COMPANY.email}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}
