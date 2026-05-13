import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Bloc FAQ', plural: 'Blocs FAQ' },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'questions',
      type: 'relationship',
      relationTo: 'faq',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher toutes les questions publiées' },
    },
    {
      name: 'categorieFiltre',
      type: 'select',
      admin: { description: 'Filtrer par catégorie (si aucune question sélectionnée manuellement)' },
      options: [
        { label: 'Toutes',           value: '' },
        { label: 'Tarifs & Devis',   value: 'tarifs-devis' },
        { label: 'Déroulement',      value: 'deroulement' },
        { label: 'Services',         value: 'services' },
        { label: 'International',    value: 'international' },
        { label: 'Espace Client',    value: 'espace-client' },
      ],
    },
    {
      name: 'nombreMax',
      type: 'number',
      defaultValue: 8,
    },
  ],
}
