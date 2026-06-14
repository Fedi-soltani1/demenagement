import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'
import { slugify } from '../../lib/slugify'

// Partenaires APPORTEURS / AFFILIÉS : entreprises qui mettent un lien sur leur site
// (/partenaire/<slug>) pour amener des clients à DT. Distinct de la collection `partners`
// (logos du slider de la page d'accueil).
const Affiliates: CollectionConfig = {
  slug: 'affiliates',
  labels: { singular: 'Partenaire affilié', plural: 'Partenaires affiliés' },

  access: {
    read:   () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    group: '🤝 Affiliation',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'slug'],
    description: 'Partenaires qui amènent des clients via un lien sur leur site. Chacun a une page /partenaire/<slug> et un suivi des demandes générées.',
  },

  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Génère le slug depuis le nom s'il est vide (sert au lien /partenaire/<slug>).
        if (data && !data.slug && typeof data.nom === 'string') {
          data.slug = slugify(data.nom)
        }
        return data
      },
    ],
  },

  fields: [
    {
      name: 'statsPartenaire',
      type: 'ui',
      label: 'Statistiques',
      admin: { components: { Field: '@/components/payload/PartnerStats' } },
    },
    {
      name: 'lienParrainage',
      type: 'ui',
      label: 'Lien de parrainage',
      admin: { components: { Field: '@/components/payload/PartnerLink' } },
    },
    {
      name: 'nom',
      label: 'Nom du partenaire affilié',
      type: 'text',
      required: true,
      admin: { description: 'Ex: Agence Immo Carthage, Société XYZ…' },
    },
    {
      name: 'logo',
      label: 'Logo du partenaire (PNG ou SVG, fond transparent)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Affiché dans le bandeau « En partenariat avec » de sa landing. Sans logo, le nom s\'affiche en texte.' },
    },
    {
      name: 'slug',
      label: 'Identifiant URL (slug)',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Généré automatiquement depuis le nom. Lien : /partenaire/<slug>.',
        position: 'sidebar',
      },
    },
  ],
}

export default Affiliates
