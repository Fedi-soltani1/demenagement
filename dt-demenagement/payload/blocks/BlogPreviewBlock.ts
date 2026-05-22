import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const BlogPreviewBlock: Block = {
  slug: 'blog-preview',
  labels: { singular: '📰 Section Aperçu Blog (derniers articles)', plural: 'Sections Aperçu Blog' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Conseils et actualités déménagement' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: Retrouvez nos guides pratiques pour préparer votre déménagement sereinement.' },
    },
    {
      name: 'articles',
      label: 'Articles à afficher (sélection manuelle)',
      type: 'relationship',
      relationTo: 'blog',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher automatiquement les articles les plus récents. Sinon, sélectionner les articles dans l\'ordre souhaité.' },
    },
    {
      name: 'nombreArticles',
      label: 'Nombre d\'articles à afficher (si automatique)',
      type: 'number',
      defaultValue: 3,
      admin: { description: 'S\'applique uniquement si aucun article n\'est sélectionné manuellement. Recommandé : 3.' },
    },
    {
      name: 'ctaTexte',
      label: 'Texte du bouton "Voir tous les articles" (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Voir tous nos articles. Laisser vide pour masquer le bouton.' },
    },
  ],
}
