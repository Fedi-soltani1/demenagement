import type { CollectionConfig } from 'payload'
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

const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },

  access: {
    read: () => true,
    create: isAdmin,
    update: isEditor,
    delete: isAdmin,
  },

  admin: {
    group: '📝 Contenu du site',
    useAsTitle: 'slug',
    defaultColumns: ['titre', 'slug', 'publie'],
    description: 'Pages du site (accueil, à propos, contact…). Cliquer sur une page pour modifier ses blocs.',
    preview: (doc) => {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        const slug = doc.slug as string
        if (slug === 'accueil' || !slug) return `${base}/fr`
        return `${base}/fr/${slug}`
      },
  },

  versions: {
    drafts: true,
  },

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
      name: 'layout',
      type: 'blocks',
      label: 'Blocs de contenu',
      blocks: [
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
      ],
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
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
}

export default Pages
