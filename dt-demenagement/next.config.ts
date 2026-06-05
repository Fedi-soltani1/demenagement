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
  // Packages Node.js purs — jamais bundlés par webpack pour le browser
  serverExternalPackages: [
    'postgres',
    'pg',
    'pg-native',
    'drizzle-orm',
    '@auth/drizzle-adapter',
    '@payloadcms/db-postgres',
    '@react-pdf/renderer',
  ],

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
      { source: '/nos-services/transporteur-en-tunisie', destination: '/services/transporteur-en-tunisie', permanent: true },
      { source: '/nos-services/gardes-meubles', destination: '/services/gardes-meubles', permanent: true },
      { source: '/nos-services/location-monte-meubles', destination: '/services/location-monte-meubles', permanent: true },
      { source: '/nos-services/services-emballage', destination: '/services/services-emballage', permanent: true },
      { source: '/nos-services/montage-demontage', destination: '/services/montage-demontage', permanent: true },
      { source: '/nos-services/transfert-entreprises', destination: '/services/transfert-entreprises', permanent: true },
      // Entreprise
      { source: '/demenagement-pour-les-entreprises-en-tunisie', destination: '/services', permanent: true },
      { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-bureau-entreprise', destination: '/services/transfert-entreprises', permanent: true },
      { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-industriel', destination: '/services/transfert-entreprises', permanent: true },
      { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-ministere', destination: '/services/transfert-entreprises', permanent: true },
      // Particulier
      { source: '/demenagement-particulier', destination: '/services', permanent: true },
      { source: '/demenagement-particulier/demenagement-de-villa', destination: '/services/transporteur-en-tunisie', permanent: true },
      { source: '/demenagement-particulier/demenagement-dappartement', destination: '/services/transporteur-en-tunisie', permanent: true },
      // 24 villes nationales
      { source: '/national/demenagement-a-tunis', destination: '/villes/tunis', permanent: true },
      { source: '/national/demenagement-a-ariana', destination: '/villes/ariana', permanent: true },
      { source: '/national/demenagement-a-ben-arous', destination: '/villes/ben-arous', permanent: true },
      { source: '/national/demenagement-a-la-manouba', destination: '/villes/la-manouba', permanent: true },
      { source: '/national/demenagement-a-zaghouan', destination: '/villes/zaghouan', permanent: true },
      { source: '/national/demenagement-a-nabeul', destination: '/villes/nabeul', permanent: true },
      { source: '/national/demenagement-a-kasserine', destination: '/villes/kasserine', permanent: true },
      { source: '/national/demenagement-a-sidi-bouzid', destination: '/villes/sidi-bouzid', permanent: true },
      { source: '/national/demenagement-a-sousse', destination: '/villes/sousse', permanent: true },
      { source: '/national/demenagement-a-monastir', destination: '/villes/monastir', permanent: true },
      { source: '/national/demenagement-a-mahdia', destination: '/villes/mahdia', permanent: true },
      { source: '/national/demenagement-a-sfax', destination: '/villes/sfax', permanent: true },
      { source: '/national/demenagement-a-bizerte', destination: '/villes/bizerte', permanent: true },
      { source: '/national/demenagement-a-beja', destination: '/villes/beja', permanent: true },
      { source: '/national/demenagement-a-jendouba', destination: '/villes/jendouba', permanent: true },
      { source: '/national/demenagement-a-le-kef', destination: '/villes/le-kef', permanent: true },
      { source: '/national/demenagement-a-siliana', destination: '/villes/siliana', permanent: true },
      { source: '/national/demenagement-a-kairouan', destination: '/villes/kairouan', permanent: true },
      { source: '/national/demenagement-a-gafsa', destination: '/villes/gafsa', permanent: true },
      { source: '/national/demenagement-a-tozeur', destination: '/villes/tozeur', permanent: true },
      { source: '/national/demenagement-a-kebili', destination: '/villes/kebili', permanent: true },
      { source: '/national/demenagement-a-gabes', destination: '/villes/gabes', permanent: true },
      { source: '/national/demenagement-a-medenine', destination: '/villes/medenine', permanent: true },
      { source: '/national/demenagement-a-tataouine', destination: '/villes/tataouine', permanent: true },
      // 9 pays internationaux
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-france', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-allemagne', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-belgique', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-italie', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-luxembourg', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-portugal', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-suede', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-espagne', destination: '/zones', permanent: true },
      { source: '/demenagement-tunisie-et-international/demenagement-tunisie-malte', destination: '/zones', permanent: true },
      // Pages générales
      { source: '/devis-gratuit', destination: '/devis', permanent: true },
      // (Pas de redirection /contact ni /blog : ces pages existent et sont servies
      //  directement par le routing i18n. Une règle source === destination créait une
      //  boucle de redirection infinie — supprimée.)
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
