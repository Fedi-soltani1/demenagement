'use server'

import { signIn } from '@/auth'
import { getPayloadSafe } from '@/lib/payload-safe'
import { isEmailInput } from '@/lib/client-identity'
import { normalizePhoneTN } from '@/lib/phone'
import { resolveIdentity, sendLoginLink } from '@/lib/login-link'

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

type ClientDoc  = { email?: string | null; telephone?: string | null; prenom?: string | null }
type DossierDoc = { clientId?: string | null; telephone?: string | null; nomComplet?: string | null }

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
      const identity = resolveIdentity({ email })
      await sendLoginLink({ identity, channels: { email: true }, callbackPath })
      return { ok: true }
    }

    // Téléphone
    const canonical = normalizePhoneTN(input)
    if (canonical.length < 8) return { error: 'not_found' }
    const national = canonical.startsWith('216') ? canonical.slice(3) : canonical
    const [clients, dossiers] = await Promise.all([
      payload.find({ collection: 'clients', where: { telephone: { like: national } }, limit: 20, overrideAccess: true }),
      payload.find({ collection: 'demenagements', where: { telephone: { like: national } }, sort: '-createdAt', limit: 20, overrideAccess: true }),
    ])
    const client  = (clients.docs as ClientDoc[]).find((c) => normalizePhoneTN(c.telephone) === canonical)
    const dossier = (dossiers.docs as DossierDoc[]).find((d) => normalizePhoneTN(d.telephone) === canonical)
    if (!client && !dossier) return { error: 'not_found' }

    const realEmail = client?.email && !client.email.endsWith('@wa.client') ? client.email
      : (dossier?.clientId && !dossier.clientId.endsWith('@wa.client') ? dossier.clientId : undefined)
    const telephone = (client?.telephone ?? dossier?.telephone ?? '').trim()
    const prenom    = (client?.prenom ?? '').trim() || (dossier?.nomComplet ?? '').trim().split(' ')[0] || undefined

    const identity = resolveIdentity({ email: realEmail, telephone })
    const channels = realEmail ? { email: true } : { whatsapp: true }
    await sendLoginLink({ identity, channels, telephone, prenom, callbackPath })
    return { ok: true }
  } catch (e) {
    console.error('[requestLoginLink] échec:', e)
    return { error: 'failed' }
  }
}
