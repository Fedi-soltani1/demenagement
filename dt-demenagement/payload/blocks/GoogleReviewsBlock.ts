import type { Block } from 'payload'

export const GoogleReviewsBlock: Block = {
  slug: 'google-reviews',
  labels: { singular: 'Bloc Avis Google', plural: 'Blocs Avis Google' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'afficherNoteGlobale',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Afficher la note moyenne et le nombre total d\'avis' },
    },
    {
      name: 'nombreAvis',
      type: 'number',
      defaultValue: 6,
      admin: { description: 'Nombre d\'avis à afficher (les plus récents)' },
    },
    {
      name: 'noteMinimum',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: 'Tous les avis',     value: '1' },
        { label: '3 étoiles et plus', value: '3' },
        { label: '4 étoiles et plus', value: '4' },
        { label: '5 étoiles uniquement', value: '5' },
      ],
    },
  ],
}
