import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const FormulaireBlock: Block = {
  slug: 'formulaire',
  labels: { singular: '✉️ Formulaire de contact', plural: 'Formulaires de contact' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre du formulaire',
      type: 'text',
      localized: true,
      admin: { description: 'Ex : Demandez votre devis gratuit' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'texteBouton',
      label: 'Texte du bouton',
      type: 'text',
      localized: true,
      defaultValue: 'Envoyer',
    },
    ...sectionOptionsFields,
  ],
}
