import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import { authConfig } from './auth.config'
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
  ...authConfig,
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
      sendVerificationRequest: process.env.NODE_ENV === 'development'
        ? async ({ url, identifier }: { url: string; identifier: string }) => {
            console.log('\n🔑 MAGIC LINK ────────────────────────────────')
            console.log(`   Email : ${identifier}`)
            console.log(`   Lien  : ${url}`)
            console.log('──────────────────────────────────────────────\n')
          }
        : undefined,
    }),
  ],
})
