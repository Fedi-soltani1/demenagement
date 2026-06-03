import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField, typographieTexteField } from './shared/typographyFields'

export const ListeBlock: Block = {
  slug: 'liste',
  labels: { singular: '✓ Liste', plural: 'Listes' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'style',
      type: 'select',
      label: 'Style',
      defaultValue: 'check',
      options: [
        { label: 'Puces •',   value: 'puces'  },
        { label: 'Coches ✓',  value: 'check'  },
        { label: 'Flèches →', value: 'fleche' },
      ],
    },
    {
      name: 'items',
      label: 'Éléments',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'texte',
          label: 'Texte',
          type: 'text',
          localized: true,
          required: true,
        },
      ],
    },
    typographieTitreField,
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
