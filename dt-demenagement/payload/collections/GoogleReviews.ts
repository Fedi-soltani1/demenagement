import type { CollectionConfig } from 'payload'
import { isSeo } from '../access/isEditor'

const GoogleReviews: CollectionConfig = {
  slug: 'google-reviews',
  labels: { singular: 'Avis Google', plural: 'Avis Google' },

  access: {
    read: () => true,
    create: isSeo,
    update: isSeo,
    delete: isSeo,
  },

  admin: {
    // Contenu → visible UNIQUEMENT pour le SEO (caché du super-admin).
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'seo',
    group: '⭐ Avis & Réputation',
    useAsTitle: 'nomAuteur',
    defaultColumns: ['nomAuteur', 'note', 'dateOriginal'],
    description: '⚠️ Ces avis sont synchronisés automatiquement depuis Google — ne pas modifier manuellement. Ils se mettent à jour via un script automatique.',
  },

  fields: [
    {
      name: 'nomAuteur',
      label: 'Nom de l\'auteur (Google)',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'note',
      label: 'Note Google (sur 5)',
      type: 'select',
      required: true,
      admin: { readOnly: true },
      options: [
        { label: '1 étoile',  value: '1' },
        { label: '2 étoiles', value: '2' },
        { label: '3 étoiles', value: '3' },
        { label: '4 étoiles', value: '4' },
        { label: '5 étoiles', value: '5' },
      ],
    },
    {
      name: 'texte',
      label: 'Texte de l\'avis',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'dateOriginal',
      label: 'Date de l\'avis (sur Google)',
      type: 'date',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'photoUrl',
      label: 'Photo profil Google',
      type: 'text',
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'syncedAt',
      label: 'Dernière synchronisation',
      type: 'date',
      required: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'googleReviewId',
      label: 'ID Google (technique)',
      type: 'text',
      unique: true,
      admin: { readOnly: true, hidden: true },
    },
  ],
}

export default GoogleReviews
