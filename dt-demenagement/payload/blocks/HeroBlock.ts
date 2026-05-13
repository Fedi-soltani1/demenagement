import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Bloc Hero', plural: 'Blocs Hero' },
  fields: [
    {
      name: 'badge',
      type: 'text',
      localized: true,
      admin: { description: 'Petite accroche au-dessus du titre (ex: N°1 en Tunisie)' },
    },
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
      name: 'ctaPrimaire',
      type: 'group',
      label: 'Bouton principal',
      fields: [
        { name: 'texte', type: 'text', localized: true, required: true },
        { name: 'lien',  type: 'text', required: true },
      ],
    },
    {
      name: 'ctaSecondaire',
      type: 'group',
      label: 'Bouton secondaire',
      fields: [
        { name: 'texte', type: 'text', localized: true },
        { name: 'lien',  type: 'text' },
      ],
    },
    {
      name: 'imageHero',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image de fond du hero (ou fallback si scène 3D désactivée)' },
    },
    {
      name: 'afficher3D',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Afficher la scène 3D TruckScene (désactivée sur mobile automatiquement)' },
    },
  ],
}
