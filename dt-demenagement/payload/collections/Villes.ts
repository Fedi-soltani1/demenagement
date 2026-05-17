import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'

const Villes: CollectionConfig = {
  slug: 'villes',
  labels: { singular: 'Ville', plural: 'Villes' },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    group: '📍 Zones d\'intervention',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'region', 'publie'],
    description: 'Les 24 villes tunisiennes couvertes. Modifier le texte SEO ou l\'image de chaque ville.',
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
      admin: { description: 'Identifiant URL (ex: tunis, sfax, sousse)' },
    },
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [
        { label: 'Nord',          value: 'Nord' },
        { label: 'Nord-Est',      value: 'Nord-Est' },
        { label: 'Nord-Ouest',    value: 'Nord-Ouest' },
        { label: 'Centre',        value: 'Centre' },
        { label: 'Centre-Est',    value: 'Centre-Est' },
        { label: 'Centre-Ouest',  value: 'Centre-Ouest' },
        { label: 'Sud',           value: 'Sud' },
        { label: 'Sud-Est',       value: 'Sud-Est' },
        { label: 'Sud-Ouest',     value: 'Sud-Ouest' },
      ],
    },
    {
      name: 'coordonnees',
      type: 'group',
      label: 'Coordonnées GPS',
      fields: [
        { name: 'lat', type: 'number', required: true },
        { name: 'lng', type: 'number', required: true },
      ],
    },
    {
      name: 'textesSeo',
      type: 'richText',
      localized: true,
      admin: { description: 'Texte SEO unique pour cette ville' },
    },
    {
      name: 'imageHero',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'servicesDisponibles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Transporteur en Tunisie',   value: 'transporteur-en-tunisie' },
        { label: 'Transfert Entreprises',     value: 'transfert-entreprises' },
        { label: 'Location Monte-Meubles',    value: 'location-monte-meubles' },
        { label: 'Gardes Meubles',            value: 'gardes-meubles' },
        { label: 'Services Emballage',        value: 'services-emballage' },
        { label: 'Montage Démontage',         value: 'montage-demontage' },
      ],
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

export default Villes
