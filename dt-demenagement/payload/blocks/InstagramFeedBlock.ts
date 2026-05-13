import type { Block } from 'payload'

export const InstagramFeedBlock: Block = {
  slug: 'instagram-feed',
  labels: { singular: 'Bloc Instagram', plural: 'Blocs Instagram' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'nombrePosts',
      type: 'number',
      defaultValue: 6,
      admin: { description: 'Nombre de posts Instagram à afficher (max 12)' },
    },
    {
      name: 'lienProfil',
      type: 'text',
      admin: { description: 'URL du profil Instagram pour le lien "Nous suivre"' },
    },
  ],
}
