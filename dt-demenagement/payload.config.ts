import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

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
    user: 'clients',
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

  collections: [],
  // Les collections seront ajoutées en Phase 4 — Étapes 17-18

  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts'),
  },
})
