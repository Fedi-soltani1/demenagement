import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Pays: CollectionConfig = {
  slug: 'pays',
  labels: { singular: 'Pays', plural: 'Pays' },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'drapeau', 'publie'],
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
      admin: { description: 'Identifiant URL (ex: france, allemagne)' },
    },
    {
      name: 'drapeau',
      type: 'text',
      required: true,
      admin: { description: 'Emoji drapeau (ex: 🇫🇷)' },
    },
    {
      name: 'coordonnees',
      type: 'group',
      label: 'Coordonnées GPS',
      fields: [
        { name: 'lat', type: 'number', required: true },
        { name: 'lng', type: 'number', required: true },
      ],
    },
    {
      name: 'textesSeo',
      type: 'richText',
      localized: true,
      admin: { description: 'Texte SEO unique pour ce pays' },
    },
    {
      name: 'imageHero',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'informationsPratiques',
      type: 'richText',
      localized: true,
      admin: { description: 'Infos pratiques pour le déménagement international vers ce pays' },
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

export default Pays
