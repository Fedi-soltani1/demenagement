import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdmin'

const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients' },

  access: {
    read: isAdminOrSelf,
    create: () => true,
    update: isAdminOrSelf,
    delete: isAdmin,
  },

  admin: {
    group: '👥 Utilisateurs',
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'prenom', 'telephone', 'createdAt'],
    description: 'Comptes clients créés lors de la connexion à l\'espace client. Ces profils sont liés aux dossiers de déménagement.',
  },

  auth: false,

  fields: [
    {
      name: 'email',
      label: 'Email du client',
      type: 'email',
      required: true,
      unique: true,
    },
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
      name: 'telephone',
      label: 'Téléphone',
      type: 'text',
      admin: { description: 'Format international (ex: +21652880311)' },
    },
    {
      name: 'adresse',
      type: 'group',
      label: 'Adresse du client',
      fields: [
        { name: 'rue',        label: 'Rue / Adresse',  type: 'text' },
        { name: 'ville',      label: 'Ville',           type: 'text' },
        { name: 'codePostal', label: 'Code postal',     type: 'text' },
      ],
    },
    {
      name: 'notesInternes',
      label: '🔒 Notes internes (non visibles par le client)',
      type: 'textarea',
      access: {
        read:   ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
      admin: { description: 'Remarques internes sur ce client — jamais affichées dans l\'espace client.' },
    },
  ],
}

export default Clients
