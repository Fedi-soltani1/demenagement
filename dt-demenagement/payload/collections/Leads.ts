import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },

  access: {
    read:   isAdmin,
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🚚 Opérations',
    useAsTitle: 'nomPrenom',
    defaultColumns: ['nomPrenom', 'telephone', 'email', 'service', 'statut', 'createdAt'],
    listSearchableFields: ['nomPrenom', 'telephone', 'email'],
    description: 'Prospects ayant rempli le popup "Devis Gratuit" sans terminer le process. Ils disparaissent d\'ici dès qu\'ils convertissent (devis complet ou RDV).',
    baseListFilter: () => ({ statut: { equals: 'nouveau' } }),
  },

  fields: [
    // ── Identité & Contact ────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'nomPrenom',
          label: 'Nom complet',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'telephone',
          label: 'Téléphone',
          type: 'text',
          required: true,
          admin: { width: '50%', placeholder: '+216 XX XXX XXX' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          admin: { width: '50%' },
        },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'nouveau',
          admin: { width: '50%' },
          options: [
            { label: '🆕 Nouveau',             value: 'nouveau'      },
            { label: '📋 Devis complet soumis', value: 'devis_soumis' },
            { label: '📅 RDV planifié',         value: 'rdv_planifie' },
            { label: '🚫 Non converti',         value: 'non_converti' },
          ],
        },
      ],
    },

    // ── Source ────────────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'service',
          label: 'Service (page source)',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Slug du service — ex: transporteur-en-tunisie',
          },
        },
        {
          name: 'ville',
          label: 'Ville (page source)',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Nom de la ville si venu d\'une page ville.',
          },
        },
      ],
    },
    {
      name: 'source',
      label: 'URL source',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Chemin de la page depuis laquelle le popup a été ouvert.',
      },
    },
  ],
}

export default Leads
