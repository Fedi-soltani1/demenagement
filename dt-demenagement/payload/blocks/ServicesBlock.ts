import type { Block } from 'payload'

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Bloc Services', plural: 'Blocs Services' },
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
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { description: 'Sélectionner les services à afficher (ordre respecté)' },
    },
    {
      name: 'ctaTexte',
      type: 'text',
      localized: true,
      admin: { description: 'Texte du bouton "Voir tous les services"' },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grille',
      options: [
        { label: 'Grille 3 colonnes', value: 'grille' },
        { label: 'Liste horizontale',  value: 'liste' },
        { label: 'Carrousel',          value: 'carrousel' },
      ],
    },
  ],
}
