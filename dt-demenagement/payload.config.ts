import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import nodemailer from 'nodemailer'

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

// Tables NextAuth (gérées par @auth/drizzle-adapter, hors Payload).
// Déclarées dans le schéma Drizzle de Payload pour que `push` ne les supprime JAMAIS.
// → Corrige le bug historique : push voulait drop auth_users/auth_sessions/etc.
import { authUsers, authAccounts, authSessions, authVerificationTokens } from './lib/auth-schema'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000',

  secret: process.env.PAYLOAD_SECRET ?? '',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? '',
      ssl: { rejectUnauthorized: false },
    },
    push: false,
    migrationDir: path.resolve(dirname, 'payload/migrations'),
    // Enregistre les tables NextAuth dans le schéma Drizzle pour que push ne les drop pas
    beforeSchemaInit: [
      ({ schema }) => ({
        ...schema,
        tables: {
          ...schema.tables,
          authUsers,
          authAccounts,
          authSessions,
          authVerificationTokens,
        },
      }),
    ],
  }),

  // Éditeur par défaut : barre d'outils INLINE (apparaît quand on sélectionne du
  // texte) + toutes les fonctionnalités. La barre FIXE (FixedToolbarFeature) est
  // évitée car elle provoque une boucle « Maximum update depth » quand les champs
  // richText sont dans des blocs imbriqués (notre page builder) — bug confirmé 2×.
  editor: lexicalEditor({}),

  admin: {
    user: 'admins',
    theme: 'all',
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
      header:         ['@/components/payload/AdminHeaderBar'],
      afterDashboard: ['@/components/payload/AdminDashboard'],
      views: {
        rdvCalendar: {
          Component: '@/components/payload/RDVCalendarView',
          path: '/rdv-calendar',
        },
      },
    },
    livePreview: {
      url: ({
        data,
        collectionConfig,
        locale,
      }: {
        data: { slug?: string }
        locale: { code: string }
        collectionConfig?: { slug: string }
      }) => {
        const base   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        const secret = process.env.PAYLOAD_SECRET ?? ''
        const slug   = data.slug ?? ''
        const col    = collectionConfig?.slug
        const loc    = locale?.code ?? 'fr'
        const draft  = `${base}/api/draft?secret=${secret}&locale=${loc}`

        if (col === 'services') return `${draft}&collection=services&slug=${slug}`
        if (col === 'blog')     return `${draft}&collection=blog&slug=${slug}`
        if (col === 'villes')   return `${draft}&collection=villes&slug=${slug}`
        return `${draft}&collection=pages&slug=${slug}`
      },
      collections: ['pages', 'services', 'blog', 'villes'],
      breakpoints: [
        { label: 'Mobile',   name: 'mobile',  width: 375,  height: 812  },
        { label: 'Tablette', name: 'tablet',  width: 768,  height: 1024 },
        { label: 'Desktop',  name: 'desktop', width: 1440, height: 900  },
      ],
    },
  },

  localization: {
    locales: ['fr'],
    defaultLocale: 'fr',
    fallback: true,
  },

  // 17 collections — ordered to drive sidebar group order
  collections: [
    // 🚚 Opérations (daily use — always first)
    Demenagements,
    Messages,
    RendezVous,

    // 👥 Utilisateurs
    Clients,
    Admins,

    // 📝 Contenu du site
    Pages,
    Services,
    Blog,
    FAQ,
    Categories,

    // ⭐ Avis & Réputation
    Testimonials,
    GoogleReviews,
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

  email: () => {
    const transport = nodemailer.createTransport({
      host:   process.env.SMTP_HOST ?? 'smtp.hostinger.com',
      port:   Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    })
    return {
      name:               'hostinger-smtp',
      defaultFromAddress: process.env.SMTP_USER ?? 'contact@demenagement.tn',
      defaultFromName:    'DT Déménagement Tunisie',
      sendEmail:          (msg: Parameters<typeof transport.sendMail>[0]) =>
        transport.sendMail(msg),
    }
  },

  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts'),
  },
})
