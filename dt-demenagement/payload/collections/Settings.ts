import type { GlobalConfig } from 'payload'
import { isAdminOrSeo } from '../access/isEditor'

const Settings: GlobalConfig = {
  slug: 'settings',
  label: '⚙️ Paramètres du site',

  access: {
    read: () => true,
    update: isAdminOrSeo,
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
      defaultValue: '+21652880112',
      admin: { description: 'Format international obligatoire. Ex: +21652880112' },
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
      defaultValue: '+21652880112',
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
      name: 'tagline',
      label: '💬 Accroche footer (slogan court)',
      type: 'text',
      localized: true,
      defaultValue: 'N°1 du déménagement en Tunisie depuis plus de 15 ans. Fiabilité, soin et ponctualité à chaque déménagement.',
      admin: { description: 'Texte affiché sous le logo dans le footer.' },
    },
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

    // ── Identité visuelle ────────────────────────────────────────────────────────
    {
      name: 'logoImage',
      label: '🖼 Logo du site (image)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Logo affiché dans la navbar et le footer. Formats recommandés : SVG ou PNG transparent. Si absent : texte "DT Déménagement" affiché.',
      },
    },
    {
      name: 'copyright',
      label: '©️ Texte copyright (footer)',
      type: 'text',
      localized: true,
      defaultValue: '© 2026 DT Déménagement Tunisie. Tous droits réservés.',
      admin: { description: 'Affiché en bas du footer. Mettre à jour chaque année.' },
    },

    // ── Navbar ────────────────────────────────────────────────────────────────────
    {
      name: 'navbarCtaTexte',
      label: '🔘 Bouton CTA navbar — texte',
      type: 'text',
      localized: true,
      defaultValue: 'Devis gratuit',
      admin: { description: 'Texte du bouton rouge en haut à droite de la navbar.' },
    },
    {
      name: 'navbarCtaLien',
      label: '🔘 Bouton CTA navbar — lien',
      type: 'text',
      defaultValue: '/devis',
      admin: { description: 'URL du bouton CTA navbar. Ex: /devis ou #contact' },
    },

    // ── Comportement ──────────────────────────────────────────────────────────────
    {
      name: 'animationsActives',
      label: '✨ Animations activées',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour désactiver toutes les animations scroll et transition sur le site.' },
    },

    // ── Facturation ───────────────────────────────────────────────────────────────
    {
      name: 'matriculeFiscal',
      label: '🧾 Matricule fiscal',
      type: 'text',
      admin: { description: 'Numéro de matricule fiscal de la société. Apparaît sur toutes les factures PDF.' },
    },

    // ── Analytics ─────────────────────────────────────────────────────────────────
    {
      name: 'gtmId',
      label: '📊 Google Tag Manager ID',
      type: 'text',
      admin: { description: 'Ex: GTM-XXXXXXX. Prioritaire sur NEXT_PUBLIC_GTM_ID dans .env.' },
    },
    {
      name: 'ga4Id',
      label: '📊 Google Analytics 4 ID',
      type: 'text',
      admin: { description: 'Ex: G-XXXXXXXXXX.' },
    },
    {
      name: 'metaPixelId',
      label: '📊 Meta Pixel ID',
      type: 'text',
      admin: { description: 'Ex: 123456789.' },
    },
    {
      name: 'clarityId',
      label: '📊 Microsoft Clarity ID',
      type: 'text',
      admin: { description: 'Ex: abcdefghij.' },
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

    // ── Navigation ────────────────────────────────────────────────────────────
    {
      name: 'liensNavigation',
      label: '🔗 Liens de navigation personnalisés',
      type: 'array',
      admin: {
        description: 'Liens affichés dans la navbar et le footer. Laissez vide pour utiliser les liens par défaut (Blog, FAQ, À propos, Contact).',
      },
      fields: [
        {
          name: 'libelle',
          label: 'Libellé',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'chemin',
          label: 'Chemin URL (ex: /blog)',
          type: 'text',
          required: true,
        },
        {
          name: 'actif',
          label: 'Actif',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'landingPartenaire',
      type: 'group',
      label: '🤝 Landing partenaires',
      admin: { description: 'Textes de la page affichée via le lien d\'un partenaire (/partenaire/...).' },
      fields: [
        {
          name: 'titre',
          label: 'Titre d\'accroche',
          type: 'text',
          localized: true,
          defaultValue: 'Déménagez sereinement avec DT Déménagement Tunisie',
        },
        {
          name: 'sousTitre',
          label: 'Sous-titre',
          type: 'textarea',
          localized: true,
          defaultValue: 'Devis gratuit en 2 minutes. Une équipe professionnelle partout en Tunisie et vers l\'international.',
        },
        {
          name: 'pill1',
          label: 'Argument 1 (badge de confiance)',
          type: 'text',
          localized: true,
          defaultValue: 'Devis gratuit',
        },
        {
          name: 'pill2',
          label: 'Argument 2 (badge de confiance)',
          type: 'text',
          localized: true,
          defaultValue: 'Partout en Tunisie',
        },
        {
          name: 'pill3',
          label: 'Argument 3 (badge de confiance)',
          type: 'text',
          localized: true,
          defaultValue: 'Équipe professionnelle',
        },
      ],
    },
  ],
}

export default Settings
