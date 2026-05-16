import type { Metadata } from 'next'
import { COMPANY, LOCALES } from '@/lib/constants'

const BASE = COMPANY.siteUrl

/**
 * Construit les métadonnées Next.js complètes pour une page :
 * title, description, openGraph, twitter:card, canonical, alternates hreflang.
 */
export function buildMetadata({
  title,
  description,
  path,
  locale,
  image,
}: {
  title:       string
  description: string
  path:        string  // ex: '/services/demenagement-local' (sans locale ni domaine)
  locale:      string
  image?:      string | null
}): Partial<Metadata> {
  const canonical = `${BASE}/${locale}${path}`
  const ogImage   = image ?? `${BASE}/og-default.jpg`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE}/${l}${path}`])
      ),
    },
    openGraph: {
      title,
      description,
      url:    canonical,
      locale: locale === 'ar' ? 'ar_TN' : locale === 'en' ? 'en_US' : 'fr_FR',
      type:   'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [ogImage],
    },
  }
}

/** Schema.org LocalBusiness JSON-LD — injecté sur la homepage */
export function localBusinessSchema() {
  return {
    '@context':   'https://schema.org',
    '@type':      'MovingCompany',
    name:         COMPANY.name,
    url:          BASE,
    telephone:    COMPANY.phone1,
    email:        COMPANY.email,
    address: {
      '@type':          'PostalAddress',
      addressLocality:  'Tunis',
      addressCountry:   'TN',
    },
    areaServed: {
      '@type': 'Country',
      name:    'Tunisia',
    },
    sameAs: [
      COMPANY.facebook,
      COMPANY.instagram,
    ],
    priceRange:   '$$',
    openingHours: 'Mo-Sa 08:00-18:00',
  }
}

/** Schema.org Service JSON-LD — injecté sur les pages services/[slug] */
export function serviceSchema({
  name,
  description,
  url,
  image,
}: {
  name:        string
  description: string
  url:         string
  image?:      string | null
}) {
  return {
    '@context':   'https://schema.org',
    '@type':      'Service',
    serviceType:  'MovingService',
    provider: {
      '@type': 'MovingCompany',
      name:    COMPANY.name,
      url:     BASE,
    },
    name,
    description,
    url,
    ...(image ? { image } : {}),
    areaServed: { '@type': 'Country', name: 'Tunisia' },
  }
}
