import { auth } from '@/auth'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants'

const intlMiddleware = createMiddleware(routing)

// Routes qui requièrent une session NextAuth valide
const PROTECTED_PATTERNS = [
  /^\/(?:fr|ar|en)\/espace-client/,
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATTERNS.some((p) => p.test(pathname))

  if (isProtected && !req.auth) {
    // Extraire la locale du pathname (ex: /ar/espace-client → ar)
    const segment = pathname.split('/')[1] ?? ''
    const locale = (LOCALES as readonly string[]).includes(segment)
      ? segment
      : DEFAULT_LOCALE
    const loginUrl = new URL(`/${locale}/connexion`, req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  // next-intl gère le routing i18n pour toutes les autres routes
  return intlMiddleware(req)
})

export const config = {
  // Exclure : /admin (Payload CMS), /api, /_next, fichiers statiques
  matcher: ['/((?!admin|api|_next|.*\\..*).*)',],
}
