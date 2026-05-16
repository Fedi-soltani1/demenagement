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
import type { ServiceData }     from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }     from '@/components/blocks/PartnersBlock'

// ISR homepage — 1 heure en prod
export const revalidate = 3600

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  // Fetch en parallèle — toutes les collections homepage
  const [servicesRes, testimonialsRes, blogRes, partnersRes] = await Promise.all([
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
      <HeroBlock />
      <MiniFeaturesBlock />
      <StatsAboutBlock />
      <WhyUsBlock />
      <ServicesBlock services={servicesRes.docs as ServiceData[]} />
      <MapBlock />
      <TestimonialsBlock testimonials={testimonialsRes.docs as TestimonialData[]} />
      <GoogleReviewsBlock />
      <PartnersBlock partners={partnersRes.docs as PartnerData[]} />
      <InstagramFeedBlock />
      <NewsletterBlock />
      <BlogPreviewBlock articles={blogRes.docs as BlogArticleData[]} />
      <CTAFinalBlock />
    </main>
  )
}
