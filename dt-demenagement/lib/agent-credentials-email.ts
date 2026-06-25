// Compose l'email d'identifiants envoyé à un agent immobilier à la création de son compte.
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildAgentCredentialsEmail(input: {
  prenom: string
  email: string
  tempPassword: string
  appUrl: string
}): { subject: string; html: string } {
  const subject = 'Votre accès agent — DT Déménagement Tunisie'
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Espace agent immobilier</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
            Bonjour ${escapeHtml(input.prenom)},<br><br>
            Votre compte agent a été créé. Voici vos identifiants pour accéder à l'application :
          </p>
          <div style="background:#1a1a1a;border-left:3px solid #c9a84c;border-radius:4px;padding:14px 18px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:13px;color:#a0a0a0;">Identifiant (email)</p>
            <p style="margin:0 0 12px;font-size:15px;color:#f8f5f0;">${escapeHtml(input.email)}</p>
            <p style="margin:0 0 6px;font-size:13px;color:#a0a0a0;">Mot de passe temporaire</p>
            <p style="margin:0;font-size:15px;color:#f8f5f0;font-family:monospace;">${escapeHtml(input.tempPassword)}</p>
          </div>
          <a href="${input.appUrl}" style="display:inline-block;background:#b52027;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;">Ouvrir l'application</a>
          <p style="margin:18px 0 0;font-size:12px;color:#a0a0a0;line-height:1.6;">
            Pour des raisons de sécurité, il vous sera demandé de changer ce mot de passe à votre première connexion.
            Sur mobile, ajoutez l'application à votre écran d'accueil pour l'utiliser comme une app.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
  return { subject, html }
}
