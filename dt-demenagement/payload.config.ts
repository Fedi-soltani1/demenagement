import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

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
import Settings from './payload/collections/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? '',
    },
    // ⚠️ Configurer DATABASE_URL dans .env.local avant de lancer les migrations
    push: false,
    migrationDir: path.resolve(dirname, 'payload/migrations'),
  }),

  editor: lexicalEditor({}),

  admin: {
    user: 'admins',
    meta: {
      titleSuffix: '— DT Déménagement Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  localization: {
    locales: ['fr', 'ar', 'en'],
    defaultLocale: 'fr',
    fallback: true,
  },

  // 16 collections (15 métier + 1 admins)
  collections: [
    Admins,
    Media,
    Categories,
    Partners,
    Services,
    FAQ,
    Villes,
    Pays,
    Pages,
    Blog,
    Testimonials,
    GoogleReviews,
    Newsletter,
    Clients,
    Messages,
    Demenagements,
  ],

  // 1 global (singleton)
  globals: [Settings],

  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts'),
  },
})
