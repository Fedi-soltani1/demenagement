import type { CollectionConfig } from 'payload'

const Admins: CollectionConfig = {
  slug: 'admins',
  labels: { singular: 'Administrateur', plural: 'Administrateurs' },

  auth: true,

  access: {
    read:   ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
  },

  admin: {
    group: '👥 Utilisateurs',
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'prenom', 'role'],
    description: 'Comptes qui ont accès à ce panneau d\'administration. Seul le Super Admin peut créer ou supprimer des comptes.',
  },

  fields: [
    {
      name: 'nom',
      label: 'Nom de famille',
      type: 'text',
      required: true,
    },
    {
      name: 'prenom',
      label: 'Prénom',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Rôle et niveau d\'accès',
      type: 'select',
      required: true,
      defaultValue: 'editeur',
      admin: { description: 'Définit ce que cet utilisateur peut faire dans l\'admin.' },
      options: [
        { label: 'Super Admin — accès total (créer des admins, supprimer)',   value: 'super-admin' },
        { label: 'Éditeur — modifier le contenu (pages, blog, FAQ, médias)', value: 'editeur' },
        { label: 'Commercial — voir et gérer les dossiers clients',           value: 'commercial' },
      ],
      access: {
        update: ({ req: { user } }) =>
          Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
    },
  ],
}

export default Admins
