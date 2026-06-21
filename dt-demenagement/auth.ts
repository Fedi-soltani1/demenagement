import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import Nodemailer from 'next-auth/providers/nodemailer'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import { authConfig } from './auth.config'
import { sendMail } from '@/lib/mailer'
import { buildMagicLinkEmail } from '@/lib/emails/magic-link'
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from '@/lib/auth-schema'

// Augmentation du type Session pour inclure l'id utilisateur
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
  }
}

// Singleton PostgreSQL — connexion séparée de Payload CMS
// Évite la multiplication des pools lors du hot-reload en développement
const globalWithAuthPg = globalThis as typeof globalThis & {
  _authPgClient: ReturnType<typeof postgres> | undefined
}

if (!globalWithAuthPg._authPgClient) {
  globalWithAuthPg._authPgClient = postgres(env.DATABASE_URL, {
    max: 2,
    idle_timeout: 20,
    ssl: { rejectUnauthorized: false },
  })
}

const authDb = drizzle(globalWithAuthPg._authPgClient)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(authDb, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),
  providers: [
    Nodemailer({
      server: {
        host:   env.SMTP_HOST,
        port:   env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      },
      from: env.EMAIL_FROM,
      sendVerificationRequest: async ({ url, identifier }) => {
        await sendMail({
          to:      identifier,
          subject: 'Votre lien de connexion — DT Déménagement',
          html:    buildMagicLinkEmail(url),
        })
      },
    }),
  ],
})
