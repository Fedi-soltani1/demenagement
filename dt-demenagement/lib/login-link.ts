// Génère un lien magique unique et l'envoie sur les canaux choisis.
// L'identité (email réel sinon téléphone synthétique) est calculée par resolveIdentity ;
// le canal n'est que le moyen de livraison. JAMAIS d'email vers une identité synthétique.
import { normalizePhoneTN } from '@/lib/phone'
import { buildPhoneIdentity, isSyntheticIdentity } from '@/lib/client-identity'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { sendMail } from '@/lib/mailer'
import { buildMagicLinkEmail } from '@/lib/emails/magic-link'
import { sendWhatsAppMessage } from '@/lib/send-whatsapp'
import { COMPANY } from '@/lib/constants'

// Email réel (minuscule) si présent et non synthétique, sinon identité téléphone canonique.
// isSyntheticIdentity couvre les deux formats : actuel (@wa.client) et ancien (wa.<chiffres>@dt-demenagement.tn).
export function resolveIdentity(input: { email?: string | null; telephone?: string | null }): string {
  const email = (input.email ?? '').trim().toLowerCase()
  if (email && !isSyntheticIdentity(email)) return email
  return buildPhoneIdentity(normalizePhoneTN(input.telephone))
}

export async function sendLoginLink(opts: {
  identity: string
  channels: { email?: boolean; whatsapp?: boolean }
  telephone?: string | null
  prenom?: string | null
  callbackPath?: string
}): Promise<void> {
  const callbackPath = opts.callbackPath ?? '/espace-client'
  const url = await generateMagicLink(opts.identity, callbackPath)

  // Canal email : seulement si demandé ET identité = vrai email.
  if (opts.channels.email && !isSyntheticIdentity(opts.identity)) {
    await sendMail({
      to:      opts.identity,
      subject: 'Votre lien de connexion — DT Déménagement',
      html:    buildMagicLinkEmail(url),
    })
  }

  // Canal WhatsApp : seulement si demandé ET un numéro est disponible.
  const tel = (opts.telephone ?? '').trim()
  if (opts.channels.whatsapp && tel) {
    const bonjour = opts.prenom ? `Bonjour ${opts.prenom} 👋` : 'Bonjour 👋'
    await sendWhatsAppMessage(
      tel,
      `${bonjour}\n\nVoici votre lien de connexion à votre espace client DT Déménagement ` +
        `(valable 24h, usage unique) :\n\n🔗 ${url}\n\nDT Déménagement Tunisie — ${COMPANY.phone1}`,
    )
  }
}
