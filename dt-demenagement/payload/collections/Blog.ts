import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Blog: CollectionConfig = {
  slug: 'blog',
  labels: { singular: 'Article', plural: 'Articles' },

  access: {
    read: ({ req: { user } }) => {
      // Articles publiés accessibles à tous, brouillons uniquement aux éditeurs
      if (user && ((user as { role?: string }).role === 'admin' || (user as { role?: string }).role === 'editeur')) {
        return true
      }
      return { statut: { equals: 'publie' } }
    },
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'statut', 'datePublication', 'auteur'],
    preview: (doc) => `${process.env.NEXT_PUBLIC_SITE_URL}/fr/blog/${doc.slug as string}`,
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
      admin: { description: 'Identifiant URL (ex: conseils-demenagement-tunisie)' },
    },
    {
      name: 'extrait',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Résumé affiché dans les listings (max 200 caractères)' },
    },
    {
      name: 'contenu',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'imageAlaUne',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'auteur',
      type: 'text',
      required: true,
      defaultValue: 'Équipe DT Déménagement',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text' },
      ],
    },
    {
      name: 'tempsLecture',
      type: 'number',
      admin: {
        description: 'Temps de lecture estimé en minutes (calculé automatiquement)',
        readOnly: true,
      },
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'brouillon',
      options: [
        { label: 'Brouillon',   value: 'brouillon' },
        { label: 'Publié',      value: 'publie' },
        { label: 'Planifié',    value: 'planifie' },
      ],
    },
    {
      name: 'datePublication',
      type: 'date',
      admin: { description: 'Date de publication (ou de planification)' },
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

export default Blog
