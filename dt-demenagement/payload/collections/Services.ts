import type { CollectionConfig } from 'payload'
import { revalidateTag } from 'next/cache'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

function revalidateNavServices() {
  revalidateTag('nav-services')
}

const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },

  hooks: {
    afterChange: [() => revalidateNavServices()],
    afterDelete: [() => revalidateNavServices()],
  },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    group: '📝 Contenu du site',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'tarifDepuis', 'publie', 'ordre'],
    description: 'Services proposés par DT Déménagement. Modifier le nom, la description, le tarif et l\'icône.',
    preview: (doc) => `${process.env.NEXT_PUBLIC_SITE_URL}/fr/services/${doc.slug as string}`,
  },

  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: "Identifiant URL (ex: transporteur-en-tunisie)" },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Court résumé affiché dans les cartes et la liste' },
    },
    {
      name: 'icone',
      type: 'text',
      required: true,
      admin: { description: "Nom icône Lucide (ex: truck, building, crane, warehouse, package, wrench)" },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image héro de la page service (16:9 recommandé)' },
    },
    {
      name: 'caracteristiques',
      type: 'array',
      label: 'Caractéristiques / Prestations incluses',
      admin: {
        description: 'Liste des éléments inclus dans ce service (affichés en bullet points)',
      },
      fields: [
        {
          name: 'icone',
          type: 'text',
          admin: { description: 'Icône Lucide (ex: check, star, shield, zap) — laisser vide = check par défaut' },
        },
        {
          name: 'texte',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'avantages',
      type: 'array',
      label: 'Nos avantages (section "Pourquoi nous choisir")',
      fields: [
        {
          name: 'titre',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'icone',
          type: 'text',
          admin: { description: 'Icône Lucide (ex: shield-check, clock, award, thumbs-up)' },
        },
      ],
    },
    {
      name: 'contenu',
      type: 'richText',
      localized: true,
      admin: { description: 'Contenu long / texte SEO de la page service' },
    },
    {
      name: 'tarifDepuis',
      type: 'number',
      admin: { description: 'Prix de départ en TND (optionnel — affiché sur la carte)' },
    },
    {
      name: 'ordre',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Ordre d\'affichage (plus petit = en premier)' },
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour masquer ce service du site' },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Partage',
      fields: [
        { name: 'metaTitle',       type: 'text',     localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage',         type: 'upload',   relationTo: 'media' },
      ],
    },
  ],
}

export default Services
