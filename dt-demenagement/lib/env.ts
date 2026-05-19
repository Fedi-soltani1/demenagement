import { z } from 'zod'

// Validation des variables d'environnement au démarrage.
// Si une variable est manquante, l'application plante immédiatement — pas en runtime.
const envSchema = z.object({
  // Base de données — obligatoire
  DATABASE_URL: z.string().min(1),

  // Payload CMS — obligatoire
  PAYLOAD_SECRET: z.string().min(32),

  // NextAuth v5 — obligatoire
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_SERVER_URL: z.string().min(1),

  // Emails (Resend) — optionnel en dev local
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default(''),
  EMAIL_DEVIS_TO: z.string().optional().default(''),

  // Cloudinary — optionnel en dev local
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // Google Places (avis) — optionnel en dev local
  GOOGLE_PLACES_API_KEY: z.string().optional().default(''),
  GOOGLE_PLACE_ID: z.string().optional().default(''),

  // Instagram — optionnel en dev local
  INSTAGRAM_ACCESS_TOKEN: z.string().optional().default(''),
  INSTAGRAM_USER_ID: z.string().optional().default(''),

  // Brevo (newsletter) — optionnel en dev local
  BREVO_API_KEY: z.string().optional().default(''),
  BREVO_LIST_ID: z.string().optional().default('1'),

  // Upstash (anti-spam) — optionnel en dev local
  UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),

  // Sentry — optionnel en dev local
  SENTRY_DSN: z.string().optional().default(''),

  // Cron
  CRON_SECRET: z.string().min(1),
})

// Variables publiques (NEXT_PUBLIC_*) — validées séparément
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SERVER_URL: z.string().min(1),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_GA4_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(1),
  NEXT_PUBLIC_WHATSAPP_MESSAGE: z.string().min(1),
})

// Pas de validation au build (CI sans .env.local) — uniquement en runtime serveur
const isServer = typeof window === 'undefined'

export const env = isServer
  ? envSchema.parse(process.env)
  : ({} as z.infer<typeof envSchema>)

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_WHATSAPP_MESSAGE: process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE,
})
