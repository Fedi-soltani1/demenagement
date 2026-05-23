'use client'

import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useIs3DEnabled } from '@/hooks/useIs3DEnabled'
import { ArrowLeft, Phone } from 'lucide-react'
import { COMPANY } from '@/lib/constants'

const Scene404 = dynamic(() => import('@/components/3d/Scene404'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-transparent" aria-hidden="true" />
  ),
})

export default function NotFoundPage() {
  const params  = useParams()
  const locale  = (params?.locale as string) ?? 'fr'
  const t       = useTranslations('NotFound')
  const is3D    = useIs3DEnabled()

  return (
    <main
      className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-20 bg-[var(--color-bg-dark)] relative overflow-hidden"
      aria-labelledby="404-title"
    >
      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(181,32,39,0.07) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

        {/* 3D ou typographie géante */}
        <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-[440px] flex items-center justify-center relative">
          {is3D ? (
            <Scene404 />
          ) : (
            <div
              className="font-display font-bold select-none leading-none"
              style={{
                fontSize: 'clamp(7rem, 22vw, 14rem)',
                color: 'transparent',
                WebkitTextStroke: '2px var(--color-red)',
                opacity: 0.15,
              }}
              aria-hidden="true"
            >
              404
            </div>
          )}
        </div>

        {/* Texte */}
        <div className="w-full lg:w-1/2 text-center lg:text-start">
          <div className="inline-block mb-5 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </div>

          <h1
            id="404-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-4 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t('title')}
          </h1>

          <p className="font-body text-[var(--color-text-muted)] text-base leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t('ctaHome')}
            </Link>

            <a
              href={`tel:${COMPANY.phone1}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/10 bg-white/[0.04] text-[var(--color-text-muted)] font-body font-bold text-sm uppercase tracking-wider hover:border-[var(--color-red)]/30 hover:text-[var(--color-text-light)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {t('ctaPhone')}
            </a>
          </div>

          {/* Liens utiles */}
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
              {t('linksLabel')}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start">
              {[
                { href: '/services', label: t('linkServices') },
                { href: '/zones',    label: t('linkZones')    },
                { href: '/faq',      label: t('linkFAQ')      },
                { href: '/blog',     label: t('linkBlog')     },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors duration-150 underline underline-offset-4 decoration-transparent hover:decoration-current"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
