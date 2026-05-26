'use client'

import { useLivePreview }    from '@payloadcms/live-preview-react'
import { useTranslations }   from 'next-intl'
import Image                 from 'next/image'
import Link                  from 'next/link'

import { BlockRenderer }     from '@/components/blocks/BlockRenderer'
import { PhoneLink }         from '@/components/ui/PhoneLink'
import { COMPANY }           from '@/lib/constants'
import type { ServiceData }  from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }  from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'
import type React            from 'react'

type ServiceDoc = {
  id?: string | number
  nom?: string | null
  description?: string | null
  icone?: string | null
  image?: { url?: string | null; alt?: string | null } | null
  tarifDepuis?: number | null
  blocks?: unknown[]
}

interface ServiceLivePreviewWrapperProps {
  initialService:    ServiceDoc
  locale:            string
  slug:              string
  services:          ServiceData[]
  testimonials:      TestimonialData[]
  blog:              BlogArticleData[]
  partners:          PartnerData[]
  villes:            MapVille[]
  pays:              MapPays[]
  googleReviewsNode: React.ReactNode
}

export function ServiceLivePreviewWrapper({
  initialService,
  locale,
  slug,
  services,
  testimonials,
  blog,
  partners,
  villes,
  pays,
  googleReviewsNode,
}: ServiceLivePreviewWrapperProps) {
  const t = useTranslations('Home.services')

  const { data } = useLivePreview<ServiceDoc>({
    initialData: initialService,
    serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000',
    depth: 3,
  })

  const blocks = (data?.blocks ?? []) as Array<{ blockType: string; id?: string; [key: string]: unknown }>
  const nom         = data?.nom         ?? ''
  const description = data?.description ?? ''
  const image       = data?.image

  return (
    <>
      {/* Hero — mis à jour en temps réel via useLivePreview */}
      <section className="relative py-24 px-container bg-[var(--color-bg-dark)] overflow-hidden">
        {/* Texture bruit */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        {/* Halo rouge */}
        <div
          className="pointer-events-none absolute end-0 top-0 w-1/2 h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 80% 50%, #b52027 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Image de fond si renseignée */}
        {image?.url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={image.url}
              alt={image.alt ?? nom}
              fill
              className="object-cover opacity-15"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)] via-[var(--color-bg-dark)]/80 to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {nom}
          </h1>
          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-10 max-w-2xl">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/devis?service=${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {t('ctaDevis')}
            </Link>
            <PhoneLink
              numero={COMPANY.phone1}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200"
              showIcon
            />
          </div>
        </div>
      </section>

      {/* Blocs configurés dans l'admin */}
      <BlockRenderer
        blocks={blocks}
        services={services}
        testimonials={testimonials}
        blog={blog}
        partners={partners}
        villes={villes}
        pays={pays}
        googleReviewsNode={googleReviewsNode}
      />
    </>
  )
}
