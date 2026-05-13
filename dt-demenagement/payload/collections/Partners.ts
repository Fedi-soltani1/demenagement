import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partenaire', plural: 'Partenaires' },

  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'ordre', 'publie'],
  },

  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'lien',
      type: 'text',
      admin: { description: 'URL du site web du partenaire (optionnel)' },
    },
    {
      name: 'ordre',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Ordre d\'affichage (du plus petit au plus grand)' },
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export default Partners
