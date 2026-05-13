import type { Block } from 'payload'

export const PartnersBlock: Block = {
  slug: 'partners',
  labels: { singular: 'Bloc Partenaires', plural: 'Blocs Partenaires' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'partenaires',
      type: 'relationship',
      relationTo: 'partners',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher tous les partenaires publiés' },
    },
    {
      name: 'affichage',
      type: 'select',
      defaultValue: 'defilement',
      options: [
        { label: 'Défilement automatique (marquee)', value: 'defilement' },
        { label: 'Grille statique',                  value: 'grille' },
      ],
    },
  ],
}
