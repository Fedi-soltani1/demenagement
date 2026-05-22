import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const WhyUsBlock: Block = {
  slug: 'why-us',
  labels: { singular: '✅ Section Pourquoi nous choisir', plural: 'Sections Pourquoi nous choisir' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Pourquoi choisir DT Déménagement ?' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: Plus de 15 ans d\'expérience au service de vos déménagements en Tunisie et à l\'international.' },
    },
    {
      name: 'arguments',
      label: 'Arguments (avantages à mettre en avant)',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      admin: { description: 'Ajouter entre 3 et 6 arguments. Chacun aura une icône, un titre et une description.' },
      fields: [
        {
          name: 'icone',
          label: 'Icône (nom Lucide)',
          type: 'text',
          required: true,
          admin: { description: 'Ex: shield (bouclier), clock (horloge), award (trophée), truck (camion), users (équipe), star (étoile). Voir lucide.dev.' },
        },
        {
          name: 'titre',
          label: 'Titre de l\'argument',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Assurance tous risques incluse' },
        },
        {
          name: 'texte',
          label: 'Description (2-3 phrases)',
          type: 'textarea',
          required: true,
          localized: true,
          admin: { description: 'Ex: Tous vos biens sont couverts pendant le transport. En cas de casse, nous prenons en charge les réparations.' },
        },
      ],
    },
  ],
}
