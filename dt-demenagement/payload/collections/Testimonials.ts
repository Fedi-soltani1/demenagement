import type { CollectionConfig } from 'payload'
import { isSeo } from '../access/isEditor'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Témoignage client', plural: 'Témoignages clients' },

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
    defaultColumns: ['nom', 'ville', 'note', 'publie'],
    description: 'Témoignages affichés sur la page d\'accueil. Cocher "Afficher sur le site" pour qu\'un avis soit visible.',
  },

  fields: [
    {
      name: 'nom',
      label: 'Nom du client',
      type: 'text',
      required: true,
    },
    {
      name: 'ville',
      label: 'Ville du client (ex: Tunis, Sousse, France)',
      type: 'text',
      required: true,
    },
    {
      name: 'note',
      label: 'Note sur 5 étoiles',
      type: 'select',
      required: true,
      options: [
        { label: '1 étoile',           value: '1' },
        { label: '2 étoiles',          value: '2' },
        { label: '3 étoiles',          value: '3' },
        { label: '4 étoiles',          value: '4' },
        { label: '5 étoiles (excellent)', value: '5' },
      ],
    },
    {
      name: 'texte',
      label: 'Témoignage du client (ses propres mots)',
      type: 'textarea',
      required: true,
      admin: { description: 'Coller ici le témoignage tel que laissé par le client.' },
    },
    {
      name: 'photo',
      label: 'Photo du client (optionnel)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Si disponible — affichée en avatar à côté du témoignage.' },
    },
    {
      name: 'ordre',
      label: 'Ordre d\'affichage (1 = affiché en premier)',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'publie',
      label: 'Afficher sur le site',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour masquer ce témoignage sans le supprimer.' },
    },
  ],
}

export default Testimonials
