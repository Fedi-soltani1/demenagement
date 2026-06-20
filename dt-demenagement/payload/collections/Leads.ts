import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },

  access: {
    read:   isAdmin,
    create: () => true,   // appelé depuis /api/lead-capture (sans auth)
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🚚 Opérations',
    useAsTitle: 'nomPrenom',
    defaultColumns: ['nomPrenom', 'telephone', 'email', 'sourcePartenaireNom', 'service', 'statut', 'createdAt'],
    listSearchableFields: ['nomPrenom', 'telephone', 'email', 'sourcePartenaireNom'],
    description: 'Prospects ayant rempli le popup "Devis Gratuit" mais N\'AYANT PAS terminé (ni devis complet, ni RDV). Dès qu\'ils convertissent, ils quittent cette liste. Filtrer par statut pour voir les convertis.',
    baseListFilter: () => ({ statut: { equals: 'nouveau' } }),
  },

  fields: [
    // ── Identité & Contact ────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'nomPrenom',
          label: 'Nom complet',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'telephone',
          label: 'Téléphone',
          type: 'text',
          required: true,
          admin: { width: '50%', placeholder: '+216 XX XXX XXX' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          admin: { width: '50%' },
        },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'nouveau',
          admin: {
            width: '50%',
            components: { Field: '@/components/payload/LeadStatutSelect' },
          },
          options: [
            { label: '🆕 Nouveau',             value: 'nouveau'      },
            { label: '📋 Devis complet soumis', value: 'devis_soumis' },
            { label: '📅 RDV planifié',         value: 'rdv_planifie' },
            { label: '🚫 Non converti',         value: 'non_converti' },
          ],
        },
      ],
    },

    // ── Source ────────────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'service',
          label: 'Service (page source)',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Slug du service — ex: transporteur-en-tunisie',
          },
        },
        {
          name: 'ville',
          label: 'Ville (page source)',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Nom de la ville si venu d\'une page ville.',
          },
        },
      ],
    },
    {
      name: 'source',
      label: 'URL source',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Chemin de la page depuis laquelle le popup a été ouvert.',
      },
    },
    {
      name: 'sourcePartenaire',
      label: 'Source partenaire affilié',
      type: 'relationship',
      relationTo: 'affiliates',
      admin: { readOnly: true, description: 'Partenaire affilié dont le lien a amené ce prospect (si applicable).' },
    },
    {
      name: 'sourcePartenaireNom',
      label: 'Nom du partenaire (source)',
      type: 'text',
      admin: { readOnly: true, description: 'Conservé même si le partenaire est supprimé. Vide = vient directement de notre site.' },
    },
    {
      name: 'actionsRapides',
      type: 'ui',
      label: '⚡ Actions rapides',
      admin: {
        components: { Field: '@/components/payload/LeadActions' },
      },
    },
  ],
}

export default Leads
