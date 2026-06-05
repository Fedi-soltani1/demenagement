import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const CartesBlock: Block = {
  slug: 'cartes',
  labels: { singular: '🃏 Grille de cartes', plural: 'Grilles de cartes' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre (optionnel)',
      type: 'text',
      localized: true,
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'text',
      localized: true,
    },
    {
      name: 'colonnes',
      label: 'Nombre de colonnes',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 colonnes', value: '2' },
        { label: '3 colonnes', value: '3' },
        { label: '4 colonnes', value: '4' },
      ],
    },
    {
      name: 'cartes',
      label: 'Cartes',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'image',
          label: 'Image (optionnel)',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'icone',
          label: 'Icône (optionnel)',
          type: 'text',
          admin: { description: 'Icône Lucide ex: truck' },
        },
        {
          name: 'titre',
          label: 'Titre',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'texte',
          label: 'Texte',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'lien',
          label: 'Lien',
          type: 'text',
        },
        {
          name: 'texteLien',
          label: 'Texte du lien',
          type: 'text',
          localized: true,
        },
      ],
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
