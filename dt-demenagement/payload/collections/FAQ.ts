import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const FAQ: CollectionConfig = {
  slug: 'faq',
  labels: { singular: 'Question FAQ', plural: 'FAQ' },

  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'categorie', 'ordre', 'publie'],
  },

  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'reponse',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'categorie',
      type: 'select',
      required: true,
      options: [
        { label: 'Tarifs & Devis',    value: 'tarifs-devis' },
        { label: 'Déroulement',       value: 'deroulement' },
        { label: 'Services',          value: 'services' },
        { label: 'International',     value: 'international' },
        { label: 'Espace Client',     value: 'espace-client' },
      ],
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

export default FAQ
