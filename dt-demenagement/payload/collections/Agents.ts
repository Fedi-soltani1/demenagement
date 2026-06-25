import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { randomPassword } from '../../lib/random-password'
import { buildAgentCredentialsEmail } from '../../lib/agent-credentials-email'
import { buildAgentCredentialsWhatsApp } from '../../lib/agent-credentials-whatsapp'
import { sendMail } from '../../lib/mailer'
import { sendWhatsAppMessage } from '../../lib/send-whatsapp'

const Agents: CollectionConfig = {
  slug: 'agents',
  labels: { singular: 'Agent immobilier', plural: 'Agents immobiliers' },

  // Auth standard (login / logout / mot de passe oublié via Resend).
  // Le changement de mot de passe forcé à la 1re connexion sera géré côté app (Plan 3).
  auth: true,

  access: {
    // Super-admin : tout. Agent : uniquement son propre enregistrement (profil).
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'super-admin') return true
      if ((user as { collection?: string }).collection === 'agents' && user.id != null) {
        return { id: { equals: user.id } }
      }
      return false
    },
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'super-admin') return true
      return (user as { collection?: string }).collection === 'agents' && String(user.id) === String(id)
    },
    delete: isAdmin,
  },

  admin: {
    group: '🤝 Affiliation',
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'prenom', 'agence', 'actif'],
    description: 'Agents immobiliers partenaires. À la création, l\'agent reçoit un email avec ses identifiants et le lien de l\'app.',
  },

  fields: [
    { name: 'nom',       type: 'text', label: 'Nom',    required: true },
    { name: 'prenom',    type: 'text', label: 'Prénom', required: true },
    { name: 'agence',    type: 'text', label: 'Agence immobilière' },
    { name: 'telephone', type: 'text', label: 'Téléphone' },
    { name: 'whatsapp',  type: 'text', label: 'Numéro WhatsApp', admin: { description: 'Format international (ex: 21652000000). Permet l\'envoi des identifiants sur WhatsApp.' } },
    {
      name: 'envoyerWhatsapp', type: 'checkbox', label: '📲 Envoyer les identifiants sur WhatsApp',
      admin: { description: 'Cochez puis Enregistrez pour envoyer (ou ré-envoyer) les identifiants sur WhatsApp. Après création, un NOUVEAU mot de passe est généré (l\'ancien n\'est pas récupérable). Nécessite le bot WhatsApp configuré.' },
    },
    { name: 'photo',     type: 'upload', relationTo: 'media', label: 'Photo de l\'agent' },
    { name: 'rib',       type: 'text', label: 'RIB / IBAN', admin: { description: 'Coordonnées bancaires (pour les virements de commission).' } },
    { name: 'actif',     type: 'checkbox', label: 'Compte actif', defaultValue: true },
  ],

  hooks: {
    // Avant validation à la création : si aucun mot de passe fourni, en générer un
    // et le mémoriser dans req.context pour l'envoyer par email après création.
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          // Si l'admin n'a pas saisi de mot de passe, en générer un automatiquement.
          if (!data.password) data.password = randomPassword()
          // Mémoriser le mot de passe EN CLAIR (saisi par l'admin OU généré) pour
          // l'envoyer dans l'email d'identifiants après création.
          ;(req.context as Record<string, unknown>).agentTempPassword = String(data.password)
        }
        return data
      },
    ],
    // Gère la case « Envoyer sur WhatsApp » : mémorise le mot de passe à envoyer
    // et remet la case à zéro. À l'update on régénère un mot de passe (l'original
    // n'est pas récupérable) ; à la création on réutilise celui déjà généré.
    beforeChange: [
      ({ data, operation, req }) => {
        if (data && data.envoyerWhatsapp && data.whatsapp) {
          let pwd: string
          if (operation === 'update') {
            pwd = randomPassword()
            data.password = pwd
          } else {
            pwd = String(data.password ?? '')
          }
          ;(req.context as Record<string, unknown>).agentWhatsappPassword = pwd
        }
        if (data) data.envoyerWhatsapp = false
        return data
      },
    ],
    // Envoie l'email (canal principal, à la création) et/ou le WhatsApp (si demandé).
    afterChange: [
      async ({ doc, operation, req }) => {
        const appUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL
          ?? `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/agent`
        const prenom = String(doc.prenom ?? '')
        const email = String(doc.email ?? '')

        // Email — canal principal, uniquement à la création.
        if (operation === 'create') {
          const temp = (req.context as Record<string, unknown>).agentTempPassword
          if (typeof temp === 'string' && email) {
            const { subject, html } = buildAgentCredentialsEmail({ prenom, email, tempPassword: temp, appUrl })
            try {
              await sendMail({ to: email, subject, html })
              req.payload.logger.info(`[agents] email identifiants envoyé à ${email}`)
            } catch (err) {
              req.payload.logger.error(`[agents] échec email identifiants à ${email}: ${String(err)}`)
            }
          }
        }

        // WhatsApp — si la case a été cochée (à la création ou à l'update).
        const waPass = (req.context as Record<string, unknown>).agentWhatsappPassword
        const whatsapp = String(doc.whatsapp ?? '').trim()
        if (typeof waPass === 'string' && waPass && whatsapp) {
          const message = buildAgentCredentialsWhatsApp({ prenom, email, tempPassword: waPass, appUrl })
          try {
            await sendWhatsAppMessage(whatsapp, message)
            req.payload.logger.info(`[agents] WhatsApp identifiants envoyé à ${whatsapp}`)
          } catch (err) {
            req.payload.logger.warn(`[agents] WhatsApp non envoyé à ${whatsapp} (bot configuré ?): ${String(err)}`)
          }
        }
        return doc
      },
    ],
  },
}

export default Agents
