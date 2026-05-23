import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants'

// Auth Edge-safe — utilise authConfig (pas de DrizzleAdapter, pas de postgres)
const { auth } = NextAuth(authConfig)

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATTERNS = [
  /^\/(?:fr|ar|en)\/espace-client/,
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATTERNS.some((p) => p.test(pathname))

  if (isProtected && !req.auth) {
    const segment = pathname.split('/')[1] ?? ''
    const locale = (LOCALES as readonly string[]).includes(segment)
      ? segment
      : DEFAULT_LOCALE
    const loginUrl = new URL(`/${locale}/connexion`, req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)',],
}
