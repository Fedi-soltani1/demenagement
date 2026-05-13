import type { Block } from 'payload'

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: 'Bloc À propos', plural: 'Blocs À propos' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'texte',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'points',
      type: 'array',
      label: 'Points forts',
      fields: [
        { name: 'icone', type: 'text', admin: { description: 'Nom icône Lucide (ex: check, star)' } },
        { name: 'texte', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'droite',
      options: [
        { label: 'Image à droite', value: 'droite' },
        { label: 'Image à gauche', value: 'gauche' },
      ],
    },
  ],
}
