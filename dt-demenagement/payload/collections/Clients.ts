import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdmin'
import { normalizePhoneTN } from '../../lib/phone'

const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients' },

  hooks: {
    beforeChange: [
      ({ data }: { data: Record<string, unknown> }) => {
        if (typeof data.telephone === 'string' && data.telephone.trim()) {
          data.telephone = normalizePhoneTN(data.telephone)
        }
        return data
      },
    ],
  },

  access: {
    read:   ({ req: { user } }) => Boolean(user),
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
    // ── Identité ──────────────────────────────────────────────────────────────
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      // Optionnel : un client peut être identifié par email OU par téléphone.
      // unique reste actif (PostgreSQL autorise plusieurs valeurs nulles).
      required: false,
      unique: true,
      admin: { description: 'Optionnel — un client peut être identifié par email ou par téléphone.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'prenom',
          label: 'Prénom',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'nom',
          label: 'Nom',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text',
      admin: {
        description: 'Format international (ex: +21652880311)',
        placeholder: '+216 XX XXX XXX',
        components: { Cell: '@/components/payload/PhoneCell' },
      },
    },

    // ── Adresse ───────────────────────────────────────────────────────────────
    {
      name: 'adresse',
      type: 'group',
      label: 'Adresse',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'rue',        label: 'Rue / Adresse', type: 'text', admin: { width: '70%' } },
            { name: 'codePostal', label: 'Code postal',   type: 'text', admin: { width: '30%' } },
          ],
        },
        { name: 'ville', label: 'Ville', type: 'text' },
      ],
    },

    // ── Notes internes (super-admin uniquement) ───────────────────────────────
    {
      name: 'notesInternes',
      label: '🔒 Notes internes',
      type: 'textarea',
      access: {
        read:   ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
      admin: { description: 'Jamais affichées dans l\'espace client.' },
    },

    // ── Historique / Traçabilité (lecture seule) ──────────────────────────────
    {
      name: 'historique',
      type: 'ui',
      label: '🗂 Historique du client',
      admin: {
        components: { Field: '@/components/payload/ClientHistory' },
      },
    },
  ],
}

export default Clients
