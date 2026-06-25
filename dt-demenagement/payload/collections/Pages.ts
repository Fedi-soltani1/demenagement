import type { CollectionConfig } from 'payload'
import { isSeo } from '../access/isEditor'
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

const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },

  access: {
    read: () => true,
    create: isSeo,
    update: isSeo,
    delete: isSeo,
  },

  admin: {
    // Contenu → visible UNIQUEMENT pour le SEO (caché du super-admin).
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'seo',
    group: '📝 Contenu du site',
    useAsTitle: 'slug',
    defaultColumns: ['titre', 'slug', 'publie'],
    description: 'Pages du site (accueil, à propos, contact…). Cliquer sur une page pour modifier ses blocs.',
    preview: (doc, { locale }) => {
        const base   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        const secret = process.env.PAYLOAD_SECRET ?? ''
        const slug   = (doc.slug as string) ?? ''
        const loc    = (locale as string) ?? 'fr'
        return `${base}/api/draft?secret=${secret}&collection=pages&slug=${slug}&locale=${loc}`
      },
  },

  versions: {
    drafts: true,
  },

  // Onglets PRÉSENTATIONNELS (sans name) → séparent DONNÉES/SEO et PAGE dans l'admin,
  // sans changer la structure de la base. Identique au pattern Services/Villes.
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────────────────────────────────────────────────
        {
          label: '📊 Infos & SEO',
          description: 'Données de la page — identifiant, SEO Google, publication. Ce n\'est PAS la mise en page : la page se construit dans l\'onglet « Page ».',
          fields: [
            {
              name: 'titre',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: { description: 'Identifiant URL (ex: accueil, a-propos, contact)' },
            },
            {
              name: 'publie',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'seo',
              type: 'group',
              label: 'SEO & Partage',
              fields: [
                { name: 'metaTitle', type: 'text', localized: true },
                { name: 'metaDescription', type: 'textarea', localized: true },
                { name: 'ogImage', type: 'upload', relationTo: 'media' },
                {
                  name: 'robots',
                  type: 'group',
                  fields: [
                    { name: 'index', type: 'checkbox', defaultValue: true },
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
          description: 'La page visible, composée bloc par bloc (Elementor-like). Aperçu temps réel via le bouton « Aperçu ».',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Blocs de contenu',
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
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default Pages
