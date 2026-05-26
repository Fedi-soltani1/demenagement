import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField, typographieTexteField } from './shared/typographyFields'

export const ProcessBlock: Block = {
  slug: 'process',
  labels: { singular: '📋 Section Processus (étapes numérotées)', plural: 'Sections Processus' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Comment ça marche ?' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Un déménagement serein en 4 étapes simples.' },
    },
    {
      name: 'etapes',
      label: 'Étapes du processus',
      type: 'array',
      minRows: 2,
      maxRows: 8,
      admin: { description: 'Ajouter les étapes dans l\'ordre. Chaque étape est numérotée automatiquement.' },
      fields: [
        {
          name: 'titre',
          label: 'Titre de l\'étape',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Prise de contact et devis' },
        },
        {
          name: 'description',
          label: 'Description (optionnelle)',
          type: 'textarea',
          localized: true,
          admin: { description: 'Ex: Appelez-nous ou remplissez le formulaire en ligne. Nous vous répondons sous 24h.' },
        },
        {
          name: 'icone',
          label: 'Icône Lucide (optionnelle)',
          type: 'text',
          admin: { description: 'Ex: phone, clipboard, truck, home, package, wrench. Voir lucide.dev.' },
        },
      ],
    },
    {
      name: 'layout',
      label: 'Disposition des étapes',
      type: 'select',
      defaultValue: 'horizontal',
      admin: { description: 'Choisir comment les étapes sont affichées visuellement.' },
      options: [
        { label: 'Horizontal — étapes en ligne avec flèches (recommandé)', value: 'horizontal' },
        { label: 'Vertical — étapes empilées avec trait latéral',           value: 'vertical'   },
        { label: 'Cartes — grille de cartes numérotées',                    value: 'cartes'     },
      ],
    },
    typographieTitreField,
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
