import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const SeparateurBlock: Block = {
  slug: 'separateur',
  labels: { singular: '— Séparateur', plural: 'Séparateurs' },
  fields: [
    actifField,
    {
      name: 'style',
      type: 'select',
      label: 'Style',
      defaultValue: 'ligne',
      options: [
        { label: 'Ligne',      value: 'ligne'     },
        { label: 'Pointillés', value: 'pointille' },
        { label: 'Dégradé',    value: 'degrade'   },
      ],
    },
    {
      name: 'largeur',
      type: 'select',
      label: 'Largeur',
      defaultValue: 'pleine',
      options: [
        { label: 'Courte',  value: 'courte'  },
        { label: 'Moyenne', value: 'moyenne' },
        { label: 'Pleine',  value: 'pleine'  },
      ],
    },
    ...sectionOptionsFields,
  ],
}
