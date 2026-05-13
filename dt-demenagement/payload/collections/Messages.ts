import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isCommercial } from '../access/isClient'

const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Messages' },

  access: {
    read:   isCommercial,
    create: ({ req: { user } }) => Boolean(user),
    update: isCommercial,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'contenu',
    defaultColumns: ['demenagement', 'auteur', 'lu', 'createdAt'],
    description: 'Messagerie interne entre clients et l\'équipe DT',
  },

  fields: [
    {
      name: 'demenagement',
      type: 'relationship',
      relationTo: 'demenagements',
      required: true,
    },
    {
      name: 'auteur',
      type: 'select',
      required: true,
      options: [
        { label: 'Client', value: 'client' },
        { label: 'Admin',  value: 'admin' },
      ],
    },
    {
      name: 'contenu',
      type: 'textarea',
      required: true,
      admin: { description: 'Max 2000 caractères' },
    },
    {
      name: 'lu',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'clientId',
      type: 'text',
      admin: {
        description: 'ID du client expéditeur (depuis session NextAuth)',
        readOnly: true,
      },
    },
  ],
}

export default Messages
