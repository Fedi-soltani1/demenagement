import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: '❓ Section FAQ (questions fréquentes)', plural: 'Sections FAQ' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Questions fréquentes sur le déménagement' },
    },
    {
      name: 'questions',
      label: 'Questions à afficher (sélection manuelle)',
      type: 'relationship',
      relationTo: 'faq',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher automatiquement toutes les questions publiées (filtrées par catégorie si une catégorie est choisie ci-dessous).' },
    },
    {
      name: 'categorieFiltre',
      label: 'Filtrer par catégorie (si sélection automatique)',
      type: 'select',
      admin: { description: 'S\'applique uniquement si aucune question n\'est sélectionnée manuellement. Permet d\'afficher uniquement les questions d\'un thème précis.' },
      options: [
        { label: 'Toutes les catégories',      value: '' },
        { label: '💰 Tarifs & Devis',           value: 'tarifs-devis' },
        { label: '📋 Déroulement du déménagement', value: 'deroulement' },
        { label: '🛠️ Nos services',             value: 'services' },
        { label: '✈️ Déménagement international', value: 'international' },
        { label: '👤 Espace Client',             value: 'espace-client' },
      ],
    },
    {
      name: 'nombreMax',
      label: 'Nombre maximum de questions à afficher',
      type: 'number',
      defaultValue: 8,
      admin: { description: 'Ex: 8 questions. Les questions sont triées par ordre de publication.' },
    },
  ],
}
