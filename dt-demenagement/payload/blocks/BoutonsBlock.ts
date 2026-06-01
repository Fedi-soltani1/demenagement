import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const BoutonsBlock: Block = {
  slug: 'boutons',
  labels: { singular: '🔘 Boutons / CTAs', plural: 'Blocs Boutons' },
  fields: [
    actifField,
    {
      name: 'boutons',
      label: 'Boutons (1 à 3)',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'texte',
          label: 'Texte',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'lien',
          label: 'Lien',
          type: 'text',
          admin: { description: 'Laisser vide pour bouton téléphone → utilise Settings.telephone1' },
        },
        {
          name: 'style',
          type: 'select',
          label: 'Style',
          defaultValue: 'primaire',
          options: [
            { label: 'Primaire (rouge rempli)',   value: 'primaire'   },
            { label: 'Secondaire (contour)',       value: 'secondaire' },
            { label: 'Téléphone (icône 📞)',       value: 'telephone'  },
          ],
        },
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
