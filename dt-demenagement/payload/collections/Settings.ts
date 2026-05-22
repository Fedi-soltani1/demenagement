import type { GlobalConfig } from 'payload'
import { isEditor } from '../access/isEditor'

const Settings: GlobalConfig = {
  slug: 'settings',
  label: '⚙️ Paramètres du site',

  access: {
    read: () => true,
    update: isEditor,
  },

  admin: {
    group: '⚙️ Paramètres',
    description: 'Informations de contact, réseaux sociaux et options globales du site. Ces données apparaissent dans le footer, la page contact et le bouton WhatsApp.',
  },

  fields: [
    // ── Téléphones ────────────────────────────────────────────────────────────
    {
      name: 'telephone1',
      label: '📞 Téléphone principal',
      type: 'text',
      required: true,
      defaultValue: '+21652880311',
      admin: { description: 'Format international obligatoire. Ex: +21652880311' },
    },
    {
      name: 'telephone2',
      label: '📞 Téléphone secondaire (optionnel)',
      type: 'text',
      admin: { description: 'Deuxième numéro affiché sur la page Contact.' },
    },
    {
      name: 'whatsapp',
      label: '💬 Numéro WhatsApp',
      type: 'text',
      required: true,
      defaultValue: '+21652880311',
      admin: { description: 'Numéro utilisé pour le bouton WhatsApp flottant. Format international.' },
    },
    {
      name: 'whatsappMessage',
      label: '💬 Message pré-rempli WhatsApp',
      type: 'text',
      defaultValue: 'Bonjour, je souhaite obtenir un devis pour mon déménagement.',
      localized: true,
      admin: { description: 'Texte qui s\'affiche automatiquement quand un visiteur clique sur le bouton WhatsApp.' },
    },

    // ── Email & adresse ───────────────────────────────────────────────────────
    {
      name: 'email',
      label: '📧 Email de contact',
      type: 'email',
      required: true,
      defaultValue: 'contact@demenagement.tn',
    },
    {
      name: 'adresse',
      label: '📍 Adresse physique',
      type: 'text',
      defaultValue: 'Tunis, Tunisie',
      localized: true,
      admin: { description: 'Adresse complète affichée sur la page Contact et dans le footer.' },
    },
    {
      name: 'horaires',
      label: '🕐 Horaires d\'ouverture',
      type: 'textarea',
      localized: true,
      defaultValue: 'Lun – Sam : 08h00 – 18h00\nDimanche : Sur rendez-vous',
      admin: { description: 'Affiché sur la page Contact et dans le footer. Un horaire par ligne.' },
    },

    // ── Réseaux sociaux ───────────────────────────────────────────────────────
    {
      name: 'facebook',
      label: '📘 Page Facebook (URL complète)',
      type: 'text',
      admin: { description: 'Ex: https://www.facebook.com/dtdemenagementtunisie' },
    },
    {
      name: 'instagram',
      label: '📸 Profil Instagram (URL complète)',
      type: 'text',
      admin: { description: 'Ex: https://www.instagram.com/dtdemenagement' },
    },
    {
      name: 'tiktok',
      label: '🎵 Profil TikTok (URL complète, optionnel)',
      type: 'text',
    },
    {
      name: 'linkedin',
      label: '💼 Page LinkedIn (URL complète, optionnel)',
      type: 'text',
    },

    // ── Options du site ───────────────────────────────────────────────────────
    {
      name: 'bandeauAlerte',
      label: '🔔 Bandeau d\'annonce en haut du site (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: "Fermeture exceptionnelle le 1er mai". Laisser vide pour désactiver.' },
    },
    {
      name: 'whatsappActif',
      label: '💬 Bouton WhatsApp flottant actif',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour masquer le bouton WhatsApp sur tout le site.' },
    },
    {
      name: 'chatActif',
      label: '💬 Chat en ligne actif',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'maintenanceMode',
      label: '🚧 Mode maintenance (site inaccessible aux visiteurs)',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'super-admin'),
      },
      admin: { description: '⚠️ ATTENTION — Cocher cette case rend le site inaccessible à tous les visiteurs. Réservé aux super-admins.' },
    },
  ],
}

export default Settings
