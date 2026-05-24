import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Blog: CollectionConfig = {
  slug: 'blog',
  labels: { singular: 'Article de blog', plural: 'Articles de blog' },

  access: {
    read: ({ req: { user } }) => {
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
    group: '📝 Contenu du site',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'statut', 'datePublication', 'auteur'],
    description: 'Articles du blog. Mettre "Statut = Publié" pour qu\'un article apparaisse sur le site. Ajouter une image à la une pour chaque article.',
    preview: (doc, { locale }) => {
      const base   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const secret = process.env.PAYLOAD_SECRET ?? ''
      const slug   = (doc.slug as string) ?? ''
      const loc    = (locale as string) ?? 'fr'
      return `${base}/api/draft?secret=${secret}&collection=blog&slug=${slug}&locale=${loc}`
    },
  },

  versions: { drafts: true },

  fields: [
    {
      name: 'titre',
      label: 'Titre de l\'article',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'Identifiant URL (ne pas modifier après publication)',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Ex: conseils-demenagement-tunisie — utilisé dans l\'adresse web de l\'article.' },
    },
    {
      name: 'statut',
      label: 'Statut de publication',
      type: 'select',
      required: true,
      defaultValue: 'brouillon',
      admin: { description: '👆 Mettre sur "Publié" pour que l\'article soit visible sur le site.' },
      options: [
        { label: '✏️ Brouillon — non visible sur le site', value: 'brouillon' },
        { label: '✅ Publié — visible sur le site',         value: 'publie' },
        { label: '📅 Planifié — publication automatique',   value: 'planifie' },
      ],
    },
    {
      name: 'datePublication',
      label: 'Date de publication',
      type: 'date',
      admin: { description: 'Date affichée sur l\'article et utilisée pour le tri.' },
    },
    {
      name: 'imageAlaUne',
      label: 'Image principale de l\'article',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image affichée en haut de l\'article et dans les listes. Format 16:9 recommandé.' },
    },
    {
      name: 'extrait',
      label: 'Résumé court (affiché dans les listes)',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: '2 à 3 phrases max — accroché qui donne envie de lire l\'article. Max 200 caractères.' },
    },
    {
      name: 'contenu',
      label: 'Contenu complet de l\'article',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'auteur',
      label: 'Auteur de l\'article',
      type: 'text',
      required: true,
      defaultValue: 'Équipe DT Déménagement',
    },
    {
      name: 'categories',
      label: 'Catégories (pour classer l\'article)',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { description: 'Choisir une ou plusieurs catégories parmi celles créées dans "Catégories".' },
    },
    {
      name: 'tags',
      label: 'Mots-clés (tags)',
      type: 'array',
      admin: { description: 'Mots-clés supplémentaires pour la recherche et le SEO.' },
      fields: [
        { name: 'tag', label: 'Mot-clé', type: 'text' },
      ],
    },
    {
      name: 'tempsLecture',
      label: 'Temps de lecture estimé (minutes)',
      type: 'number',
      admin: {
        description: 'Affiché sur la carte de l\'article. Ex: 5 = "5 min de lecture".',
        readOnly: true,
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: '🔍 SEO — Référencement Google',
      admin: { description: 'Optionnel — si vide, le titre et l\'extrait sont utilisés automatiquement.' },
      fields: [
        { name: 'metaTitle',       label: 'Titre SEO (max 60 caractères)',        type: 'text',     localized: true },
        { name: 'metaDescription', label: 'Description SEO (max 160 caractères)', type: 'textarea', localized: true },
        { name: 'ogImage',         label: 'Image de partage réseaux sociaux',     type: 'upload',   relationTo: 'media' },
      ],
    },
  ],
}

export default Blog
