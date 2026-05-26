import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField, typographieTexteField } from './shared/typographyFields'

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: '❓ Section FAQ', plural: 'Sections FAQ' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Questions fréquentes sur le déménagement' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Tout ce que vous devez savoir avant votre déménagement.' },
    },
    {
      name: 'questions',
      label: 'Questions & Réponses',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Glisser-déposer pour réordonner. Décocher "Activer" pour masquer une question sans la supprimer.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'actif',
          label: 'Activer cette question',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Décocher pour masquer sans supprimer.',
          },
        },
        {
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Combien coûte un déménagement ?' },
        },
        {
          name: 'reponse',
          label: 'Réponse',
          type: 'richText',
          required: true,
          localized: true,
          admin: { description: 'Réponse complète. Gras, listes et liens sont supportés.' },
        },
      ],
    },
    typographieTitreField,
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
