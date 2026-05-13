import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Bloc Témoignages', plural: 'Blocs Témoignages' },
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
      name: 'temoignages',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher tous les témoignages publiés' },
    },
    {
      name: 'affichage',
      type: 'select',
      defaultValue: 'carrousel',
      options: [
        { label: 'Carrousel',     value: 'carrousel' },
        { label: 'Grille',        value: 'grille' },
        { label: 'Liste',         value: 'liste' },
      ],
    },
    {
      name: 'nombreMax',
      type: 'number',
      defaultValue: 6,
      admin: { description: 'Nombre maximum de témoignages à afficher' },
    },
  ],
}
