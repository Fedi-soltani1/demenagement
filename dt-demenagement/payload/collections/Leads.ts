import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },

  access: {
    read:   isAdmin,
    create: () => true,   // appelé depuis /api/leads (sans auth)
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🚚 Opérations',
    useAsTitle: 'nomPrenom',
    defaultColumns: ['nomPrenom', 'telephone', 'email', 'service', 'statut', 'createdAt'],
    listSearchableFields: ['nomPrenom', 'telephone', 'email'],
    description: 'Prospects ayant rempli le formulaire initial du popup "Devis Gratuit". Suivre leur conversion vers un devis ou un RDV.',
  },

  fields: [
    {
      name: 'nomPrenom',
      label: 'Nom complet',
      type: 'text',
      required: true,
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
    },
    {
      name: 'statut',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'nouveau',
      options: [
        { label: '🆕 Nouveau',                  value: 'nouveau'       },
        { label: '📋 Devis complet soumis',      value: 'devis_soumis'  },
        { label: '📅 RDV planifié',              value: 'rdv_planifie'  },
        { label: '🚫 Non converti',              value: 'non_converti'  },
      ],
    },
    {
      name: 'service',
      label: 'Service (page source)',
      type: 'text',
      admin: { description: 'Slug du service si le prospect vient d\'une page service (ex: transporteur-en-tunisie).' },
    },
    {
      name: 'ville',
      label: 'Ville (page source)',
      type: 'text',
      admin: { description: 'Nom de la ville si le prospect vient d\'une page ville.' },
    },
    {
      name: 'source',
      label: 'URL source',
      type: 'text',
      admin: { description: 'Chemin complet de la page depuis laquelle le popup a été ouvert.', readOnly: true },
    },
  ],
}

export default Leads
