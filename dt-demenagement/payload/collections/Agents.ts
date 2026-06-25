import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { randomPassword } from '../../lib/random-password'
import { buildAgentCredentialsEmail } from '../../lib/agent-credentials-email'
import { sendMail } from '../../lib/mailer'

const Agents: CollectionConfig = {
  slug: 'agents',
  labels: { singular: 'Agent immobilier', plural: 'Agents immobiliers' },

  // Auth standard (login / logout / mot de passe oublié via Resend).
  // Le changement de mot de passe forcé à la 1re connexion sera géré côté app (Plan 3).
  auth: true,

  access: {
    // Gestion réservée au super-admin (opérationnel). Le self-access agent
    // (lecture de son propre profil depuis l'app) sera ajouté au Plan 2/3.
    read:   isAdmin,
    create: isAdmin,
    update: isAdmin,
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
    { name: 'photo',     type: 'upload', relationTo: 'media', label: 'Photo de l\'agent' },
    { name: 'rib',       type: 'text', label: 'RIB / IBAN', admin: { description: 'Coordonnées bancaires (pour les virements de commission).' } },
    { name: 'actif',     type: 'checkbox', label: 'Compte actif', defaultValue: true },
  ],

  hooks: {
    // Avant validation à la création : si aucun mot de passe fourni, en générer un
    // et le mémoriser dans req.context pour l'envoyer par email après création.
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.password) {
          const temp = randomPassword()
          data.password = temp
          ;(req.context as Record<string, unknown>).agentTempPassword = temp
        }
        return data
      },
    ],
    // Après création : envoyer l'email d'identifiants (mot de passe en clair mémorisé).
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        const temp = (req.context as Record<string, unknown>).agentTempPassword
        if (typeof temp !== 'string') return doc
        const appUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL
          ?? `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/agent`
        const { subject, html } = buildAgentCredentialsEmail({
          prenom: String(doc.prenom ?? ''),
          email: String(doc.email ?? ''),
          tempPassword: temp,
          appUrl,
        })
        try {
          await sendMail({ to: String(doc.email), subject, html })
        } catch (err) {
          req.payload.logger.error(`[agents] échec envoi email identifiants à ${doc.email}: ${String(err)}`)
        }
        return doc
      },
    ],
  },
}

export default Agents
