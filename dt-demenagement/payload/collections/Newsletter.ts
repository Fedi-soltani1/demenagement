import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const Newsletter: CollectionConfig = {
  slug: 'newsletter',
  labels: { singular: 'Abonné Newsletter', plural: 'Abonnés Newsletter' },

  access: {
    // Données privées — admin uniquement
    read: isAdmin,
    create: () => true, // L'API publique peut créer des abonnés
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'statut', 'source', 'createdAt'],
    description: 'Abonnés à la newsletter — double opt-in requis',
  },

  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'En attente de confirmation', value: 'pending' },
        { label: 'Confirmé',                   value: 'confirmed' },
        { label: 'Désabonné',                  value: 'unsubscribed' },
      ],
    },
    {
      name: 'source',
      type: 'text',
      admin: { description: 'URL de la page d\'inscription' },
    },
    {
      name: 'token',
      type: 'text',
      admin: {
        description: 'Token de confirmation (effacé après confirmation)',
        readOnly: true,
      },
    },
    {
      name: 'tokenExpiry',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
}

export default Newsletter
