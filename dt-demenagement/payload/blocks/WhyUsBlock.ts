import type { Block } from 'payload'

export const WhyUsBlock: Block = {
  slug: 'why-us',
  labels: { singular: 'Bloc Pourquoi nous', plural: 'Blocs Pourquoi nous' },
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
      name: 'arguments',
      type: 'array',
      label: 'Arguments',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'icone',
          type: 'text',
          required: true,
          admin: { description: 'Nom icône Lucide (ex: shield, clock, award)' },
        },
        {
          name: 'titre',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'texte',
          type: 'textarea',
          required: true,
          localized: true,
        },
      ],
    },
  ],
}
