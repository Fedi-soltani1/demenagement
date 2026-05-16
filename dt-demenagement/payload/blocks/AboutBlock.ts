import type { Block } from 'payload'

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: 'Bloc À propos + Stats', plural: 'Blocs À propos + Stats' },
  fields: [
    {
      name: 'badge',
      type: 'text',
      localized: true,
      admin: { description: 'Petite accroche au-dessus du titre (ex: Notre histoire)' },
    },
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'texte',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: "Paragraphe de présentation de l'entreprise" },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Photo équipe ou camion (ratio 4:3 recommandé)' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: { description: 'URL embed YouTube (ex: https://www.youtube.com/embed/XXXXX) — optionnel' },
    },
    {
      name: 'ctaTexte',
      type: 'text',
      localized: true,
      admin: { description: 'Texte du bouton "En savoir plus"' },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistiques (4 max)',
      maxRows: 4,
      admin: { description: 'Laisser vide → valeurs par défaut de la traduction' },
      fields: [
        {
          name: 'valeur',
          type: 'number',
          required: true,
          admin: { description: 'Valeur numérique (ex: 5000)' },
        },
        {
          name: 'suffixe',
          type: 'text',
          admin: { description: 'Suffixe après le chiffre (ex: +, %, ans)' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Description (ex: Déménagements réalisés)' },
        },
      ],
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'gauche',
      options: [
        { label: 'Image à gauche', value: 'gauche' },
        { label: 'Image à droite', value: 'droite' },
      ],
    },
  ],
}
