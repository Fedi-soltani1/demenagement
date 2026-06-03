import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const EspaceurBlock: Block = {
  slug: 'espaceur',
  labels: { singular: '↕ Espaceur', plural: 'Espaceurs' },
  fields: [
    actifField,
    {
      name: 'hauteur',
      type: 'select',
      label: 'Hauteur',
      defaultValue: 'moyen',
      options: [
        { label: 'Petit (32px)',  value: 'petit' },
        { label: 'Moyen (64px)',  value: 'moyen' },
        { label: 'Grand (96px)',  value: 'grand' },
        { label: 'Géant (160px)', value: 'geant' },
      ],
    },
  ],
}
