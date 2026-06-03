import type { Block, CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isEditor } from '../access/isEditor'
import { HeroBlock }           from '../blocks/HeroBlock'
import { MiniFeaturesBlock }   from '../blocks/MiniFeaturesBlock'
import { ServicesBlock }       from '../blocks/ServicesBlock'
import { AboutBlock }          from '../blocks/AboutBlock'
import { StatsBlock }          from '../blocks/StatsBlock'
import { WhyUsBlock }          from '../blocks/WhyUsBlock'
import { TestimonialsBlock }   from '../blocks/TestimonialsBlock'
import { GoogleReviewsBlock }  from '../blocks/GoogleReviewsBlock'
import { PartnersBlock }       from '../blocks/PartnersBlock'
import { BlogPreviewBlock }    from '../blocks/BlogPreviewBlock'
import { CTABlock }            from '../blocks/CTABlock'
import { FAQBlock }            from '../blocks/FAQBlock'
import { MapBlock }            from '../blocks/MapBlock'
import { GalleryBlock }        from '../blocks/GalleryBlock'
import { VideoBlock }          from '../blocks/VideoBlock'
import { InstagramFeedBlock }  from '../blocks/InstagramFeedBlock'
import { NewsletterBlock }     from '../blocks/NewsletterBlock'
import { CustomBlock }         from '../blocks/CustomBlock'
import { ProcessBlock }        from '../blocks/ProcessBlock'
import { PricingBlock }        from '../blocks/PricingBlock'
import { BadgeBlock }          from '../blocks/BadgeBlock'
import { TitreBlock }          from '../blocks/TitreBlock'
import { TexteBlock }          from '../blocks/TexteBlock'
import { BoutonsBlock }        from '../blocks/BoutonsBlock'

// Adds dbName shortcuts so _services_v_ enum names stay ≤ 63 chars (PostgreSQL limit).
function withShortSectionOptions(block: Block): Block {
  const cloned = JSON.parse(JSON.stringify(block)) as Block
  const fields = cloned.fields as Array<Record<string, unknown>>
  const grp = fields.find((f) => f['name'] === 'sectionOptions') as
    | { fields?: Array<Record<string, unknown>> }
    | undefined
  if (grp?.fields) {
    for (const f of grp.fields) {
      if (f['name'] === 'espacement') f['dbName'] = 'esp'
      if (f['name'] === 'hauteurMin')  f['dbName'] = 'haut'
      if (f['name'] === 'visibilite') f['dbName'] = 'vis'
    }
  }
  return cloned
}

const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    group: '📝 Contenu du site',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'tarifDepuis', 'publie', 'ordre'],
    description: 'Services proposés par DT Déménagement. Chaque service a une page détail entièrement personnalisable par blocs (comme Elementor).',
    preview: (doc, { locale }) => {
      const base   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const secret = process.env.PAYLOAD_SECRET ?? ''
      const slug   = (doc.slug as string) ?? ''
      const loc    = (locale as string) ?? 'fr'
      return `${base}/api/draft?secret=${secret}&collection=services&slug=${slug}&locale=${loc}`
    },
  },

  versions: {
    drafts: true,
  },

  fields: [
    // ── Champs de listing (SEO + cartes) ────────────────────────────────────
    {
      name: 'nom',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Nom du service — affiché dans les cartes et la navbar' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: "Identifiant URL (ex: transporteur-en-tunisie)" },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Court résumé (1-2 phrases) — affiché dans les cartes et méta description par défaut' },
    },
    {
      name: 'icone',
      type: 'text',
      required: true,
      admin: { description: "Nom icône Lucide (ex: truck, building, crane, warehouse, package, wrench) — lucide.dev" },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image héro automatique en haut de la page service (16:9 recommandé)' },
    },
    {
      name: 'tarifDepuis',
      type: 'number',
      admin: { description: 'Prix de départ en TND (optionnel — affiché sur la carte de listing)' },
    },
    {
      name: 'ordre',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Ordre d\'affichage dans les listes (plus petit = en premier)' },
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Décocher pour masquer ce service du site (garde le brouillon)' },
    },

    // ── Blocs de contenu libre (Elementor-like) ──────────────────────────────
    // Note : l'ancien groupe heroCtaGroupe a été supprimé — remplacé par le bloc
    // Boutons (atomique) dans le page builder ci-dessous. Zéro doublon.
    {
      name: 'blocks',
      type: 'blocks',
      label: '🧱 Blocs de contenu de la page',
      admin: {
        description: 'Construire le contenu de la page service bloc par bloc. L\'admin peut ajouter, supprimer, réordonner et activer/désactiver chaque bloc individuellement. Prévisualisation en temps réel disponible avec le bouton "Aperçu".',
      },
      blocks: [
        BadgeBlock,
        TitreBlock,
        TexteBlock,
        BoutonsBlock,
        HeroBlock,
        MiniFeaturesBlock,
        ServicesBlock,
        AboutBlock,
        StatsBlock,
        WhyUsBlock,
        TestimonialsBlock,
        GoogleReviewsBlock,
        PartnersBlock,
        BlogPreviewBlock,
        CTABlock,
        FAQBlock,
        MapBlock,
        GalleryBlock,
        VideoBlock,
        InstagramFeedBlock,
        NewsletterBlock,
        CustomBlock,
        ProcessBlock,
        PricingBlock,
      ].map(withShortSectionOptions),
    },

    // ── SEO ──────────────────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Partage',
      fields: [
        { name: 'metaTitle',       type: 'text',     localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage',         type: 'upload',   relationTo: 'media' },
        {
          name: 'robots',
          type: 'group',
          fields: [
            { name: 'index',  type: 'checkbox', defaultValue: true },
            { name: 'follow', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
  ],
}

export default Services
