import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isCommercial } from '../access/isClient'

const Demenagements: CollectionConfig = {
  slug: 'demenagements',
  labels: { singular: 'Dossier déménagement', plural: 'Dossiers déménagement' },

  access: {
    read:   isCommercial,
    create: isAdmin,
    update: isCommercial,
    delete: isAdmin,
  },

  admin: {
    group: '📬 Demandes clients',
    useAsTitle: 'numeroDossier',
    defaultColumns: ['numeroDossier', 'nomComplet', 'telephone', 'statut', 'dateDemenagement'],
    description: 'Chaque ligne = une demande de devis reçue. Ouvrir un dossier et changer le "Statut du dossier" pour que le client voie l\'avancement en temps réel.',
  },

  fields: [
    // ── Informations dossier ─────────────────────────────────────────────────
    {
      name: 'numeroDossier',
      label: 'Numéro de dossier',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Généré automatiquement à la soumission du formulaire. Ne pas modifier.',
        readOnly: true,
      },
    },
    {
      name: 'statut',
      label: 'Statut du dossier',
      type: 'select',
      required: true,
      defaultValue: 'devis_recu',
      admin: {
        description: '👆 C\'est CE champ que vous modifiez au quotidien. Le client voit le statut dans son espace.',
      },
      options: [
        { label: '📥 Devis reçu — nouveau, pas encore traité',     value: 'devis_recu' },
        { label: '✅ Confirmé — devis accepté, date fixée',        value: 'confirme' },
        { label: '📦 En préparation — équipe mobilisée',           value: 'en_preparation' },
        { label: '🚛 En cours — déménagement en cours',            value: 'en_cours' },
        { label: '🏁 Livré — déménagement terminé',                value: 'livre' },
        { label: '❌ Annulé — dossier annulé',                     value: 'annule' },
      ],
    },
    {
      name: 'dateDemenagement',
      label: 'Date de déménagement souhaitée',
      type: 'date',
      admin: { description: 'Date souhaitée par le client — à confirmer avec lui.' },
    },

    // ── Informations client ──────────────────────────────────────────────────
    {
      name: 'nomComplet',
      label: 'Nom complet du client',
      type: 'text',
      admin: { readOnly: true, description: 'Rempli automatiquement depuis le formulaire.' },
    },
    {
      name: 'clientId',
      label: 'Email du client',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'telephone',
      label: 'Téléphone du client',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'typeClient',
      label: 'Type de client',
      type: 'select',
      options: [
        { label: '🏠 Particulier', value: 'particulier' },
        { label: '🏢 Entreprise',  value: 'entreprise' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'commentaire',
      label: 'Message du client',
      type: 'textarea',
      admin: { readOnly: true, description: 'Message laissé par le client dans le formulaire.' },
    },

    // ── Adresses ─────────────────────────────────────────────────────────────
    {
      name: 'adresseDepart',
      type: 'group',
      label: '📦 Adresse de départ (là où se trouvent les affaires)',
      fields: [
        { name: 'adresse', label: 'Rue / Adresse',  type: 'text', required: true },
        { name: 'ville',   label: 'Ville',           type: 'text', required: true },
        {
          name: 'etage',
          label: 'Étage',
          type: 'select',
          options: [
            { label: 'Rez-de-chaussée (RDC)', value: 'RDC' },
            { label: '1er étage',  value: '1' },
            { label: '2ème étage', value: '2' },
            { label: '3ème étage', value: '3' },
            { label: '4ème étage', value: '4' },
            { label: '5ème et plus', value: '5+' },
          ],
        },
        { name: 'ascenseur', label: 'Ascenseur disponible', type: 'checkbox', defaultValue: false },
        { name: 'lat', label: 'Latitude GPS',  type: 'number', admin: { condition: () => false } },
        { name: 'lng', label: 'Longitude GPS', type: 'number', admin: { condition: () => false } },
      ],
    },
    {
      name: 'adresseArrivee',
      type: 'group',
      label: '🏠 Adresse d\'arrivée (destination)',
      fields: [
        { name: 'adresse', label: 'Rue / Adresse',  type: 'text', required: true },
        { name: 'ville',   label: 'Ville',           type: 'text', required: true },
        {
          name: 'etage',
          label: 'Étage',
          type: 'select',
          options: [
            { label: 'Rez-de-chaussée (RDC)', value: 'RDC' },
            { label: '1er étage',  value: '1' },
            { label: '2ème étage', value: '2' },
            { label: '3ème étage', value: '3' },
            { label: '4ème étage', value: '4' },
            { label: '5ème et plus', value: '5+' },
          ],
        },
        { name: 'ascenseur', label: 'Ascenseur disponible', type: 'checkbox', defaultValue: false },
        { name: 'lat', label: 'Latitude GPS',  type: 'number', admin: { condition: () => false } },
        { name: 'lng', label: 'Longitude GPS', type: 'number', admin: { condition: () => false } },
      ],
    },

    // ── Détails du déménagement ───────────────────────────────────────────────
    {
      name: 'servicesInclus',
      label: 'Services demandés',
      type: 'select',
      hasMany: true,
      admin: { description: 'Services cochés par le client dans le formulaire.' },
      options: [
        { label: '🚛 Transporteur en Tunisie',  value: 'transporteur-en-tunisie' },
        { label: '🏢 Transfert Entreprises',    value: 'transfert-entreprises' },
        { label: '⬆️ Location Monte-Meubles',   value: 'location-monte-meubles' },
        { label: '📦 Garde-Meubles / Stockage', value: 'gardes-meubles' },
        { label: '📫 Service Emballage',        value: 'services-emballage' },
        { label: '🔧 Montage & Démontage',      value: 'montage-demontage' },
      ],
    },
    {
      name: 'volumeM3',
      label: 'Volume estimé (en m³)',
      type: 'number',
      admin: { description: 'Estimation donnée par le client. 1 studio ≈ 15 m³ / 3 pièces ≈ 35 m³.' },
    },

    // ── Photos envoyées par le client ─────────────────────────────────────────
    {
      name: 'photosDepart',
      label: '📸 Photos accès — départ',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Photos de l\'escalier, couloir, parking au départ — envoyées par le client via le formulaire.' },
    },
    {
      name: 'photosArrivee',
      label: '📸 Photos accès — arrivée',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Photos de l\'escalier, couloir, parking à l\'arrivée — envoyées par le client.' },
    },
    {
      name: 'photosMeubles',
      label: '📸 Photos meubles & objets',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Photos des meubles et objets à déménager — aidant à estimer le volume et la complexité.' },
    },

    // ── Équipe assignée ───────────────────────────────────────────────────────
    {
      name: 'demenageur',
      type: 'group',
      label: '👷 Déménageur assigné à ce dossier',
      admin: { description: 'Remplir une fois le dossier confirmé.' },
      fields: [
        { name: 'nom',       label: 'Nom du déménageur', type: 'text' },
        { name: 'telephone', label: 'Téléphone',          type: 'text' },
      ],
    },

    // ── Documents ─────────────────────────────────────────────────────────────
    {
      name: 'documents',
      type: 'array',
      label: '📄 Documents du dossier (devis PDF, contrat, bon de livraison)',
      admin: { description: 'Uploader ici les documents à partager avec le client.' },
      fields: [
        {
          name: 'nom',
          label: 'Nom du document (ex: Devis DT-2026-4821)',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          label: 'Type de document',
          type: 'select',
          required: true,
          options: [
            { label: '📋 Devis',             value: 'devis' },
            { label: '📝 Contrat signé',      value: 'contrat' },
            { label: '✅ Bon de livraison',   value: 'bon_livraison' },
            { label: '📎 Autre document',     value: 'autre' },
          ],
        },
        {
          name: 'fichier',
          label: 'Fichier (PDF recommandé)',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    // ── Notes internes ────────────────────────────────────────────────────────
    {
      name: 'notesInternes',
      label: '🔒 Notes internes (visibles uniquement par les super-admins)',
      type: 'textarea',
      access: {
        read:   ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
      admin: { description: 'Remarques internes sur ce client ou ce dossier — jamais affichées au client.' },
    },
  ],
}

export default Demenagements
