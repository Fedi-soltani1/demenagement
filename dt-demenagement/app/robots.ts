import type { MetadataRoute } from 'next'
import { COMPANY } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/admin',
          '/api/',
          '/*/espace-client/',
          '/*/connexion',
          '/*/mentions-legales',
          '/*/politique-confidentialite',
          '/*/politique-cookies',
        ],
      },
    ],
    sitemap: `${COMPANY.siteUrl}/sitemap.xml`,
    host:    COMPANY.siteUrl,
  }
}
