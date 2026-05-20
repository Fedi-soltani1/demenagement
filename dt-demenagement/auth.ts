import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import { DEFAULT_LOCALE } from '@/lib/constants'
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
    ssl: 'require',
  })
}

const authDb = drizzle(globalWithAuthPg._authPgClient)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(authDb, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),
  providers: [
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      name: 'Magic Link',
    }),
  ],
  pages: {
    signIn: `/${DEFAULT_LOCALE}/connexion`,
    verifyRequest: `/${DEFAULT_LOCALE}/connexion?verify=1`,
    error: `/${DEFAULT_LOCALE}/connexion`,
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
