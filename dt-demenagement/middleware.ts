import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Traiter toutes les routes SAUF :
    // - /admin et sous-routes (Payload CMS)
    // - /api et sous-routes (REST API Payload)
    // - /_next (assets Next.js)
    // - Fichiers statiques avec extension (favicon.ico, *.png, *.svg, etc.)
    '/((?!admin|api|_next|.*\\..*).*)',
  ],
}
