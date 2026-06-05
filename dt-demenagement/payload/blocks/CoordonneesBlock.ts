import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const CoordonneesBlock: Block = {
  slug: 'coordonnees',
  labels: { singular: '📇 Coordonnées', plural: 'Coordonnées' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre',
      type: 'text',
      localized: true,
      admin: { description: 'Titre optionnel affiché au-dessus des coordonnées.' },
    },
    {
      name: 'afficherTelephone',
      label: 'Afficher le téléphone',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'afficherEmail',
      label: 'Afficher l\'email',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'afficherAdresse',
      label: 'Afficher l\'adresse',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'afficherHoraires',
      label: 'Afficher les horaires',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Disposition',
      defaultValue: 'horizontal',
      options: [
        { label: 'Vertical',   value: 'vertical'   },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Grille',     value: 'grille'     },
      ],
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
