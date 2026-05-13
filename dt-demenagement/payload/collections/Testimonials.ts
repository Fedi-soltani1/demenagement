import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Témoignage', plural: 'Témoignages' },

  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'ville', 'note', 'publie'],
  },

  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
    },
    {
      name: 'ville',
      type: 'text',
      required: true,
    },
    {
      name: 'note',
      type: 'select',
      required: true,
      options: [
        { label: '⭐ 1',     value: '1' },
        { label: '⭐⭐ 2',   value: '2' },
        { label: '⭐⭐⭐ 3', value: '3' },
        { label: '⭐⭐⭐⭐ 4', value: '4' },
        { label: '⭐⭐⭐⭐⭐ 5', value: '5' },
      ],
    },
    {
      name: 'texte',
      type: 'textarea',
      required: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ordre',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export default Testimonials
