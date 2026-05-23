import type { NextAuthConfig } from 'next-auth'

// Config Edge-compatible — importée UNIQUEMENT par middleware.ts
// Pas de DrizzleAdapter, pas de postgres, pas d'import Node.js
export const authConfig = {
  session: { strategy: 'jwt' as const },
  pages: {
    signIn:        '/connexion',
    verifyRequest: '/connexion?verify=1',
    error:         '/connexion',
  },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub
      return session
    },
  },
} satisfies NextAuthConfig
