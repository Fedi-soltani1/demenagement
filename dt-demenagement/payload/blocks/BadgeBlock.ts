import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const BadgeBlock: Block = {
  slug: 'badge',
  labels: { singular: '🏷 Badge / Label', plural: 'Badges' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Texte du badge',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Ex: ✦ Service n°1 en Tunisie' },
    },
    {
      name: 'couleur',
      type: 'select',
      label: 'Couleur',
      defaultValue: 'rouge',
      options: [
        { label: 'Rouge', value: 'rouge' },
        { label: 'Or',    value: 'or'    },
        { label: 'Blanc', value: 'blanc' },
      ],
    },
    {
      name: 'alignement',
      type: 'select',
      label: 'Alignement',
      defaultValue: 'centre',
      options: [
        { label: 'Gauche', value: 'gauche' },
        { label: 'Centre', value: 'centre' },
        { label: 'Droite', value: 'droite' },
      ],
    },
    ...sectionOptionsFields,
  ],
}
