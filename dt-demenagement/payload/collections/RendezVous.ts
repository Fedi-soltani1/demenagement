import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { normalizePhoneTN } from '../../lib/phone'

const RendezVous: CollectionConfig = {
  slug: 'rendez-vous',
  labels: { singular: 'Rendez-vous visite', plural: 'Rendez-vous visites' },

  hooks: {
    beforeChange: [
      ({ data }: { data: Record<string, unknown> }) => {
        if (typeof data.telephone === 'string' && data.telephone.trim()) {
          data.telephone = normalizePhoneTN(data.telephone)
        }
        if (typeof data.whatsapp === 'string' && data.whatsapp.trim()) {
          data.whatsapp = normalizePhoneTN(data.whatsapp)
        }
        return data
      },
    ],
  },

  access: {
    read:   isAdmin,
    create: ({ req: { user } }) => Boolean(user),
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🚚 Opérations',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'prenom', 'telephone', 'dateVisite', 'heure', 'statut', 'type', 'createdAt'],
    listSearchableFields: ['nom', 'prenom', 'telephone', 'whatsapp', 'sourcePartenaireNom'],
    description: 'Demandes de visite à domicile. Contacter le client pour confirmer le RDV.',
  },

  fields: [
    // ── Statut & Type ─────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'nouveau',
          admin: {
            width: '50%',
            description: 'Mettre à jour après avoir contacté le client.',
            components: { Cell: '@/components/payload/RDVStatutCell' },
          },
          options: [
            { label: 'Nouveau — pas encore traité', value: 'nouveau' },
            { label: 'Confirmé — RDV validé',        value: 'confirme' },
            { label: 'Annulé',                        value: 'annule' },
          ],
        },
        {
          name: 'type',
          label: 'Type de client',
          type: 'select',
          required: true,
          defaultValue: 'client',
          admin: { width: '50%' },
          options: [
            { label: 'Client',         value: 'client' },
            { label: 'Entreprise',     value: 'entreprise' },
            { label: 'Administration', value: 'administration' },
          ],
        },
      ],
    },

    // ── Identité ──────────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'nom',    label: 'Nom',    type: 'text', required: true, admin: { width: '50%' } },
        { name: 'prenom', label: 'Prénom', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },

    // ── Contact ───────────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'telephone', label: 'Téléphone', type: 'text', required: true, admin: { width: '50%', placeholder: '+216 XX XXX XXX', components: { Cell: '@/components/payload/PhoneCell' } } },
        { name: 'whatsapp',  label: 'WhatsApp',  type: 'text', required: true, admin: { width: '50%', placeholder: '+216 XX XXX XXX', components: { Cell: '@/components/payload/PhoneCell' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email',   label: 'Email',   type: 'email', admin: { width: '50%' } },
        { name: 'adresse', label: 'Adresse', type: 'text',  admin: { width: '50%' } },
      ],
    },

    // ── Visite ────────────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'dateVisite',
          label: 'Date souhaitée',
          type: 'text',
          admin: {
            width: '50%',
            components: { Field: '@/components/payload/RdvDateField' },
          },
        },
        {
          name: 'heure',
          label: 'Heure souhaitée',
          type: 'text',
          admin: { width: '50%', placeholder: 'ex : 10h00' },
        },
      ],
    },

    // ── Source partenaire (auto-rempli, visible seulement si présent) ─────────
    {
      type: 'row',
      fields: [
        {
          name: 'sourcePartenaire',
          label: 'Partenaire affilié',
          type: 'relationship',
          relationTo: 'affiliates',
          admin: {
            width: '50%',
            readOnly: true,
            condition: (data: Record<string, unknown>) => Boolean(data.sourcePartenaire),
          },
        },
        {
          name: 'sourcePartenaireNom',
          label: 'Nom du partenaire',
          type: 'text',
          admin: {
            width: '50%',
            readOnly: true,
            description: 'Conservé même si le partenaire est supprimé.',
            condition: (data: Record<string, unknown>) => Boolean(data.sourcePartenaireNom),
          },
        },
      ],
    },

    // ── Actions rapides ───────────────────────────────────────────────────────
    {
      name: 'actionsRapides',
      type: 'ui',
      label: '⚡ Actions rapides',
      admin: {
        components: { Field: '@/components/payload/RDVActions' },
      },
    },
  ],
}

export default RendezVous
