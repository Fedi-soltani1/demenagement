import type { Block } from 'payload'

export const MiniFeaturesBlock: Block = {
  slug: 'mini-features',
  labels: { singular: '⚡ Section Points forts (bande rapide)', plural: 'Sections Points forts' },
  admin: { description: 'Bande horizontale avec des icônes et des courtes descriptions. Placée généralement juste après le hero pour résumer les 3-4 avantages clés de DT Déménagement.' },
  fields: [
    {
      name: 'items',
      label: 'Points forts à afficher',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: { description: 'Ajouter entre 3 et 6 points forts. Ils s\'affichent en ligne sur desktop. Recommandé : 4 éléments.' },
      fields: [
        {
          name: 'icone',
          label: 'Icône (nom Lucide)',
          type: 'text',
          admin: { description: 'Ex: users (équipe), truck (camion), package (cartons), shield (assurance), star (qualité), zap (rapidité). Voir lucide.dev.' },
        },
        {
          name: 'titre',
          label: 'Titre du point fort',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Équipe professionnelle / Livraison rapide / Assurance incluse' },
        },
        {
          name: 'description',
          label: 'Description courte (1-2 phrases)',
          type: 'textarea',
          required: true,
          localized: true,
          admin: { description: 'Ex: 50 déménageurs expérimentés, formés et assurés, à votre service 6 jours/7.' },
        },
      ],
    },
  ],
}
