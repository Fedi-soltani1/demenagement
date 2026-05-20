import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { getPayload } from 'payload'
import config from '@payload-config'
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
  session: { strategy: 'jwt' },
  providers: [
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      name: 'Magic Link',
      // Dev local : lien affiché dans le terminal — marche avec n'importe quelle adresse
      // En prod : undefined → Resend envoie un vrai email (domaine vérifié requis)
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
  pages: {
    signIn: `/${DEFAULT_LOCALE}/connexion`,
    verifyRequest: `/${DEFAULT_LOCALE}/connexion?verify=1`,
    error: `/${DEFAULT_LOCALE}/connexion`,
  },
  callbacks: {
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub
      return session
    },
  },

  events: {
    async signIn({ user }) {
      const email = user.email
      if (!email) return

      try {
        const payload = await getPayload({ config })

        const existing = await payload.find({
          collection: 'clients',
          where: { email: { equals: email } },
          limit: 1,
          overrideAccess: true,
        })

        if (existing.totalDocs === 0) {
          // Dériver prenom/nom depuis le préfixe email — le client peut les modifier ensuite
          const prefix = email.split('@')[0] ?? email
          const parts   = prefix.replace(/[._-]+/g, ' ').trim().split(' ')
          const prenom  = parts[0] ?? '—'
          const nom     = parts.slice(1).join(' ') || '—'

          await payload.create({
            collection: 'clients',
            data: { email, prenom, nom },
            overrideAccess: true,
          })
        }
      } catch (err) {
        // Non bloquant — la connexion réussit même si la création échoue
        console.error('[auth] Erreur création client Payload :', err)
      }
    },
  },
})
