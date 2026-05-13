import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'slug', 'publie'],
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
      admin: {
        description: 'Identifiant URL (ex: transporteur-en-tunisie)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'contenu',
      type: 'richText',
      localized: true,
      admin: { description: 'Contenu long de la page service' },
    },
    {
      name: 'icone',
      type: 'text',
      required: true,
      admin: { description: 'Nom de l\'icône Lucide (ex: truck, building, crane)' },
    },
    {
      name: 'image',
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
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

export default Services
