import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: '🖼 Image', plural: 'Images' },
  fields: [
    actifField,
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'position',
      type: 'select',
      label: 'Position',
      defaultValue: 'centre',
      options: [
        { label: 'Gauche', value: 'gauche' },
        { label: 'Centre', value: 'centre' },
        { label: 'Droite', value: 'droite' },
      ],
    },
    {
      name: 'taille',
      type: 'select',
      label: 'Taille',
      defaultValue: 'moyenne',
      options: [
        { label: 'Petite',         value: 'petite'  },
        { label: 'Moyenne',        value: 'moyenne' },
        { label: 'Grande',         value: 'grande'  },
        { label: 'Pleine largeur', value: 'pleine'  },
      ],
    },
    {
      name: 'legende',
      label: 'Légende',
      type: 'text',
      localized: true,
    },
    {
      name: 'lien',
      label: 'Lien (image cliquable)',
      type: 'text',
    },
    ...sectionOptionsFields,
  ],
}
