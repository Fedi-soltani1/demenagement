import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'map',
  labels: { singular: 'Bloc Carte', plural: 'Blocs Carte' },
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
      name: 'mode',
      type: 'select',
      defaultValue: 'tunisie',
      options: [
        { label: 'Tunisie (villes)',      value: 'tunisie' },
        { label: 'Europe (pays)',         value: 'europe' },
        { label: 'Tunisie + Europe',      value: 'complet' },
      ],
    },
    {
      name: 'villes',
      type: 'relationship',
      relationTo: 'villes',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher toutes les villes publiées' },
    },
    {
      name: 'pays',
      type: 'relationship',
      relationTo: 'pays',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher tous les pays publiés' },
    },
  ],
}
