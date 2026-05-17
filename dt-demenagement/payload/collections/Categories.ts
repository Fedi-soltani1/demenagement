import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Catégorie blog', plural: 'Catégories blog' },

  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    group: '📝 Contenu du site',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'slug'],
    description: 'Catégories pour classer les articles du blog. Exemples : Conseils déménagement, International, Entreprises.',
  },

  fields: [
    {
      name: 'nom',
      label: 'Nom de la catégorie (affiché sur le site)',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'Identifiant URL (unique, sans espaces ni accents)',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Ex: conseils-demenagement, international, entreprises — ne pas modifier après création.' },
    },
    {
      name: 'description',
      label: 'Description de la catégorie (optionnelle)',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'couleur',
      label: 'Couleur d\'affichage (optionnelle)',
      type: 'text',
      admin: { description: 'Code couleur hex (ex: #b52027). Laissez vide pour la couleur rouge par défaut.' },
    },
  ],
}

export default Categories
