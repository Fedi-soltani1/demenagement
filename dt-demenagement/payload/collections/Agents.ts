import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { randomPassword } from '../../lib/random-password'
import { buildAgentCredentialsEmail } from '../../lib/agent-credentials-email'
import { buildAgentCredentialsWhatsApp } from '../../lib/agent-credentials-whatsapp'
import { sendMail } from '../../lib/mailer'
import { sendWhatsAppMessage } from '../../lib/send-whatsapp'
import { resolveAgentAppUrl } from '../../lib/agent-app-url'

const Agents: CollectionConfig = {
  slug: 'agents',
  labels: { singular: 'Agent immobilier', plural: 'Agents immobiliers' },

  // Auth standard (login / logout / mot de passe oublié via Resend).
  // Le changement de mot de passe forcé à la 1re connexion sera géré côté app (Plan 3).
  // tokenExpiration : 30 jours (défaut Payload = 2h) → l'agent reste connecté entre
  // les ouvertures de l'app au lieu d'être déconnecté à chaque session.
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 jours (en secondes)
    // « Mot de passe oublié » : l'email pointe vers la page de réinitialisation de
    // l'app agent (et non l'admin Payload). Endpoints auto-exposés :
    // POST /api/agents/forgot-password  et  POST /api/agents/reset-password.
    forgotPassword: {
      generateEmailSubject: () => 'Réinitialisation de votre mot de passe — DT Déménagement',
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const link = `${resolveAgentAppUrl()}/reset-password?token=${encodeURIComponent(token)}`
        return `<!doctype html><html lang="fr"><body style="font-family:Arial,Helvetica,sans-serif;color:#1b2a4a;line-height:1.5">
  <p>Bonjour,</p>
  <p>Vous avez demandé la réinitialisation de votre mot de passe pour l'espace partenaire <strong>DT Déménagement</strong>.</p>
  <p style="margin:24px 0">
    <a href="${link}" style="display:inline-block;background:#b52027;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">Réinitialiser mon mot de passe</a>
  </p>
  <p>Ou copiez ce lien dans votre navigateur :<br><a href="${link}">${link}</a></p>
  <p style="color:#9a9a9a;font-size:13px">Ce lien expire sous 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
</body></html>`
      },
    },
  },

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
    {
      name: 'renvoiIdentifiants', type: 'ui',
      admin: { components: { Field: '@/components/payload/AgentResendCredentials' } },
    },
    { name: 'photo',     type: 'upload', relationTo: 'media', label: 'Photo de l\'agent' },
    { name: 'rib',       type: 'text', label: 'RIB / IBAN', admin: { description: 'Coordonnées bancaires (pour les virements de commission).' } },
    { name: 'actif',     type: 'checkbox', label: 'Compte actif', defaultValue: true },
  ],

  hooks: {
    // Création : si aucun mot de passe n'est fourni, en générer un automatiquement.
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.password) {
          data.password = randomPassword()
        }
        return data
      },
    ],
    // Détermine le mot de passe à communiquer et les canaux d'envoi, puis remet la
    // case WhatsApp à zéro (action ponctuelle).
    //  • Création   → email systématique (+ WhatsApp si coché), avec le mot de passe initial.
    //  • Mise à jour → WhatsApp seulement si la case est cochée ; l'ancien mot de passe
    //    n'étant pas récupérable, on en régénère un nouveau.
    //  (Le ré-envoi par EMAIL passe par l'action dédiée /api/admin/agent-resend-credentials.)
    beforeChange: [
      ({ data, operation, req }) => {
        if (!data) return data
        const ctx = req.context as Record<string, unknown>
        const wantsWhatsapp = Boolean(data.envoyerWhatsapp && data.whatsapp)

        if (operation === 'create') {
          ctx.agentSendPassword = String(data.password ?? '')
          ctx.agentSendEmail    = true
          ctx.agentSendWhatsapp = wantsWhatsapp
        } else if (operation === 'update' && wantsWhatsapp) {
          const pwd = randomPassword()
          data.password = pwd
          ctx.agentSendPassword = pwd
          ctx.agentSendEmail    = false
          ctx.agentSendWhatsapp = true
        }

        data.envoyerWhatsapp = false
        return data
      },
    ],
    // Envoi effectif sur les canaux retenus, avec le même mot de passe et un lien
    // absolu vers l'espace agent. Erreurs non bloquantes mais journalisées.
    afterChange: [
      async ({ doc, req }) => {
        const ctx = req.context as Record<string, unknown>
        const pwd = ctx.agentSendPassword
        if (typeof pwd !== 'string' || !pwd) return doc

        const appUrl   = resolveAgentAppUrl()
        const prenom   = String(doc.prenom ?? '')
        const email    = String(doc.email ?? '').trim()
        const whatsapp = String(doc.whatsapp ?? '').trim()

        if (ctx.agentSendEmail && email) {
          const { subject, html } = buildAgentCredentialsEmail({ prenom, email, tempPassword: pwd, appUrl })
          try {
            await sendMail({ to: email, subject, html })
            req.payload.logger.info(`[agents] email identifiants envoyé à ${email}`)
          } catch (err) {
            req.payload.logger.error(`[agents] échec email identifiants à ${email}: ${String(err)}`)
          }
        }

        if (ctx.agentSendWhatsapp && whatsapp) {
          const message = buildAgentCredentialsWhatsApp({ prenom, email, tempPassword: pwd, appUrl })
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
