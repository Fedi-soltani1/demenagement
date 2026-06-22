import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/auth'
import { env } from '@/lib/env'
import { sendMail } from '@/lib/mailer'

type DevisDoc = {
  id:                      string | number
  numeroDossier:           string
  nomComplet?:             string
  devisStatut?:            string
  devisEnvoyeLe?:          string
  devisReponduLe?:         string
  devisCommentaireClient?: string
}

function escapeHtml(str: string | undefined): string {
  if (!str) return '—'
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const schema = z.object({
  numeroDossier:    z.string().min(1),
  action:           z.enum(['accepte', 'refuse']),
  commentaire:      z.string().max(1000).optional(),
  confirmSignature: z.boolean(),
})

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Vérification session
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // 2. Parsing et validation du body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { numeroDossier, action, commentaire, confirmSignature } = result.data

  // 3. Signature obligatoire pour accepter
  if (action === 'accepte' && !confirmSignature) {
    return NextResponse.json(
      { error: 'Vous devez confirmer la signature pour accepter.' },
      { status: 422 },
    )
  }

  // 4. Récupération du dossier
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'demenagements',
    where: {
      numeroDossier: { equals: numeroDossier },
      clientId:      { equals: session.user.email },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (found.totalDocs === 0) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = found.docs[0] as unknown as DevisDoc

  // 5. Vérification que le devis est bien en statut "envoye"
  if (dossier.devisStatut !== 'envoye') {
    return NextResponse.json(
      { error: "Ce devis a déjà reçu une réponse ou n'a pas encore été envoyé." },
      { status: 409 },
    )
  }

  // 6. Horodatage
  const now = new Date().toISOString()

  // 7. Mise à jour du dossier
  const updateData: Record<string, unknown> = {
    devisStatut:            action,
    devisReponduLe:         now,
    devisCommentaireClient: commentaire ?? null,
  }
  if (action === 'accepte') updateData.statut = 'confirme'

  await payload.update({
    collection: 'demenagements',
    id: Number(dossier.id),
    data: updateData,
    overrideAccess: true,
  })

  // Données d'affichage communes
  const nomComplet = dossier.nomComplet ?? session.user.email
  const dateFr = new Date(now).toLocaleDateString('fr-FR', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  })
  const heureFr = new Date(now).toLocaleTimeString('fr-FR', {
    hour:   '2-digit',
    minute: '2-digit',
  })

  // 8. Message système dans le chat (non-bloquant)
  const contenuMessage =
    action === 'accepte'
      ? `✅ Devis ${numeroDossier} accepté par ${nomComplet} le ${dateFr} à ${heureFr}.\n\nSignature électronique : « Je soussigné(e) ${nomComplet} confirme accepter le devis ${numeroDossier} — DT Déménagement Tunisie. »${commentaire ? `\n\nCommentaire : ${commentaire}` : ''}`
      : `❌ Devis ${numeroDossier} refusé par ${nomComplet} le ${dateFr} à ${heureFr}.${commentaire ? `\n\nMotif : ${commentaire}` : ''}`

  payload
    .create({
      collection: 'messages',
      data: {
        demenagement: Number(dossier.id),
        auteur:       'client',
        clientId:     session.user.email,
        contenu:      contenuMessage,
        lu:           false,
      },
      overrideAccess: true,
    })
    .catch(() => {
      // Non-bloquant — échec silencieux
    })

  // 9. Email admin (non-bloquant)
  const emailSubject =
    action === 'accepte'
      ? `✅ Devis accepté — ${numeroDossier} — ${nomComplet}`
      : `❌ Devis refusé — ${numeroDossier} — ${nomComplet}`

  const badgeColor   = action === 'accepte' ? '#16a34a' : '#b52027'
  const badgeLabel   = action === 'accepte' ? 'ACCEPTÉ' : 'REFUSÉ'
  const commentHtml  = commentaire
    ? `<tr>
         <td style="padding:10px 24px 0;font-size:12px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">
           ${action === 'accepte' ? 'Commentaire' : 'Motif du refus'}
         </td>
       </tr>
       <tr>
         <td style="padding:4px 24px 16px;font-size:14px;color:#f8f5f0;white-space:pre-wrap;">
           ${escapeHtml(commentaire)}
         </td>
       </tr>`
    : ''

  const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>${emailSubject}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#111111;border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- En-tête -->
          <tr>
            <td style="background:#1a1a1a;padding:20px 24px;border-bottom:1px solid #2a2a2a;">
              <span style="color:#f8f5f0;font-size:16px;font-weight:bold;">DT Déménagement Tunisie</span>
            </td>
          </tr>

          <!-- Badge statut -->
          <tr>
            <td style="padding:24px 24px 8px;">
              <span style="display:inline-block;background:${badgeColor};color:#fff;
                           font-size:13px;font-weight:bold;letter-spacing:1px;
                           padding:6px 14px;border-radius:4px;">
                ${badgeLabel}
              </span>
            </td>
          </tr>

          <!-- Titre -->
          <tr>
            <td style="padding:8px 24px 16px;font-size:20px;font-weight:bold;color:#f8f5f0;">
              Réponse au devis ${escapeHtml(numeroDossier)}
            </td>
          </tr>

          <!-- Dossier -->
          <tr>
            <td style="padding:0 24px;font-size:12px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">
              Numéro de dossier
            </td>
          </tr>
          <tr>
            <td style="padding:4px 24px 16px;font-size:14px;color:#f8f5f0;">
              ${escapeHtml(numeroDossier)}
            </td>
          </tr>

          <!-- Client -->
          <tr>
            <td style="padding:0 24px;font-size:12px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">
              Client
            </td>
          </tr>
          <tr>
            <td style="padding:4px 24px 16px;font-size:14px;color:#f8f5f0;">
              ${escapeHtml(nomComplet)}
            </td>
          </tr>

          <!-- Date -->
          <tr>
            <td style="padding:0 24px;font-size:12px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">
              Date de réponse
            </td>
          </tr>
          <tr>
            <td style="padding:4px 24px 16px;font-size:14px;color:#f8f5f0;">
              ${dateFr} à ${heureFr}
            </td>
          </tr>

          <!-- Commentaire (conditionnel) -->
          ${commentHtml}

          <!-- Séparateur -->
          <tr>
            <td style="padding:0 24px;">
              <hr style="border:none;border-top:1px solid #2a2a2a;margin:8px 0;">
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding:16px 24px;font-size:12px;color:#a0a0a0;">
              Cet email a été généré automatiquement par le système DT Déménagement Tunisie.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  sendMail({ to: env.EMAIL_DEVIS_TO, subject: emailSubject, html: emailHtml })
    .catch((err: unknown) => { console.error(`[devis-response] Échec notification admin (${action} — ${numeroDossier}) :`, err) })

  // 9b. Email de confirmation au CLIENT (non-bloquant)
  const clientEmail = session.user.email
  if (clientEmail) {
    const clientSubject = action === 'accepte'
      ? `✅ Votre devis est confirmé — DT Déménagement`
      : `Votre retour a bien été reçu — DT Déménagement`

    const clientHtml = action === 'accepte'
      ? `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#16a34a;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Acceptation de devis confirmée</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
            Bonjour,<br><br>
            Votre acceptation du devis <strong style="color:#c9a84c;">${escapeHtml(numeroDossier)}</strong> a bien été enregistrée. 🎉<br><br>
            Notre équipe vous contactera dans les <strong style="color:#4ade80;">24 heures</strong> pour finaliser les détails de votre déménagement.
          </p>
          <div style="background:#1a1a1a;border-left:3px solid #4ade80;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;color:#a0a0a0;">Dossier accepté le</p>
            <p style="margin:0;font-size:15px;font-weight:bold;color:#f8f5f0;">${dateFr} à ${heureFr}</p>
          </div>
          <p style="margin:0;font-size:13px;color:#a0a0a0;line-height:1.6;">
            En cas de question, contactez-nous au <strong style="color:#f8f5f0;"><a href="tel:+21652880112" style="color:#c9a84c;text-decoration:none;">+216 52 880 112</a></strong> ou sur WhatsApp.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">+216 52 880 112 — contact@demenagement.tn — © ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
      : `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Retour sur devis reçu</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
            Bonjour,<br><br>
            Nous avons bien reçu votre retour concernant le devis <strong style="color:#c9a84c;">${escapeHtml(numeroDossier)}</strong>.<br><br>
            Notre équipe vous contactera prochainement pour discuter de vos besoins et vous proposer une solution adaptée.
          </p>
          ${commentaire ? `<div style="background:#1a1a1a;border-left:3px solid #a0a0a0;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;color:#a0a0a0;">Votre commentaire</p>
            <p style="margin:0;font-size:14px;color:#f8f5f0;white-space:pre-wrap;">${escapeHtml(commentaire)}</p>
          </div>` : ''}
          <p style="margin:0;font-size:13px;color:#a0a0a0;line-height:1.6;">
            N'hésitez pas à nous appeler au <a href="tel:+21652880112" style="color:#c9a84c;text-decoration:none;">+216 52 880 112</a>.
            <br><strong style="color:#f8f5f0;">L'équipe DT Déménagement Tunisie</strong>
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">+216 52 880 112 — contact@demenagement.tn — © ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

    sendMail({ to: clientEmail, subject: clientSubject, html: clientHtml })
      .catch((err: unknown) => { console.error(`[devis-response] Échec email client (${action} — ${numeroDossier}) :`, err) })
  }

  // 10. Réponse de succès
  return NextResponse.json({ success: true, action }, { status: 200 })
}
