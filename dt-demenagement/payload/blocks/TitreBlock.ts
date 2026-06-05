import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const TitreBlock: Block = {
  slug: 'titre',
  labels: { singular: '📝 Titre (H1–H4)', plural: 'Titres' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Texte du titre',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Utiliser Options de section → Niveau titre pour choisir H1/H2/H3.' },
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
