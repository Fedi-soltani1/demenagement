import type { Block } from 'payload'

export const BlogPreviewBlock: Block = {
  slug: 'blog-preview',
  labels: { singular: 'Bloc Aperçu Blog', plural: 'Blocs Aperçu Blog' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'sousTitre',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'blog',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher les 3 articles les plus récents' },
    },
    {
      name: 'nombreArticles',
      type: 'number',
      defaultValue: 3,
      admin: { description: 'Nombre d\'articles à afficher (si sélection automatique)' },
    },
    {
      name: 'ctaTexte',
      type: 'text',
      localized: true,
      admin: { description: 'Texte du bouton "Voir tous les articles"' },
    },
  ],
}
