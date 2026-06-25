import type { CollectionConfig } from 'payload'
import { isAdminOrSelf } from '../access/isAdmin'

const Admins: CollectionConfig = {
  slug: 'admins',
  labels: { singular: 'Administrateur', plural: 'Administrateurs' },

  auth: true,

  access: {
    // isAdminOrSelf : le super-admin voit/modifie tous les comptes (la liste lui est
    // donc visible) ; un SEO ne voit/modifie QUE son propre compte (page « mon compte »)
    // → la collection Administrateurs est cachée de la barre du SEO, mais il peut quand
    // même changer son mot de passe.
    read:   isAdminOrSelf,
    create: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
    update: isAdminOrSelf,
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
      defaultValue: 'seo',
      admin: { description: 'Définit ce que cet utilisateur peut faire dans l\'admin.' },
      options: [
        { label: 'Super Admin — opérationnel : dossiers, messages, RDV, leads, clients, admins, affiliés', value: 'super-admin' },
        { label: 'SEO — contenu du site : pages, services, blog, FAQ, villes, pays, avis, partenaires, newsletter', value: 'seo' },
      ],
      access: {
        update: ({ req: { user } }) =>
          Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
    },
  ],
}

export default Admins
