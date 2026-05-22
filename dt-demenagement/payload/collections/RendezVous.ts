import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isCommercial } from '../access/isClient'

const RendezVous: CollectionConfig = {
  slug: 'rendez-vous',
  labels: { singular: 'Rendez-vous visite', plural: 'Rendez-vous visites' },

  access: {
    read:   isCommercial,
    create: isAdmin,
    update: isCommercial,
    delete: isAdmin,
  },

  admin: {
    group: '📬 Demandes clients',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'prenom', 'telephone', 'dateVisite', 'statut', 'createdAt'],
    description: 'Demandes de visite à domicile reçues depuis le site. Contacter le client pour confirmer le RDV.',
  },

  fields: [
    {
      name: 'statut',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'nouveau',
      admin: {
        description: 'Mettre à jour après avoir contacté le client.',
        components: {
          Cell: '@/components/payload/RDVStatutCell',
        },
      },
      options: [
        { label: '🆕 Nouveau — pas encore traité', value: 'nouveau' },
        { label: '✅ Confirmé — RDV validé',        value: 'confirme' },
        { label: '❌ Annulé',                        value: 'annule' },
      ],
    },
    {
      name: 'type',
      label: 'Type de client',
      type: 'select',
      required: true,
      defaultValue: 'client',
      options: [
        { label: 'Client',         value: 'client' },
        { label: 'Entreprise',     value: 'entreprise' },
        { label: 'Administration', value: 'administration' },
      ],
    },
    { name: 'nom',       label: 'Nom',       type: 'text',  required: true },
    { name: 'prenom',    label: 'Prénom',    type: 'text',  required: true },
    { name: 'telephone', label: 'Téléphone', type: 'text',  required: true },
    { name: 'whatsapp',  label: 'WhatsApp',  type: 'text',  required: true },
    { name: 'email',     label: 'Email',     type: 'email', required: false },
    { name: 'adresse',   label: 'Adresse',   type: 'text',  required: false },
    {
      name: 'dateVisite',
      label: 'Date de visite souhaitée',
      type: 'text',
      required: false,
      admin: { description: 'Format YYYY-MM-DD envoyé par le formulaire.' },
    },
    {
      name: 'heure',
      label: 'Heure souhaitée',
      type: 'text',
      required: false,
    },
    {
      name: 'actionsRapides',
      type: 'ui',
      label: '⚡ Actions rapides',
      admin: {
        components: {
          Field: '@/components/payload/RDVActions',
        },
      },
    },
  ],
}

export default RendezVous
