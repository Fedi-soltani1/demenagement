import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: '🎬 Section Vidéo', plural: 'Sections Vidéo' },
  fields: [
    {
      name: 'titre',
      label: 'Titre au-dessus de la vidéo (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Découvrez comment nous travaillons. Laisser vide pour afficher uniquement la vidéo.' },
    },
    {
      name: 'urlVideo',
      label: 'URL de la vidéo (YouTube ou Vimeo)',
      type: 'text',
      required: true,
      admin: { description: 'Ex YouTube : https://youtube.com/watch?v=XXXXX ou https://youtu.be/XXXXX — Ex Vimeo : https://vimeo.com/XXXXX' },
    },
    {
      name: 'poster',
      label: 'Image de prévisualisation (miniature)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Photo affichée avant que le visiteur clique pour lire. Si vide, la miniature YouTube est utilisée automatiquement.' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre sous la vidéo (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Reportage France 24 sur DT Déménagement — 2025' },
    },
    {
      name: 'autoplay',
      label: 'Lecture automatique (déconseillée)',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: '⚠️ La lecture automatique est bloquée par la plupart des navigateurs et peut gêner les visiteurs. Laisser décoché.' },
    },
  ],
}
