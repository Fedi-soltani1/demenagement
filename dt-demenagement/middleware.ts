import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATTERNS = [/^\/espace-client/, /^\/[a-z]{2}\/espace-client/]

// Vérifie la présence du cookie de session NextAuth (dev ou prod HTTPS)
function hasSessionCookie(req: NextRequest): boolean {
  return !!(
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token') ||
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token')
  )
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Maintenance mode check — avant toute autre logique
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api')
  const isMaintenancePage = pathname.startsWith('/maintenance')

  if (!isAdminRoute && !isMaintenancePage) {
    try {
      const settingsRes = await fetch(
        new URL('/api/globals/settings?depth=0', req.url).toString(),
        { next: { revalidate: 60 } }
      )
      if (settingsRes.ok) {
        const settings = await settingsRes.json() as { maintenanceMode?: boolean }
        if (settings.maintenanceMode === true) {
          return NextResponse.redirect(new URL('/maintenance', req.url))
        }
      }
    } catch { /* ne pas bloquer si fetch échoue */ }
  }

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
