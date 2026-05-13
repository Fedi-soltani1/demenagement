import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'slug', 'publie'],
    preview: (doc) => `${process.env.NEXT_PUBLIC_SITE_URL}/fr/${doc.slug as string}`,
  },

  versions: {
    drafts: true,
  },

  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Identifiant URL (ex: accueil, a-propos, contact)' },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Blocs de contenu',
      blocks: [],
      // Les blocs seront ajoutés en Phase 4 — Étape 18
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
        {
          name: 'robots',
          type: 'group',
          fields: [
            { name: 'index', type: 'checkbox', defaultValue: true },
            { name: 'follow', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
  ],
}

export default Pages
