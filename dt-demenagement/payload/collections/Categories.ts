import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Catégorie', plural: 'Catégories' },

  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'slug'],
  },

  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Identifiant URL (ex: conseils-demenagement)' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'couleur',
      type: 'text',
      admin: { description: 'Couleur hex optionnelle pour l\'affichage (ex: #b52027)' },
    },
  ],
}

export default Categories
