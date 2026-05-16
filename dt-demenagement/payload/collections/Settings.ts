import type { GlobalConfig } from 'payload'
import { isEditor } from '../access/isEditor'

// Settings est un Global (singleton) — pas une Collection
// Il n'existe qu'un seul document de paramètres pour tout le site

const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Paramètres du site',

  access: {
    read: () => true,
    update: isEditor,
  },

  admin: {
    description: 'Paramètres globaux du site DT Déménagement',
  },

  fields: [
    {
      name: 'telephone1',
      type: 'text',
      required: true,
      defaultValue: '+21652880311',
      admin: { description: 'Numéro principal (format international)' },
    },
    {
      name: 'telephone2',
      type: 'text',
      admin: { description: 'Numéro secondaire (optionnel)' },
    },
    {
      name: 'whatsapp',
      type: 'text',
      required: true,
      defaultValue: '+21652880311',
      admin: { description: 'Numéro WhatsApp (format international)' },
    },
    {
      name: 'whatsappMessage',
      type: 'text',
      defaultValue: 'Bonjour, je souhaite obtenir un devis pour mon déménagement.',
      localized: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      defaultValue: 'contact@demenagement.tn',
    },
    {
      name: 'adresse',
      type: 'text',
      defaultValue: 'Tunis, Tunisie',
      localized: true,
      admin: { description: "Adresse complète affichée sur la page Contact" },
    },
    {
      name: 'horaires',
      type: 'textarea',
      localized: true,
      defaultValue: 'Lun – Sam : 08h00 – 18h00\nDimanche : Sur rendez-vous',
      admin: { description: "Horaires d'ouverture (affichés sur Contact et footer)" },
    },
    {
      name: 'facebook',
      type: 'text',
      admin: { description: 'URL de la page Facebook' },
    },
    {
      name: 'instagram',
      type: 'text',
      admin: { description: 'URL du profil Instagram' },
    },
    {
      name: 'tiktok',
      type: 'text',
      admin: { description: 'URL TikTok (optionnel)' },
    },
    {
      name: 'linkedin',
      type: 'text',
      admin: { description: 'URL LinkedIn (optionnel)' },
    },
    {
      name: 'bandeauAlerte',
      type: 'text',
      localized: true,
      admin: { description: 'Bandeau d\'alerte affiché en haut du site (laisser vide pour désactiver)' },
    },
    {
      name: 'chatActif',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Activer le chat WhatsApp flottant' },
    },
    {
      name: 'whatsappActif',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'maintenanceMode',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
      admin: { description: '⚠️ Activer le mode maintenance (site inaccessible aux visiteurs)' },
    },
  ],
}

export default Settings
