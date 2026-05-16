import type { GlobalConfig } from 'payload'
import { isEditor } from '../access/isEditor'

const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Page d\'accueil',

  access: {
    read: () => true,
    update: isEditor,
  },

  admin: {
    description: 'Modifier le contenu de la page d\'accueil — chaque modification est immédiatement visible sur le site.',
    group: 'Contenu du site',
  },

  // ─── SECTIONS ─────────────────────────────────────────────────────────────────

  fields: [

    // ── HERO ─────────────────────────────────────────────────────────────────────
    {
      name: 'hero',
      type: 'group',
      label: '🎯 Section Hero (1ère section)',
      fields: [
        {
          name: 'badge',
          type: 'text',
          localized: true,
          admin: { description: 'Petit texte au-dessus du titre (ex: "N°1 du déménagement en Tunisie")' },
        },
        {
          name: 'titre',
          type: 'text',
          localized: true,
          admin: { description: 'Titre principal H1' },
        },
        {
          name: 'sousTitre',
          type: 'textarea',
          localized: true,
          admin: { description: 'Phrase d\'accroche sous le titre' },
        },
        {
          name: 'cta1Texte',
          type: 'text',
          localized: true,
          admin: { description: 'Texte bouton principal (ex: "Devis gratuit en 24h")' },
        },
        {
          name: 'cta2Texte',
          type: 'text',
          localized: true,
          admin: { description: 'Texte bouton secondaire (ex: "Appeler maintenant")' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stat1Valeur',
              type: 'text',
              localized: true,
              admin: { width: '33%', description: 'Ex: "5 000+"' },
            },
            {
              name: 'stat1Label',
              type: 'text',
              localized: true,
              admin: { width: '67%', description: 'Ex: "déménagements"' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stat2Valeur',
              type: 'text',
              localized: true,
              admin: { width: '33%', description: 'Ex: "15 ans"' },
            },
            {
              name: 'stat2Label',
              type: 'text',
              localized: true,
              admin: { width: '67%', description: 'Ex: "d\'expérience"' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stat3Valeur',
              type: 'text',
              localized: true,
              admin: { width: '33%', description: 'Ex: "98%"' },
            },
            {
              name: 'stat3Label',
              type: 'text',
              localized: true,
              admin: { width: '67%', description: 'Ex: "satisfaction"' },
            },
          ],
        },
        {
          name: 'pills',
          type: 'array',
          label: 'Tags/Pills (badges de confiance)',
          maxRows: 5,
          localized: true,
          admin: { description: 'Petits badges affichés dans le hero (ex: "Certifié & Assuré")' },
          fields: [
            { name: 'texte', type: 'text', required: true },
          ],
        },
      ],
    },

    // ── POINTS FORTS (mini features 3 colonnes) ───────────────────────────────────
    {
      name: 'pointsForts',
      type: 'group',
      label: '⚡ Points Forts (3 colonnes sous le hero)',
      fields: [
        {
          name: 'items',
          type: 'array',
          label: 'Les 3 points forts',
          minRows: 3,
          maxRows: 3,
          fields: [
            {
              name: 'icone',
              type: 'text',
              admin: { description: 'Nom icône Lucide (users, truck, package, shield, star...)' },
            },
            {
              name: 'titre',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'description',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
        },
      ],
    },

    // ── À PROPOS & STATISTIQUES ────────────────────────────────────────────────
    {
      name: 'apropos',
      type: 'group',
      label: '📊 Section À propos & Statistiques',
      fields: [
        {
          name: 'badge',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: "À propos de DT"' },
        },
        {
          name: 'titre',
          type: 'text',
          localized: true,
          admin: { description: 'Titre de la section' },
        },
        {
          name: 'texte',
          type: 'textarea',
          localized: true,
          admin: { description: 'Paragraphe de présentation de l\'entreprise' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Photo de l\'équipe ou des locaux' },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: { description: 'URL YouTube de la vidéo de présentation (optionnel)' },
        },
        {
          name: 'ctaTexte',
          type: 'text',
          localized: true,
          admin: { description: 'Texte du lien "En savoir plus"' },
        },
        {
          type: 'collapsible',
          label: '4 statistiques animées',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'stat1Valeur', type: 'number', admin: { width: '25%', description: 'Ex: 5000' } },
                { name: 'stat1Suffixe', type: 'text', localized: true, admin: { width: '25%', description: 'Ex: +' } },
                { name: 'stat1Label', type: 'text', localized: true, admin: { width: '50%', description: 'Ex: Déménagements réalisés' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'stat2Valeur', type: 'number', admin: { width: '25%', description: 'Ex: 15' } },
                { name: 'stat2Suffixe', type: 'text', localized: true, admin: { width: '25%', description: 'Ex: ans' } },
                { name: 'stat2Label', type: 'text', localized: true, admin: { width: '50%', description: 'Ex: D\'expérience' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'stat3Valeur', type: 'number', admin: { width: '25%', description: 'Ex: 24' } },
                { name: 'stat3Suffixe', type: 'text', localized: true, admin: { width: '25%', description: 'Ex: h' } },
                { name: 'stat3Label', type: 'text', localized: true, admin: { width: '50%', description: 'Ex: Délai de réponse' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'stat4Valeur', type: 'number', admin: { width: '25%', description: 'Ex: 98' } },
                { name: 'stat4Suffixe', type: 'text', localized: true, admin: { width: '25%', description: 'Ex: %' } },
                { name: 'stat4Label', type: 'text', localized: true, admin: { width: '50%', description: 'Ex: Clients satisfaits' } },
              ],
            },
          ],
        },
      ],
    },

    // ── POURQUOI NOUS CHOISIR ──────────────────────────────────────────────────
    {
      name: 'pourquoiNous',
      type: 'group',
      label: '🏆 Pourquoi Nous Choisir (4 cards)',
      fields: [
        {
          name: 'badge',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: "Pourquoi nous choisir"' },
        },
        {
          name: 'titre',
          type: 'text',
          localized: true,
          admin: { description: 'Titre de la section' },
        },
        {
          name: 'sousTitre',
          type: 'text',
          localized: true,
          admin: { description: 'Phrase sous le titre' },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Les 4 avantages',
          minRows: 4,
          maxRows: 4,
          fields: [
            {
              name: 'icone',
              type: 'text',
              admin: { description: 'Nom icône Lucide (zap, headphones, shield-check, users...)' },
            },
            {
              name: 'titre',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'description',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
        },
      ],
    },

    // ── CTA FINAL ─────────────────────────────────────────────────────────────
    {
      name: 'ctaFinal',
      type: 'group',
      label: '🚀 CTA Final (bannière de conversion)',
      fields: [
        {
          name: 'titre',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: "Prêt pour votre déménagement ?"' },
        },
        {
          name: 'sousTitre',
          type: 'text',
          localized: true,
          admin: { description: 'Sous-titre de la bannière CTA' },
        },
        {
          name: 'bouton1Texte',
          type: 'text',
          localized: true,
          admin: { description: 'Texte bouton principal (ex: "Devis gratuit")' },
        },
        {
          name: 'bouton2Texte',
          type: 'text',
          localized: true,
          admin: { description: 'Texte bouton téléphone (ex: "Nous appeler")' },
        },
        {
          name: 'garanties',
          type: 'array',
          label: 'Garanties (petits textes sous les boutons)',
          maxRows: 4,
          localized: true,
          fields: [
            { name: 'texte', type: 'text', required: true },
          ],
        },
      ],
    },

  ],
}

export default Homepage
