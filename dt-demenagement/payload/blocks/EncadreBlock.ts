import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const EncadreBlock: Block = {
  slug: 'encadre',
  labels: { singular: '⚠ Encadré / Alerte', plural: 'Encadrés' },
  fields: [
    actifField,
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      defaultValue: 'info',
      options: [
        { label: 'Info (bleu)',        value: 'info'      },
        { label: 'Succès (vert)',      value: 'succes'    },
        { label: 'Attention (orange)', value: 'attention' },
        { label: 'Erreur (rouge)',     value: 'erreur'    },
      ],
    },
    {
      name: 'titre',
      type: 'text',
      label: 'Titre (optionnel)',
      localized: true,
    },
    {
      name: 'contenu',
      type: 'richText',
      label: 'Contenu',
      required: true,
      localized: true,
      admin: { description: 'Texte de l\'encadré. Gras, listes et liens sont supportés.' },
    },
    ...sectionOptionsFields,
  ],
}
