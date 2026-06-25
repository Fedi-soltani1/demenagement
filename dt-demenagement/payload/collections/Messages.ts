import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Messages' },

  access: {
    read:   isAdmin,
    create: ({ req: { user } }) => Boolean(user),
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🚚 Opérations',
    useAsTitle: 'contenu',
    defaultColumns: ['demenagement', 'auteur', 'lu', 'createdAt'],
    description: 'Vue conversation : sélectionnez un dossier à gauche pour lire et répondre aux messages.',
    hidden: false,
    components: {
      views: {
        list: {
          Component: '@/components/payload/MessagesInbox',
        },
      },
    },
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
      name: 'luParClient',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Coché automatiquement quand le client a ouvert la conversation dans son espace',
        readOnly: true,
      },
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
