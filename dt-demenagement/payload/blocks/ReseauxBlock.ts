import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const ReseauxBlock: Block = {
  slug: 'reseaux',
  labels: { singular: '🌐 Réseaux sociaux', plural: 'Réseaux sociaux' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre',
      type: 'text',
      localized: true,
      admin: { description: 'Titre optionnel affiché au-dessus des icônes.' },
    },
    {
      name: 'taille',
      type: 'select',
      label: 'Taille des icônes',
      defaultValue: 'moyen',
      options: [
        { label: 'Petit', value: 'petit' },
        { label: 'Moyen', value: 'moyen' },
        { label: 'Grand', value: 'grand' },
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
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
