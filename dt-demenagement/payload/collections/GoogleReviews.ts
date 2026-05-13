import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const GoogleReviews: CollectionConfig = {
  slug: 'google-reviews',
  labels: { singular: 'Avis Google', plural: 'Avis Google' },

  access: {
    // Lecture publique — affichage sur le site
    read: () => true,
    // Création/modification uniquement par le cron job (admin)
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'nomAuteur',
    defaultColumns: ['nomAuteur', 'note', 'dateOriginal', 'syncedAt'],
    description: 'Avis synchronisés automatiquement depuis Google Places — ne pas modifier manuellement',
  },

  fields: [
    {
      name: 'nomAuteur',
      type: 'text',
      required: true,
    },
    {
      name: 'photoUrl',
      type: 'text',
      admin: { description: 'URL photo Google (externe)' },
    },
    {
      name: 'note',
      type: 'select',
      required: true,
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
      ],
    },
    {
      name: 'texte',
      type: 'textarea',
    },
    {
      name: 'dateOriginal',
      type: 'date',
      required: true,
    },
    {
      name: 'syncedAt',
      type: 'date',
      required: true,
      admin: { description: 'Date de la dernière synchronisation depuis Google' },
    },
    {
      name: 'googleReviewId',
      type: 'text',
      unique: true,
      admin: { description: 'ID unique Google pour éviter les doublons' },
    },
  ],
}

export default GoogleReviews
