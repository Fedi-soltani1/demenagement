import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdmin'

const Demenagements: CollectionConfig = {
  slug: 'demenagements',
  labels: { singular: 'Déménagement', plural: 'Déménagements' },

  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    useAsTitle: 'numeroDossier',
    defaultColumns: ['numeroDossier', 'statut', 'dateDemenagement', 'clientId'],
    description: 'Dossiers de déménagement — gestion complète du suivi client',
  },

  fields: [
    {
      name: 'numeroDossier',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Format : DT-2026-XXXX (généré automatiquement)',
        readOnly: true,
      },
    },
    {
      name: 'clientId',
      type: 'text',
      required: true,
      admin: { description: 'ID du client (email depuis NextAuth)' },
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'devis_recu',
      options: [
        { label: 'Devis reçu',       value: 'devis_recu' },
        { label: 'Confirmé',         value: 'confirme' },
        { label: 'En préparation',   value: 'en_preparation' },
        { label: 'En cours',         value: 'en_cours' },
        { label: 'Livré',            value: 'livre' },
        { label: 'Annulé',           value: 'annule' },
      ],
    },
    {
      name: 'dateDemenagement',
      type: 'date',
    },
    {
      name: 'adresseDepart',
      type: 'group',
      label: 'Adresse de départ',
      fields: [
        { name: 'adresse', type: 'text', required: true },
        { name: 'ville',   type: 'text', required: true },
        { name: 'lat',     type: 'number' },
        { name: 'lng',     type: 'number' },
        {
          name: 'etage',
          type: 'select',
          options: [
            { label: 'RDC', value: 'RDC' },
            { label: '1er', value: '1' },
            { label: '2ème', value: '2' },
            { label: '3ème', value: '3' },
            { label: '4ème', value: '4' },
            { label: '5+',  value: '5+' },
          ],
        },
        { name: 'ascenseur', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'adresseArrivee',
      type: 'group',
      label: 'Adresse d\'arrivée',
      fields: [
        { name: 'adresse', type: 'text', required: true },
        { name: 'ville',   type: 'text', required: true },
        { name: 'lat',     type: 'number' },
        { name: 'lng',     type: 'number' },
        {
          name: 'etage',
          type: 'select',
          options: [
            { label: 'RDC', value: 'RDC' },
            { label: '1er', value: '1' },
            { label: '2ème', value: '2' },
            { label: '3ème', value: '3' },
            { label: '4ème', value: '4' },
            { label: '5+',  value: '5+' },
          ],
        },
        { name: 'ascenseur', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'volumeM3',
      type: 'number',
      admin: { description: 'Volume estimé en m³' },
    },
    {
      name: 'servicesInclus',
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
      name: 'demenageur',
      type: 'group',
      label: 'Déménageur assigné',
      fields: [
        { name: 'nom',       type: 'text' },
        { name: 'telephone', type: 'text' },
      ],
    },
    {
      name: 'documents',
      type: 'array',
      label: 'Documents',
      fields: [
        {
          name: 'nom',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Devis',           value: 'devis' },
            { label: 'Contrat',         value: 'contrat' },
            { label: 'Bon de livraison', value: 'bon_livraison' },
            { label: 'Autre',           value: 'autre' },
          ],
        },
        {
          name: 'fichier',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'notesInternes',
      type: 'textarea',
      access: {
        read:   ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'admin'),
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'admin'),
      },
      admin: { description: 'Notes internes — non visibles par le client' },
    },
  ],
}

export default Demenagements
