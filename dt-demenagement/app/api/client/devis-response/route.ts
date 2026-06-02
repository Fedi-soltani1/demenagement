import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/auth'
import { env } from '@/lib/env'

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

  const dossier = found.docs[0] as Record<string, unknown>

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
  const nomComplet = (dossier.nomComplet as string | undefined) ?? session.user.email
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
           ${commentaire.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
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
              Réponse au devis ${numeroDossier}
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
              ${numeroDossier}
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
              ${nomComplet}
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

  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    env.EMAIL_FROM,
        to:      env.EMAIL_DEVIS_TO,
        subject: emailSubject,
        html:    emailHtml,
      }),
    })
  } catch {
    // Non-bloquant — échec silencieux
  }

  // 10. Réponse de succès
  return NextResponse.json({ success: true, action }, { status: 200 })
}
