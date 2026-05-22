import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'

import Admins from './payload/collections/Admins'
import Media from './payload/collections/Media'
import Categories from './payload/collections/Categories'
import Partners from './payload/collections/Partners'
import Services from './payload/collections/Services'
import FAQ from './payload/collections/FAQ'
import Villes from './payload/collections/Villes'
import Pays from './payload/collections/Pays'
import Pages from './payload/collections/Pages'
import Blog from './payload/collections/Blog'
import Testimonials from './payload/collections/Testimonials'
import GoogleReviews from './payload/collections/GoogleReviews'
import Newsletter from './payload/collections/Newsletter'
import Clients from './payload/collections/Clients'
import Messages from './payload/collections/Messages'
import Demenagements from './payload/collections/Demenagements'
import RendezVous from './payload/collections/RendezVous'
import Settings from './payload/collections/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? '',
      ssl: { rejectUnauthorized: false },
    },
    push: false,
    migrationDir: path.resolve(dirname, 'payload/migrations'),
  }),

  editor: lexicalEditor({}),

  admin: {
    user: 'admins',
    theme: 'auto',
    meta: {
      titleSuffix: '— DT Déménagement Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/payload/AdminLogo',
        Icon: '@/components/payload/AdminIcon',
      },
      afterDashboard:  ['@/components/payload/AdminDashboard'],
      beforeNavLinks:  ['@/components/payload/CalendarNavLink'],
      views: {
        rdvCalendar: {
          Component: '@/components/payload/RDVCalendarView',
          path: '/rdv-calendar',
        },
      },
    },
  },

  localization: {
    locales: ['fr', 'ar', 'en'],
    defaultLocale: 'fr',
    fallback: true,
  },

  // 17 collections — ordered to drive sidebar group order
  collections: [
    // 🚚 Opérations (daily use — always first)
    Demenagements,
    RendezVous,
    Messages,

    // 👥 Utilisateurs
    Clients,
    Admins,

    // 📝 Contenu du site
    Pages,
    Blog,
    Services,
    FAQ,
    Categories,

    // ⭐ Avis & Réputation
    GoogleReviews,
    Testimonials,
    Partners,

    // 📧 Marketing
    Newsletter,

    // 📍 Zones d'intervention
    Villes,
    Pays,

    // 🖼️ Médias
    Media,
  ],

  // 1 global (singleton)
  globals: [Settings],

  sharp,

  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    defaultFromName: 'DT Déménagement Tunisie',
    apiKey: process.env.RESEND_API_KEY ?? '',
  }),

  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts'),
  },
})
