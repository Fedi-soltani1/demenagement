import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: '💬 Section Témoignages clients', plural: 'Sections Témoignages clients' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Ce que disent nos clients' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: Plus de 5 000 familles nous ont fait confiance pour leur déménagement.' },
    },
    {
      name: 'temoignages',
      label: 'Témoignages à afficher (sélection manuelle)',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher automatiquement les derniers témoignages publiés. Sinon, sélectionner les témoignages souhaités dans l\'ordre d\'affichage.' },
    },
    {
      name: 'affichage',
      label: 'Mode d\'affichage',
      type: 'select',
      defaultValue: 'carrousel',
      admin: { description: 'Choisir comment les témoignages sont présentés.' },
      options: [
        { label: 'Carrousel — défilement automatique (recommandé)', value: 'carrousel' },
        { label: 'Grille — toutes les cartes visibles',             value: 'grille' },
        { label: 'Liste — une par ligne',                           value: 'liste' },
      ],
    },
    {
      name: 'nombreMax',
      label: 'Nombre maximum de témoignages à afficher',
      type: 'number',
      defaultValue: 6,
      admin: { description: 'S\'applique uniquement si aucune sélection manuelle n\'est faite. Ex: 6' },
    },
  ],
}
