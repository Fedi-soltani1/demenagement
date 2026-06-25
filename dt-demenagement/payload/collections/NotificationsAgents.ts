import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAgentOwner } from '../access/isAgentOwner'
import { buildAgentNotificationEmail } from '../../lib/agent-notification-email'
import { sendMail } from '../../lib/mailer'
import { sendWhatsAppMessage } from '../../lib/send-whatsapp'

const NotificationsAgents: CollectionConfig = {
  slug: 'notifications-agents',
  labels: { singular: 'Notification agent', plural: 'Notifications agents' },

  access: {
    // Lecture : super-admin (tout) ou l'agent destinataire (ses notifications, pour l'affichage in-app).
    read: isAgentOwner,
    // Création/suppression : super-admin uniquement (c'est l'admin qui envoie).
    create: isAdmin,
    delete: isAdmin,
    // Mise à jour : super-admin OU l'agent destinataire (pour marquer « lu » depuis l'app).
    update: isAgentOwner,
  },

  admin: {
    // Opérationnel → visible uniquement pour le super-admin.
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'super-admin',
    group: '🤝 Affiliation',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'agent', 'lu', 'createdAt'],
    description: 'Envoyer un message/notification à un agent. À l\'enregistrement : email (et WhatsApp si coché) + notification dans son app.',
  },

  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        const agentId = typeof doc.agent === 'object' && doc.agent !== null
          ? (doc.agent as { id: string | number }).id
          : doc.agent
        if (agentId == null) return doc

        let agent: { prenom?: string; email?: string; whatsapp?: string } = {}
        try {
          agent = (await req.payload.findByID({ collection: 'agents', id: agentId, depth: 0 })) as typeof agent
        } catch (err) {
          req.payload.logger.error(`[notif-agents] agent introuvable ${String(agentId)}: ${String(err)}`)
          return doc
        }

        const appUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL
          ?? `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/agent`
        const prenom = String(agent.prenom ?? '')
        const titre = String(doc.titre ?? '')
        const message = String(doc.message ?? '')

        // Canal email
        if (doc.canalEmail && agent.email) {
          const { subject, html } = buildAgentNotificationEmail({ prenom, titre, message, appUrl })
          try {
            await sendMail({ to: String(agent.email), subject, html })
            req.payload.logger.info(`[notif-agents] email envoyé à ${agent.email}`)
          } catch (err) {
            req.payload.logger.error(`[notif-agents] échec email à ${agent.email}: ${String(err)}`)
          }
        }

        // Canal WhatsApp (graceful tant que le bot n'est pas configuré)
        if (doc.canalWhatsapp && agent.whatsapp) {
          const waText = [titre, message, '', appUrl].filter(Boolean).join('\n')
          try {
            await sendWhatsAppMessage(String(agent.whatsapp), waText)
            req.payload.logger.info(`[notif-agents] WhatsApp envoyé à ${agent.whatsapp}`)
          } catch (err) {
            req.payload.logger.warn(`[notif-agents] WhatsApp non envoyé à ${agent.whatsapp} (bot configuré ?): ${String(err)}`)
          }
        }

        return doc
      },
    ],
  },

  fields: [
    { name: 'agent', type: 'relationship', relationTo: 'agents', required: true, label: 'Agent destinataire' },
    { name: 'titre', type: 'text', label: 'Titre (court)' },
    { name: 'message', type: 'textarea', required: true, label: 'Message' },
    { name: 'canalEmail', type: 'checkbox', defaultValue: true, label: '📧 Envoyer par email' },
    { name: 'canalWhatsapp', type: 'checkbox', defaultValue: false, label: '📲 Envoyer aussi sur WhatsApp' },
    { name: 'lu', type: 'checkbox', defaultValue: false, label: 'Lu par l\'agent', admin: { readOnly: true } },
  ],
}

export default NotificationsAgents
