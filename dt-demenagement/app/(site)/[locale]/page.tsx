import { getPayload } from 'payload'
import config from '@payload-config'
import { setRequestLocale } from 'next-intl/server'
import { LOCALES } from '@/lib/constants'

import { HeroBlock }          from '@/components/blocks/HeroBlock'
import { MiniFeaturesBlock }  from '@/components/blocks/MiniFeaturesBlock'
import { StatsAboutBlock }    from '@/components/blocks/StatsAboutBlock'
import { WhyUsBlock }         from '@/components/blocks/WhyUsBlock'
import { ServicesBlock }      from '@/components/blocks/ServicesBlock'
import { MapBlock }           from '@/components/blocks/MapBlock'
import { TestimonialsBlock }  from '@/components/blocks/TestimonialsBlock'
import { GoogleReviewsBlock } from '@/components/blocks/GoogleReviewsBlock'
import { PartnersBlock }      from '@/components/blocks/PartnersBlock'
import { InstagramFeedBlock } from '@/components/blocks/InstagramFeedBlock'
import { NewsletterBlock }    from '@/components/blocks/NewsletterBlock'
import { BlogPreviewBlock }   from '@/components/blocks/BlogPreviewBlock'
import { CTAFinalBlock }      from '@/components/blocks/CTAFinalBlock'

import type { CmsHero }         from '@/components/blocks/HeroBlock'
import type { CmsPointsForts }  from '@/components/blocks/MiniFeaturesBlock'
import type { CmsApropos }      from '@/components/blocks/StatsAboutBlock'
import type { CmsPourquoiNous } from '@/components/blocks/WhyUsBlock'
import type { CmsCtaFinal }     from '@/components/blocks/CTAFinalBlock'
import type { ServiceData }     from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }     from '@/components/blocks/PartnersBlock'

// En prod : page mise en cache 60 secondes — assez court pour voir les modifs rapidement
export const revalidate = 60

interface HomePageProps {
  params: Promise<{ locale: string }>
}

// Type du Global Homepage (reflète payload/globals/Homepage.ts)
type HomepageGlobal = {
  hero?:          CmsHero          | null
  pointsForts?:   CmsPointsForts   | null
  apropos?:       CmsApropos       | null
  pourquoiNous?:  CmsPourquoiNous  | null
  ctaFinal?:      CmsCtaFinal      | null
}

export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  // Fetch en parallèle — Global homepage + toutes les collections
  const [
    homepage,
    servicesRes,
    testimonialsRes,
    blogRes,
    partnersRes,
  ] = await Promise.all([

    // Global "Page d'accueil" — hero, features, stats, whyUs, CTA
    payload.findGlobal({ slug: 'homepage', locale: loc })
      .catch(() => null) as Promise<HomepageGlobal | null>,

    // Collections dynamiques
    payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: loc,
      limit: 12,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'testimonials',
      where: { publie: { equals: true } },
      sort: 'ordre',
      limit: 20,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'blog',
      where: { statut: { equals: 'publie' } },
      sort: '-datePublication',
      locale: loc,
      limit: 3,
      depth: 1,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'partners',
      where: { publie: { equals: true } },
      sort: 'ordre',
      limit: 30,
      depth: 1,
    }).catch(() => ({ docs: [] as unknown[] })),
  ])

  return (
    <main>
      {/* Chaque bloc reçoit les données Payload.
          Si le champ est vide dans l'admin → fallback sur les textes par défaut (i18n).
          Si le champ est rempli → c'est la valeur CMS qui s'affiche. */}
      <HeroBlock          cms={homepage?.hero          ?? undefined} />
      <MiniFeaturesBlock  cms={homepage?.pointsForts   ?? undefined} />
      <StatsAboutBlock    cms={homepage?.apropos        ?? undefined} />
      <WhyUsBlock         cms={homepage?.pourquoiNous  ?? undefined} />
      <ServicesBlock      services={servicesRes.docs     as ServiceData[]} />
      <MapBlock />
      <TestimonialsBlock  testimonials={testimonialsRes.docs as TestimonialData[]} />
      <GoogleReviewsBlock />
      <PartnersBlock      partners={partnersRes.docs    as PartnerData[]} />
      <InstagramFeedBlock />
      <NewsletterBlock />
      <BlogPreviewBlock   articles={blogRes.docs         as BlogArticleData[]} />
      <CTAFinalBlock      cms={homepage?.ctaFinal       ?? undefined} />
    </main>
  )
}
