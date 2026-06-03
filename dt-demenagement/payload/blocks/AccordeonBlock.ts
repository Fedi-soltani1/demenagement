import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const AccordeonBlock: Block = {
  slug: 'accordeon',
  labels: { singular: '📂 Accordéon', plural: 'Blocs Accordéon' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre (optionnel)',
      type: 'text',
      localized: true,
    },
    {
      name: 'premierOuvert',
      label: 'Premier élément ouvert par défaut',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'elements',
      label: 'Éléments',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'actif',
          label: 'Activer cet élément',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Décocher pour masquer sans supprimer.' },
        },
        {
          name: 'titre',
          label: 'Titre',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'contenu',
          label: 'Contenu',
          type: 'richText',
          localized: true,
          required: true,
        },
      ],
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
