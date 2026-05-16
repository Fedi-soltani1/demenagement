import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSentryConfig } from '@sentry/nextjs'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const nextConfig: NextConfig = {
  // Alias Turbopack — nécessaire pour que Payload résolve @payload-config
  turbopack: {
    resolveAlias: {
      '@payload-config': './payload.config.ts',
    },
  },

  // Headers de sécurité sur toutes les routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Redirections 301 depuis l'ancien site WordPress
  async redirects() {
    return [
      // Services
      { source: '/nos-services/transporteur-en-tunisie', destination: '/fr/services/transporteur-en-tunisie', permanent: true },
      { source: '/nos-services/gardes-meubles', destination: '/fr/services/gardes-meubles', permanent: true },
      { source: '/nos-services/location-monte-meubles', destination: '/fr/services/location-monte-meubles', permanent: true },
      { source: '/nos-services/services-emballage', destination: '/fr/services/services-emballage', permanent: true },
      { source: '/nos-services/montage-demontage', destination: '/fr/services/montage-demontage', permanent: true },
      { source: '/nos-services/transfert-entreprises', destination: '/fr/services/transfert-entreprises', permanent: true },
      // Entreprise
      { source: '/demenagement-pour-les-entreprises-en-tunisie', destination: '/fr/entreprise', permanent: true },
      { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-bureau-entreprise', destination: '/fr/entreprise/demenagement-bureau-entreprise', permanent: true },
      { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-industriel', destination: '/fr/entreprise/demenagement-industriel', permanent: true },
      { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-ministere', destination: '/fr/entreprise/demenagement-ministere', permanent: true },
      // Particulier
      { source: '/demenagement-particulier', destination: '/fr/particulier', permanent: true },
      { source: '/demenagement-particulier/demenagement-de-villa', destination: '/fr/particulier/demenagement-de-villa', permanent: true },
      { source: '/demenagement-particulier/demenagement-dappartement', destination: '/fr/particulier/demenagement-dappartement', permanent: true },
      // 24 villes nationales
      { source: '/national/demenagement-a-tunis', destination: '/fr/national/tunis', permanent: true },
      { source: '/national/demenagement-a-ariana', destination: '/fr/national/ariana', permanent: true },
      { source: '/national/demenagement-a-ben-arous', destination: '/fr/national/ben-arous', permanent: true },
      { source: '/national/demenagement-a-la-manouba', destination: '/fr/national/la-manouba', permanent: true },
      { source: '/national/demenagement-a-zaghouan', destination: '/fr/national/zaghouan', permanent: true },
      { source: '/national/demenagement-a-nabeul', destination: '/fr/national/nabeul', permanent: true },
      { source: '/national/demenagement-a-kasserine', destination: '/fr/national/kasserine', permanent: true },
      { source: '/national/demenagement-a-sidi-bouzid', destination: '/fr/national/sidi-bouzid', permanent: true },
      { source: '/national/demenagement-a-sousse', destination: '/fr/national/sousse', permanent: true },
      { source: '/national/demenagement-a-monastir', destination: '/fr/national/monastir', permanent: true },
      { source: '/national/demenagement-a-mahdia', destination: '/fr/national/mahdia', permanent: true },
      { source: '/national/demenagement-a-sfax', destination: '/fr/national/sfax', permanent: true },
      { source: '/national/demenagement-a-bizerte', destination: '/fr/national/bizerte', permanent: true },
      { source: '/national/demenagement-a-beja', destination: '/fr/national/beja', permanent: true },
      { source: '/national/demenagement-a-jendouba', destination: '/fr/national/jendouba', permanent: true },
      { source: '/national/demenagement-a-le-kef', destination: '/fr/national/le-kef', permanent: true },
      { source: '/national/demenagement-a-siliana', destination: '/fr/national/siliana', permanent: true },
      { source: '/national/demenagement-a-kairouan', destination: '/fr/national/kairouan', permanent: true },
      { source: '/national/demenagement-a-gafsa', destination: '/fr/national/gafsa', permanent: true },
      { source: '/national/demenagement-a-tozeur', destination: '/fr/national/tozeur', permanent: true },
      { source: '/national/demenagement-a-kebili', destination: '/fr/national/kebili', permanent: true },
      { source: '/national/demenagement-a-gabes', destination: '/fr/national/gabes', permanent: true },
      { source: '/national/demenagement-a-medenine', destination: '/fr/national/medenine', permanent: true },
      { source: '/national/demenagement-a-tataouine', destination: '/fr/national/tataouine', permanent: true },
      // 9 pays internationaux
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-france', destination: '/fr/international/france', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-allemagne', destination: '/fr/international/allemagne', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-belgique', destination: '/fr/international/belgique', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-italie', destination: '/fr/international/italie', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-luxembourg', destination: '/fr/international/luxembourg', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-portugal', destination: '/fr/international/portugal', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-suede', destination: '/fr/international/suede', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-espagne', destination: '/fr/international/espagne', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-malte', destination: '/fr/international/malte', permanent: true },
      // Pages générales
      { source: '/devis-gratuit', destination: '/fr/devis', permanent: true },
      { source: '/contact', destination: '/fr/contact', permanent: true },
      { source: '/blog', destination: '/fr/blog', permanent: true },
    ]
  },

  // Domaines autorisés pour next/image
  images: {
    remotePatterns: [
      // Payload media local (dev)
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdninstagram.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
        pathname: '/**',
      },
    ],
  },

  // Bundle analyzer (activé via ANALYZE=true)
  ...(process.env.ANALYZE === 'true'
    ? {
        // Sera configuré avec @next/bundle-analyzer
      }
    : {}),
}

const baseConfig = withNextIntl(withPayload(nextConfig))

export default baseConfig

// export default withSentryConfig(baseConfig, {
//   org:     process.env.SENTRY_ORG,
//   project: process.env.SENTRY_PROJECT,
//   silent:  true,
//   webpack: { treeshake: { removeDebugLogging: true } },
// })
