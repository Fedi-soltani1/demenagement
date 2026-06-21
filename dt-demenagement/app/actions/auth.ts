'use server'

import { signIn } from '@/auth'
import { getPayloadSafe } from '@/lib/payload-safe'
import { isEmailInput, buildPhoneIdentity } from '@/lib/client-identity'
import { phoneCore } from '@/lib/phone'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { sendMail } from '@/lib/mailer'
import { buildMagicLinkEmail } from '@/lib/emails/magic-link'
import { sendWhatsAppMessage } from '@/lib/send-whatsapp'

export async function sendMagicLink(email: string, callbackUrl: string): Promise<{ error?: string }> {
  try {
    // Provider NextAuth « nodemailer » (envoie le lien via Hostinger SMTP, cf. auth.ts).
    // ⚠️ Doit correspondre à l'id du provider configuré dans auth.ts (Nodemailer → 'nodemailer').
    await signIn('nodemailer', { email, redirectTo: callbackUrl })
    return {}
  } catch (err) {
    // Next.js redirect errors (NEXT_REDIRECT) must propagate — they're not real errors
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err
    return { error: 'errorDefault' }
  }
}

type ClientDoc  = { email?: string; telephone?: string }
type DossierDoc = { clientId?: string; telephone?: string }

// Demande un lien de connexion : détecte email/téléphone, retrouve le compte,
// choisit le canal (email prioritaire, sinon WhatsApp) et envoie le lien magique.
export async function requestLoginLink(
  rawInput: string,
  callbackPath: string,
): Promise<{ ok: true } | { error: 'not_found' | 'failed' }> {
  const input = rawInput.trim()
  if (!input) return { error: 'not_found' }

  const payload = await getPayloadSafe()
  if (!payload) return { error: 'failed' }

  try {
    if (isEmailInput(input)) {
      const email = input.toLowerCase()
      const [clients, dossiers] = await Promise.all([
        payload.find({ collection: 'clients', where: { email: { equals: email } }, limit: 1, overrideAccess: true }),
        payload.find({ collection: 'demenagements', where: { clientId: { equals: email } }, limit: 1, overrideAccess: true }),
      ])
      if (clients.totalDocs === 0 && dossiers.totalDocs === 0) return { error: 'not_found' }

      const url = await generateMagicLink(email, callbackPath)
      await sendMail({ to: email, subject: 'Votre lien de connexion — DT Déménagement', html: buildMagicLinkEmail(url) })
      return { ok: true }
    }

    // Téléphone
    const core = phoneCore(input)
    if (core.length < 8) return { error: 'not_found' }
    const [clientsRaw, dossiersRaw] = await Promise.all([
      payload.find({ collection: 'clients', where: { telephone: { like: core } }, limit: 20, overrideAccess: true }),
      payload.find({ collection: 'demenagements', where: { telephone: { like: core } }, sort: '-createdAt', limit: 20, overrideAccess: true }),
    ])
    // Re-vérification exacte : le `like` est une sous-chaîne SQL → filtrer sur l'égalité du cœur
    const client  = (clientsRaw.docs  as ClientDoc[]).find((d) => phoneCore(d.telephone) === core)
    const dossier = (dossiersRaw.docs as DossierDoc[]).find((d) => phoneCore(d.telephone) === core)
    if (!client && !dossier) return { error: 'not_found' }

    // Préférence email si présent
    const email = (client?.email ?? dossier?.clientId ?? '').trim()
    if (email) {
      const url = await generateMagicLink(email, callbackPath)
      await sendMail({ to: email, subject: 'Votre lien de connexion — DT Déménagement', html: buildMagicLinkEmail(url) })
      return { ok: true }
    }

    // Sinon WhatsApp — uniquement vers le numéro exactement vérifié (jamais vers l'input brut)
    const sendablePhone = (client?.telephone ?? dossier?.telephone ?? '').trim()
    if (!sendablePhone) return { error: 'not_found' }
    const url = await generateMagicLink(buildPhoneIdentity(core), callbackPath)
    await sendWhatsAppMessage(
      sendablePhone,
      `Bonjour,\n\nVoici votre lien de connexion à votre espace client DT Déménagement (valable 24h, à usage unique) :\n${url}`,
    )
    return { ok: true }
  } catch (e) {
    console.error('[requestLoginLink] échec:', e)
    return { error: 'failed' }
  }
}
