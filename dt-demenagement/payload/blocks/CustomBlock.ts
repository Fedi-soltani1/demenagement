import type { Block } from 'payload'

export const CustomBlock: Block = {
  slug: 'custom',
  labels: { singular: 'Bloc Libre', plural: 'Blocs Libres' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'sousTitre',
      type: 'text',
      localized: true,
    },
    {
      name: 'contenu',
      type: 'richText',
      localized: true,
    },
    {
      name: 'imagePrincipale',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'galerie',
      type: 'array',
      label: 'Galerie d\'images',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Bouton d\'action',
      fields: [
        { name: 'texte', type: 'text', localized: true },
        { name: 'lien',  type: 'text' },
      ],
    },
    {
      name: 'couleurFond',
      type: 'select',
      defaultValue: 'noir',
      options: [
        { label: 'Noir (#0a0a0a)',  value: 'noir' },
        { label: 'Foncé (#111111)', value: 'fonce' },
        { label: 'Rouge (#b52027)', value: 'rouge' },
        { label: 'Blanc (#f8f5f0)', value: 'blanc' },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'centre',
      options: [
        { label: 'Centré',         value: 'centre' },
        { label: 'Image à gauche', value: 'gauche' },
        { label: 'Image à droite', value: 'droite' },
        { label: 'Pleine largeur', value: 'pleine-largeur' },
      ],
    },
    {
      name: 'espacement',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Normal',  value: 'normal' },
        { label: 'Large',   value: 'large' },
        { label: 'Compact', value: 'compact' },
      ],
    },
  ],
}
