import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const NewsletterBlock: Block = {
  slug: 'newsletter',
  labels: { singular: '📧 Section Newsletter (inscription email)', plural: 'Sections Newsletter' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre du formulaire',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Restez informé de nos offres et conseils déménagement' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: Recevez nos guides pratiques, promotions et actualités directement dans votre boîte mail.' },
    },
    {
      name: 'texteBouton',
      label: 'Texte du bouton d\'inscription',
      type: 'text',
      localized: true,
      defaultValue: 'S\'abonner',
      admin: { description: 'Ex: S\'abonner / Je m\'inscris / Recevoir les offres' },
    },
    {
      name: 'placeholderEmail',
      label: 'Texte indicatif dans le champ email',
      type: 'text',
      localized: true,
      defaultValue: 'Votre adresse email',
      admin: { description: 'Texte grisé affiché dans le champ avant que l\'utilisateur tape. Ex: votre@email.com' },
    },
    {
      name: 'texteRgpd',
      label: 'Mention RGPD / confidentialité (obligatoire)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: En vous inscrivant, vous acceptez de recevoir nos emails. Désinscription possible à tout moment. — Requis légalement pour collecter des emails.' },
    },
  ],
}
