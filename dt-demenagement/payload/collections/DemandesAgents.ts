import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAgentOwner } from '../access/isAgentOwner'
import { agentStatutInfo } from '../../lib/agent-statut-labels'

const DemandesAgents: CollectionConfig = {
  slug: 'demandes-agents',
  labels: { singular: 'Demande agent', plural: 'Demandes agents' },

  access: {
    // Lecture : super-admin (tout) ou l'agent propriétaire (ses demandes).
    read: isAgentOwner,
    // Création : un agent connecté crée pour lui-même (l'agent est forcé par hook).
    create: ({ req: { user } }) =>
      Boolean(user && (user as { collection?: string }).collection === 'agents'),
    // Mise à jour : super-admin uniquement (l'agent ne modifie pas une demande envoyée).
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    // Opérationnel → visible uniquement pour le super-admin.
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'super-admin',
    group: '🚚 Opérations',
    useAsTitle: 'clientNom',
    defaultColumns: ['clientNom', 'type', 'statut', 'agent', 'createdAt'],
    description: 'Demandes soumises par les agents immobiliers. Examiner puis convertir en Dossier ou RDV.',
  },

  hooks: {
    // Force l'agent = utilisateur connecté à la création (anti-triche).
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user && (req.user as { collection?: string }).collection === 'agents') {
          data.agent = req.user.id
        }
        return data
      },
    ],
    // Au changement de statut par l'admin : notifier l'agent (in-app + email).
    // On crée une notification dont le hook envoie l'email — une seule source d'infra.
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return doc
        const before = (previousDoc as { statut?: string } | undefined)?.statut
        const after = (doc as { statut?: string }).statut
        if (!after || before === after) return doc

        const agentRel = (doc as { agent?: unknown }).agent
        const agentId = typeof agentRel === 'object' && agentRel !== null
          ? (agentRel as { id: string | number }).id
          : agentRel
        if (agentId == null) return doc

        const label = agentStatutInfo(after).label
        const clientNom = String((doc as { clientNom?: string }).clientNom ?? 'votre client')
        const villeDepart = String((doc as { villeDepart?: string }).villeDepart ?? '')
        const villeArrivee = String((doc as { villeArrivee?: string }).villeArrivee ?? '')
        const motifRefus = String((doc as { motifRefus?: string }).motifRefus ?? '')

        const trajet = villeDepart || villeArrivee ? ` (${villeDepart} → ${villeArrivee})` : ''
        let message = `Le statut de votre demande pour ${clientNom}${trajet} est maintenant : ${label}.`
        if (after === 'refusee' && motifRefus) message += `\n\nMotif : ${motifRefus}`

        try {
          await req.payload.create({
            collection: 'notifications-agents',
            data: {
              agent: agentId as string | number,
              titre: `Demande ${clientNom} — ${label}`,
              message,
              canalEmail: true,
              canalWhatsapp: false,
            },
            overrideAccess: true,
          })
          req.payload.logger.info(`[demandes-agents] notif statut « ${after} » créée pour agent ${String(agentId)}`)
        } catch (err) {
          req.payload.logger.error(`[demandes-agents] notif statut échouée: ${String(err)}`)
        }
        return doc
      },
    ],
  },

  fields: [
    { name: 'agent', type: 'relationship', relationTo: 'agents', label: 'Agent', admin: { readOnly: true } },
    {
      name: 'type', type: 'select', required: true, defaultValue: 'devis', label: 'Type de demande',
      options: [
        { label: 'Devis / Déménagement', value: 'devis' },
        { label: 'Rendez-vous', value: 'rendez-vous' },
      ],
    },
    // Client — essentiels (requis)
    { name: 'clientNom',       type: 'text', required: true, label: 'Nom du client' },
    { name: 'clientTelephone', type: 'text', required: true, label: 'Téléphone du client' },
    { name: 'villeDepart',     type: 'text', required: true, label: 'Ville de départ' },
    { name: 'villeArrivee',    type: 'text', required: true, label: 'Ville d\'arrivée' },
    { name: 'dateApprox',      type: 'text', required: true, label: 'Date approximative' },
    // Client — optionnels
    { name: 'clientEmail',    type: 'email', label: 'Email du client' },
    { name: 'adresseDepart',  type: 'textarea', label: 'Adresse de départ complète' },
    { name: 'adresseArrivee', type: 'textarea', label: 'Adresse d\'arrivée complète' },
    { name: 'typeBien',       type: 'text', label: 'Type de bien' },
    { name: 'volume',         type: 'text', label: 'Volume estimé' },
    { name: 'notes',          type: 'textarea', label: 'Notes' },
    // Suivi
    {
      name: 'statut', type: 'select', defaultValue: 'soumise', label: 'Statut (jalon agent)',
      options: [
        { label: 'Soumise',              value: 'soumise' },
        { label: 'Vue par DT',           value: 'vue' },
        { label: 'Acceptée',             value: 'acceptee' },
        { label: 'Refusée',              value: 'refusee' },
        { label: 'Déménagement réalisé', value: 'realisee' },
      ],
    },
    { name: 'motifRefus', type: 'textarea', label: 'Motif du refus', admin: { condition: (d) => d.statut === 'refusee' } },
    { name: 'dossierLie', type: 'relationship', relationTo: 'demenagements', label: 'Dossier lié', admin: { readOnly: true } },
    { name: 'rdvLie',     type: 'relationship', relationTo: 'rendez-vous',   label: 'RDV lié',     admin: { readOnly: true } },
  ],
}

export default DemandesAgents
