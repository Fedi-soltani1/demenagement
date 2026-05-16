import type { Block } from 'payload'

export const MiniFeaturesBlock: Block = {
  slug: 'mini-features',
  labels: { singular: 'Bloc Points forts', plural: 'Blocs Points forts' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Points forts',
      minRows: 1,
      maxRows: 6,
      admin: { description: 'Icônes + titres affichés en bande horizontale sous le hero' },
      fields: [
        {
          name: 'icone',
          type: 'text',
          admin: { description: 'Nom icône Lucide (ex: users, truck, package, shield, star, zap)' },
        },
        {
          name: 'titre',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
        },
      ],
    },
  ],
}
