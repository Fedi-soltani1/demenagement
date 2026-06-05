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
import { BoutonsBlock }        from '../blocks/BoutonsBlock'
import { ImageBlock }          from '../blocks/ImageBlock'
import { RichTextBlock }       from '../blocks/RichTextBlock'
import { ListeBlock }          from '../blocks/ListeBlock'
import { EspaceurBlock }       from '../blocks/EspaceurBlock'
import { SeparateurBlock }     from '../blocks/SeparateurBlock'
import { MediaTexteBlock }     from '../blocks/MediaTexteBlock'
import { CartesBlock }         from '../blocks/CartesBlock'
import { EncadreBlock }        from '../blocks/EncadreBlock'
import { AccordeonBlock }      from '../blocks/AccordeonBlock'
import { CoordonneesBlock }    from '../blocks/CoordonneesBlock'
import { ReseauxBlock }        from '../blocks/ReseauxBlock'
import { FormulaireBlock }     from '../blocks/FormulaireBlock'

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

  // Onglets PRÉSENTATIONNELS (sans name) → séparent visuellement DONNÉES et PAGE
  // dans l'admin, SANS changer la structure de la base (champs au niveau racine).
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────────────────────────────────────────────────
        {
          label: '📊 Infos & SEO',
          description: 'Données du service — utilisées dans les cartes (listes), le SEO Google et le fil d\'ariane. Ce n\'est PAS la mise en page : la page visible se construit dans l\'onglet « Page ».',
          fields: [
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
              admin: { description: 'Image de partage / carte (16:9 recommandé)' },
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
        },
        // ─────────────────────────────────────────────────────────────────────
        {
          label: '🧱 Page',
          description: 'La page visible, composée bloc par bloc (Elementor-like). Ajouter, supprimer, réordonner et activer/désactiver chaque bloc. Aperçu temps réel via le bouton « Aperçu ».',
          fields: [
            {
              name: 'blocks',
              type: 'blocks',
              label: 'Blocs de contenu de la page',
              blocks: [
                BadgeBlock,
                TitreBlock,
                BoutonsBlock,
                ImageBlock,
                RichTextBlock,
                ListeBlock,
                EspaceurBlock,
                SeparateurBlock,
                MediaTexteBlock,
                CartesBlock,
                EncadreBlock,
                AccordeonBlock,
                CoordonneesBlock,
                ReseauxBlock,
                FormulaireBlock,
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
          ],
        },
      ],
    },
  ],
}

export default Services
