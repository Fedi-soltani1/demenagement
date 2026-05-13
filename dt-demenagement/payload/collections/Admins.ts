import type { CollectionConfig } from 'payload'

// Collection Admins — utilisée par le panneau Payload CMS
// Distincte de la collection Clients (espace client NextAuth)

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
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'prenom', 'role'],
    description: 'Comptes administrateurs du CMS — ne pas confondre avec les clients',
  },

  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
    },
    {
      name: 'prenom',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editeur',
      options: [
        {
          label: 'Super Admin — Accès total',
          value: 'super-admin',
        },
        {
          label: 'Éditeur — Contenu du site (pages, blog, FAQ, médias)',
          value: 'editeur',
        },
        {
          label: 'Commercial — Dossiers & messagerie clients',
          value: 'commercial',
        },
      ],
      access: {
        // Seul un super-admin peut changer le rôle d'un autre utilisateur
        update: ({ req: { user } }) =>
          Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
    },
  ],
}

export default Admins
