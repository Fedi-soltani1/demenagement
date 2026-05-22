import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const Newsletter: CollectionConfig = {
  slug: 'newsletter',
  labels: { singular: 'Abonné newsletter', plural: 'Abonnés newsletter' },

  access: {
    read: isAdmin,
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '📧 Marketing',
    useAsTitle: 'email',
    defaultColumns: ['email', 'statut', 'createdAt'],
    description: 'Liste des emails inscrits à la newsletter. Statut "Confirmé" = email vérifié, prêt pour les campagnes.',
  },

  fields: [
    {
      name: 'email',
      label: 'Adresse email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'statut',
      label: 'Statut de l\'inscription',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '⏳ En attente — email de confirmation pas encore cliqué', value: 'pending' },
        { label: '✅ Confirmé — actif, peut recevoir des emails',            value: 'confirmed' },
        { label: '🚫 Désabonné — ne plus envoyer',                          value: 'unsubscribed' },
      ],
    },
    {
      name: 'source',
      label: 'Page d\'inscription',
      type: 'text',
      admin: { description: 'URL de la page où le visiteur s\'est inscrit (rempli automatiquement).', readOnly: true },
    },
    {
      name: 'confirmedAt',
      label: 'Date de confirmation',
      type: 'date',
      admin: { readOnly: true, description: 'Date à laquelle le lien de confirmation a été cliqué.' },
    },
    {
      name: 'token',
      label: 'Token de confirmation',
      type: 'text',
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'tokenExpiry',
      label: 'Expiration du token',
      type: 'date',
      admin: { readOnly: true, hidden: true },
    },
  ],
}

export default Newsletter
