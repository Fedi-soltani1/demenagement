import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LOCALES, COMPANY } from '@/lib/constants'
import { FadeIn } from '@/components/ui/FadeIn'
import { BlogGrid } from '@/components/ui/BlogGrid'
import type { ArticleItem } from '@/components/ui/BlogGrid'

export const revalidate = 300

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home.blog' })
  return {
    title:       `${t('title')} — ${COMPANY.name}`,
    description: t('subtitle'),
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Home.blog' })

  const payload = await getPayload({ config })
  const result  = await payload
    .find({
      collection: 'blog',
      where: { publie: { equals: true } },
      sort: '-datePublication',
      locale: locale as 'fr' | 'ar' | 'en',
      limit: 12,
      depth: 1,
    })
    .catch(() => ({ docs: [] as unknown[] }))

  const articles = result.docs as ArticleItem[]

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-container bg-[var(--color-bg-dark)] text-center relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <FadeIn className="relative z-10">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('title')}
          </h1>
        </FadeIn>
      </section>

      {/* Grille articles */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto">
          <BlogGrid
            articles={articles}
            labels={{
              minRead:   t('minRead'),
              readMore:  t('readMore'),
              empty:     t('empty'),
              adminHint: t('adminHint'),
            }}
          />
        </div>
      </section>
    </>
  )
}
