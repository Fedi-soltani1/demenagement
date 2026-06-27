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
    // ── Résumé : agent · type · statut ────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'agent', type: 'relationship', relationTo: 'agents', label: 'Agent', admin: { readOnly: true, width: '40%' } },
        {
          name: 'type', type: 'select', required: true, defaultValue: 'devis', label: 'Type',
          admin: { width: '30%' },
          options: [
            { label: 'Déménagement', value: 'devis' },
            { label: 'Rendez-vous',  value: 'rendez-vous' },
          ],
        },
        {
          name: 'statut', type: 'select', defaultValue: 'soumise', label: 'Statut',
          admin: { width: '30%' },
          options: [
            { label: 'Soumise',              value: 'soumise' },
            { label: 'Vue par DT',           value: 'vue' },
            { label: 'Acceptée',             value: 'acceptee' },
            { label: 'Refusée',              value: 'refusee' },
            { label: 'Déménagement réalisé', value: 'realisee' },
          ],
        },
      ],
    },
    { name: 'motifRefus', type: 'textarea', label: 'Motif du refus', admin: { rows: 2, condition: (d) => d.statut === 'refusee' } },

    // ── Client & trajet ───────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'clientNom',       type: 'text', required: true, label: 'Nom du client', admin: { width: '50%' } },
        { name: 'clientTelephone', type: 'text', required: true, label: 'Téléphone',     admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'clientEmail', type: 'email', label: 'Email',                            admin: { width: '50%' } },
        { name: 'dateApprox',  type: 'text', required: true, label: 'Date approximative', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'villeDepart',  type: 'text', required: true, label: 'Ville de départ', admin: { width: '50%' } },
        { name: 'villeArrivee', type: 'text', label: 'Ville d\'arrivée / visite',       admin: { width: '50%' } },
      ],
    },

    // ── Conversion (action principale) ────────────────────────────────────────
    {
      name: 'convertisseur',
      type: 'ui',
      label: ' ',
      admin: { components: { Field: '@/components/payload/DemandeConverter' } },
    },

    // ── Détails du bien & adresses (repliés) ──────────────────────────────────
    {
      type: 'collapsible',
      label: 'Adresses & détails du bien (facultatif)',
      admin: { initCollapsed: true },
      fields: [
        { name: 'adresseDepart',  type: 'textarea', label: 'Adresse de départ complète',  admin: { rows: 2 } },
        { name: 'adresseArrivee', type: 'textarea', label: 'Adresse d\'arrivée complète', admin: { rows: 2 } },
        { name: 'typeBien', type: 'text', label: 'Type de bien' },
        { name: 'notes', type: 'textarea', label: 'Notes', admin: { rows: 3 } },
      ],
    },

    // ── Liens (visibles seulement après conversion) ───────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'dossierLie', type: 'relationship', relationTo: 'demenagements', label: 'Dossier lié', admin: { readOnly: true, width: '50%', condition: (d) => Boolean(d.dossierLie) } },
        { name: 'rdvLie',     type: 'relationship', relationTo: 'rendez-vous',   label: 'RDV lié',     admin: { readOnly: true, width: '50%', condition: (d) => Boolean(d.rdvLie) } },
      ],
    },
  ],
}

export default DemandesAgents
