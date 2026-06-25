import type { CollectionConfig } from 'payload'
import { isSeo } from '../access/isEditor'

const FAQ: CollectionConfig = {
  slug: 'faq',
  labels: { singular: 'Question FAQ', plural: 'Questions FAQ' },

  access: {
    read: () => true,
    create: isSeo,
    update: isSeo,
    delete: isSeo,
  },

  admin: {
    // Contenu → visible UNIQUEMENT pour le SEO (caché du super-admin).
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'seo',
    group: '📝 Contenu du site',
    useAsTitle: 'question',
    defaultColumns: ['question', 'categorie', 'ordre', 'publie'],
    description: 'Questions fréquentes affichées sur la page FAQ. Cocher "Visible sur le site" pour afficher une question.',
  },

  fields: [
    {
      name: 'question',
      label: 'La question (telle qu\'elle apparaît sur le site)',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'reponse',
      label: 'La réponse complète',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'categorie',
      label: 'Catégorie de la question',
      type: 'select',
      required: true,
      admin: { description: 'Permet de regrouper les questions par thème sur la page FAQ.' },
      options: [
        { label: 'Tarifs & Devis', value: 'tarifs-devis' },
        { label: 'Déroulement',   value: 'deroulement' },
        { label: 'Nos services',  value: 'services' },
        { label: 'International', value: 'international' },
        { label: 'Espace Client', value: 'espace-client' },
      ],
    },
    {
      name: 'ordre',
      label: 'Ordre d\'affichage (1 = affiché en premier)',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Les questions sont triées du plus petit au plus grand numéro.' },
    },
    {
      name: 'publie',
      label: 'Visible sur le site',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour masquer cette question sans la supprimer.' },
    },
  ],
}

export default FAQ
