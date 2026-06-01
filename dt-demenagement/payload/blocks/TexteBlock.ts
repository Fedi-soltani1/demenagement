import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTexteField } from './shared/typographyFields'

export const TexteBlock: Block = {
  slug: 'texte',
  labels: { singular: '📄 Texte / Paragraphe', plural: 'Textes' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Contenu',
      type: 'textarea',
      localized: true,
      required: true,
      admin: { rows: 5 },
    },
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
