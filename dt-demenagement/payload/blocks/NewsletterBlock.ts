import type { Block } from 'payload'

export const NewsletterBlock: Block = {
  slug: 'newsletter',
  labels: { singular: 'Bloc Newsletter', plural: 'Blocs Newsletter' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'sousTitre',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'texteBouton',
      type: 'text',
      localized: true,
      defaultValue: 'S\'abonner',
    },
    {
      name: 'placeholderEmail',
      type: 'text',
      localized: true,
      defaultValue: 'Votre adresse email',
    },
    {
      name: 'texteRgpd',
      type: 'text',
      localized: true,
      admin: { description: 'Texte de consentement RGPD sous le formulaire' },
    },
  ],
}
