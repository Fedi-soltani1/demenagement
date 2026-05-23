import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LOCALES, COMPANY } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import type { ServiceData }     from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }     from '@/components/blocks/PartnersBlock'
import { FadeIn } from '@/components/ui/FadeIn'

export const revalidate = 3600

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const payload    = await getPayload({ config })
  const result     = await payload
    .find({
      collection: 'pages',
      where: { slug: { equals: 'a-propos' }, publie: { equals: true } },
      locale: locale as 'fr' | 'ar' | 'en',
      limit: 1,
    })
    .catch(() => ({ docs: [] as unknown[] }))

  const page = result.docs[0] as
    | { seo?: { metaTitle?: string; metaDescription?: string } }
    | undefined

  const title       = page?.seo?.metaTitle       ?? `À propos de ${COMPANY.name}`
  const description = page?.seo?.metaDescription ?? `Découvrez DT Déménagement Tunisie — notre histoire, notre équipe et notre engagement pour des déménagements réussis.`
  return buildMetadata({ title, description, path: '/a-propos', locale })
}

export default async function AProposPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t       = await getTranslations({ locale, namespace: 'Home.about' })
  const payload = await getPayload({ config })
  const loc     = locale as 'fr' | 'ar' | 'en'

  const [pageData, servicesRes, testimonialsRes, partnersRes] = await Promise.all([
    payload
      .find({
        collection: 'pages',
        where: { and: [{ slug: { equals: 'a-propos' } }, { publie: { equals: true } }] },
        locale: loc,
        depth: 3,
        limit: 1,
      })
      .catch(() => ({ docs: [] as unknown[] })),

    payload
      .find({ collection: 'services', where: { publie: { equals: true } }, sort: 'ordre', locale: loc, limit: 12 })
      .catch(() => ({ docs: [] as unknown[] })),

    payload
      .find({ collection: 'testimonials', where: { publie: { equals: true } }, limit: 20 })
      .catch(() => ({ docs: [] as unknown[] })),

    payload
      .find({ collection: 'partners', where: { publie: { equals: true } }, sort: 'ordre', limit: 30, depth: 1 })
      .catch(() => ({ docs: [] as unknown[] })),
  ])

  type PageDoc = { layout?: unknown[] }
  const page   = pageData.docs[0] as PageDoc | undefined
  const blocks = (page?.layout ?? []) as Array<{ blockType: string; id?: string; [key: string]: unknown }>

  // Si l'admin a configuré la page via Payload → page builder
  if (blocks.length > 0) {
    return (
      <main>
        <BlockRenderer
          blocks={blocks}
          services={servicesRes.docs     as ServiceData[]}
          testimonials={testimonialsRes.docs as TestimonialData[]}
          blog={[]}
          partners={partnersRes.docs     as PartnerData[]}
          villes={[]}
          pays={[]}
        />
      </main>
    )
  }

  // Fallback statique — affiché tant que la page 'a-propos' n'est pas créée dans Payload
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
          <p className="font-body text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            {t('text')}
          </p>
        </FadeIn>
      </section>

      {/* Image + stats */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right" className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
              alt="Équipe DT Déménagement"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </FadeIn>

          <FadeIn direction="left" delay={0.1}>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                { value: '15+', label: t('stat1Label') },
                { value: '5000+', label: t('stat2Label') },
                { value: '98%', label: t('stat3Label') },
                { value: '24/7', label: t('stat4Label') },
              ].map(({ value, label }) => (
                <div key={label} className="border-s-2 border-[var(--color-red)] ps-4">
                  <div className="font-mono text-3xl font-bold text-[var(--color-gold)]">{value}</div>
                  <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {t('ctaText')} →
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
