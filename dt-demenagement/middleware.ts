import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'

// Auth Edge-safe — utilise authConfig (pas de DrizzleAdapter, pas de postgres)
const { auth } = NextAuth(authConfig)

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATTERNS = [
  /^\/espace-client/,
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATTERNS.some((p) => p.test(pathname))

  if (isProtected && !req.auth) {
    const loginUrl = new URL('/connexion', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)',],
}
