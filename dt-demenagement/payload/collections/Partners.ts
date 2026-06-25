import type { CollectionConfig } from 'payload'
import { isSeo } from '../access/isEditor'

const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partenaire', plural: 'Partenaires' },

  access: {
    read: () => true,
    create: isSeo,
    update: isSeo,
    delete: isSeo,
  },

  admin: {
    // Contenu → visible UNIQUEMENT pour le SEO (caché du super-admin).
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'seo',
    group: '⭐ Avis & Réputation',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'ordre', 'publie'],
    description: 'Logos des partenaires affichés dans le slider sur la page d\'accueil. Uploader le logo PNG ou SVG de chaque partenaire.',
  },

  fields: [
    {
      name: 'nom',
      label: 'Nom du partenaire',
      type: 'text',
      required: true,
      admin: { description: 'Ex: Qatar Airways, Banque Zitouna, UK Embassy…' },
    },
    {
      name: 'logo',
      label: 'Logo du partenaire (PNG ou SVG, fond transparent)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Format recommandé : PNG transparent, largeur min 200px. Sans logo, le nom s\'affiche en texte.' },
    },
    {
      name: 'lien',
      label: 'Site web du partenaire (optionnel)',
      type: 'text',
      admin: { description: 'Ex: https://www.qatarairways.com — le logo deviendra un lien cliquable.' },
    },
    {
      name: 'ordre',
      label: 'Ordre d\'affichage dans le slider (1 = en premier)',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'publie',
      label: 'Afficher dans le slider',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour masquer ce partenaire sans le supprimer.' },
    },
  ],
}

export default Partners
