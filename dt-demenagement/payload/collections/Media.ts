import type { CollectionConfig } from 'payload'
import { isAdminOrSeo } from '../access/isEditor'

const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },

  access: {
    read: () => true,
    create: isAdminOrSeo,
    update: isAdminOrSeo,
    delete: isAdminOrSeo,
  },

  admin: {
    group: '🖼️ Médias',
    description: 'Toutes les images et fichiers du site. Toujours remplir le champ "Alt" pour le SEO.',
  },

  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 200, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      admin: { description: 'Texte alternatif pour l\'accessibilité (SEO)' },
    },
    {
      name: 'cloudinaryPublicId',
      type: 'text',
      admin: {
        description: 'ID Cloudinary — rempli automatiquement lors de l\'upload',
        readOnly: true,
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
  ],
}

export default Media
