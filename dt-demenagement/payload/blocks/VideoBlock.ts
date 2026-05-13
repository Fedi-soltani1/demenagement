import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Bloc Vidéo', plural: 'Blocs Vidéo' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'urlVideo',
      type: 'text',
      required: true,
      admin: { description: 'URL YouTube ou Vimeo (ex: https://youtube.com/watch?v=...)' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image affichée avant la lecture de la vidéo' },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sousTitre',
      type: 'text',
      localized: true,
    },
  ],
}
