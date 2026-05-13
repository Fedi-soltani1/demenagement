import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Bloc Galerie', plural: 'Blocs Galerie' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'legende',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'colonnes',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 colonnes', value: '2' },
        { label: '3 colonnes', value: '3' },
        { label: '4 colonnes', value: '4' },
        { label: 'Masonry',    value: 'masonry' },
      ],
    },
    {
      name: 'lightbox',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Activer le zoom au clic (lightbox)' },
    },
  ],
}
