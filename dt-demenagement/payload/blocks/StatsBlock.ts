import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Bloc Statistiques', plural: 'Blocs Statistiques' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistiques',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'valeur',
          type: 'number',
          required: true,
          admin: { description: 'Valeur numérique (ex: 5000)' },
        },
        {
          name: 'suffixe',
          type: 'text',
          admin: { description: 'Suffixe affiché après le chiffre (ex: +, %, ans)' },
        },
        {
          name: 'libelle',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Description (ex: Déménagements réalisés)' },
        },
        {
          name: 'icone',
          type: 'text',
          admin: { description: 'Nom icône Lucide (optionnel)' },
        },
      ],
    },
    {
      name: 'animation',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Animer le comptage des chiffres au scroll' },
    },
  ],
}
