import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Bloc CTA', plural: 'Blocs CTA' },
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
      name: 'boutonPrimaire',
      type: 'group',
      label: 'Bouton principal',
      fields: [
        { name: 'texte', type: 'text', required: true, localized: true },
        { name: 'lien',  type: 'text', required: true },
      ],
    },
    {
      name: 'boutonSecondaire',
      type: 'group',
      label: 'Bouton secondaire (optionnel)',
      fields: [
        { name: 'texte', type: 'text', localized: true },
        { name: 'lien',  type: 'text' },
      ],
    },
    {
      name: 'couleurFond',
      type: 'select',
      defaultValue: 'rouge',
      options: [
        { label: 'Rouge (#b52027)',   value: 'rouge' },
        { label: 'Noir (#0a0a0a)',    value: 'noir' },
        { label: 'Foncé (#111111)',   value: 'fonce' },
      ],
    },
    {
      name: 'imageBackground',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image en arrière-plan (optionnel — semi-transparente)' },
    },
  ],
}
