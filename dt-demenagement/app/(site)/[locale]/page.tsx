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

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main>
      <HeroBlock />
      <MiniFeaturesBlock />
      <StatsAboutBlock />
      <WhyUsBlock />
      <ServicesBlock />
      <MapBlock />
      <TestimonialsBlock />
      <GoogleReviewsBlock />
      <PartnersBlock />
      <InstagramFeedBlock />
      <NewsletterBlock />
      <BlogPreviewBlock />
      <CTAFinalBlock />
    </main>
  )
}
