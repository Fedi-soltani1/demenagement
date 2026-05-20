import type { Block } from 'payload'

export const InstagramFeedBlock: Block = {
  slug: 'instagram-feed',
  labels: { singular: '📸 Section Fil Instagram', plural: 'Sections Fil Instagram' },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la section (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Suivez-nous sur Instagram. Laisser vide pour afficher uniquement les photos.' },
    },
    {
      name: 'nombrePosts',
      label: 'Nombre de publications à afficher',
      type: 'number',
      defaultValue: 6,
      admin: { description: 'Entre 3 et 12. Recommandé : 6 (2 rangées de 3 colonnes). Maximum : 12.' },
    },
    {
      name: 'lienProfil',
      label: 'URL du profil Instagram',
      type: 'text',
      admin: { description: 'Ex: https://www.instagram.com/dtdemenagement — Utilisé pour le bouton "Nous suivre sur Instagram".' },
    },
  ],
}
