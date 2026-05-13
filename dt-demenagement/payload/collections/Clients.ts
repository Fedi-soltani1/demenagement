import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdmin'

// ⚠️ Slug 'clients' — différent des tables NextAuth (auth_users, auth_accounts...)
// Ce sont les profils clients enrichis, liés par email à la session NextAuth

const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients' },

  access: {
    read: isAdminOrSelf,
    create: () => true, // Création lors de la première connexion magic link
    update: isAdminOrSelf,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'prenom', 'telephone', 'createdAt'],
    description: 'Profils clients — liés aux sessions NextAuth par email',
  },

  auth: false,

  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
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
      name: 'telephone',
      type: 'text',
      admin: { description: 'Format international (ex: +21652880311)' },
    },
    {
      name: 'adresse',
      type: 'group',
      fields: [
        { name: 'rue',        type: 'text' },
        { name: 'ville',      type: 'text' },
        { name: 'codePostal', type: 'text' },
      ],
    },
    {
      name: 'notesInternes',
      type: 'textarea',
      access: {
        read:   ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'admin'),
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'admin'),
      },
      admin: { description: 'Notes internes visibles uniquement par les admins' },
    },
  ],
}

export default Clients
