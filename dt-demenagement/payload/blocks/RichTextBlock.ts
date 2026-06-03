import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTexteField } from './shared/typographyFields'

export const RichTextBlock: Block = {
  slug: 'richtext',
  labels: { singular: '📄 Texte riche', plural: 'Textes riches' },
  fields: [
    actifField,
    {
      name: 'contenu',
      label: 'Contenu',
      type: 'richText',
      localized: true,
      required: true,
      admin: { description: 'Texte enrichi : gras, italique, listes, liens, titres.' },
    },
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
