import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATTERNS = [/^\/espace-client/]

// Vérifie la présence du cookie de session NextAuth (dev ou prod HTTPS)
function hasSessionCookie(req: NextRequest): boolean {
  return !!(
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token') ||
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token')
  )
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PATTERNS.some((p) => p.test(pathname))

  if (isProtected && !hasSessionCookie(req)) {
    const loginUrl = new URL('/connexion', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)',],
}
