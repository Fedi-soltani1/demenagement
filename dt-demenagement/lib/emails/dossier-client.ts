// Email de confirmation envoyé au client à la création d'un dossier déménagement :
// confirmation + lien magique (magic link) vers son espace client.
// Source unique réutilisée par : le site (/api/devis), la création manuelle en admin
// et la conversion RDV → dossier (hook afterChange de la collection demenagements).

import { generateMagicLink } from '@/lib/generate-magic-link'
import { sendMail } from '@/lib/mailer'
import { env } from '@/lib/env'
import { escapeHtml } from '@/lib/escape-html'

export function buildClientEmail(prenom: string, numeroDossier: string, magicLink: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr>
          <td style="background:#b52027;padding:20px 28px;">
            <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Demande de devis reçue</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Bonjour <strong>${escapeHtml(prenom)}</strong>,<br><br>
              Votre demande de devis a bien été reçue. Notre équipe vous contactera dans les <strong style="color:#c9a84c;">24 heures</strong>.
            </p>
            <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">Numéro de dossier</p>
              <p style="margin:0;font-family:monospace;font-size:22px;color:#c9a84c;font-weight:bold;">${numeroDossier}</p>
            </div>
            <p style="margin:0 0 16px;font-size:14px;color:#a0a0a0;line-height:1.6;">
              Suivez l'avancement de votre dossier depuis votre espace client :
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="background:#b52027;border-radius:8px;">
                  <a href="${magicLink}"
                     style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:bold;color:#fff;text-decoration:none;">
                    Accéder à mon espace client →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:#555;">Ce lien est personnel et valable 24 heures.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;">+216 52 880 311 — contact@demenagement.tn — © ${new Date().getFullYear()} DT Déménagement Tunisie</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// Génère le magic link (avec repli sur /connexion si échec) et envoie l'email au client.
export async function sendDossierClientEmail(input: {
  email: string
  prenom: string
  numeroDossier: string
}): Promise<void> {
  const { email, prenom, numeroDossier } = input
  const magicLink = await generateMagicLink(email, `/espace-client/${numeroDossier}`).catch(() => {
    const base = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
    return `${base}/connexion?callbackUrl=${encodeURIComponent(`/espace-client/${numeroDossier}`)}`
  })
  await sendMail({
    to:      email,
    subject: `Votre demande de devis DT Déménagement — ${numeroDossier}`,
    html:    buildClientEmail(prenom, numeroDossier, magicLink),
  })
}
