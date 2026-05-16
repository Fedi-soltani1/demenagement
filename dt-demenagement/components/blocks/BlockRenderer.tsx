import React from 'react'

import { HeroBlock,          type CmsHero }          from '@/components/blocks/HeroBlock'
import { MiniFeaturesBlock,  type CmsPointsForts }    from '@/components/blocks/MiniFeaturesBlock'
import { StatsAboutBlock,    type CmsApropos }        from '@/components/blocks/StatsAboutBlock'
import { WhyUsBlock,         type CmsPourquoiNous }   from '@/components/blocks/WhyUsBlock'
import { ServicesBlock,      type ServiceData }       from '@/components/blocks/ServicesBlock'
import { MapBlock }                                    from '@/components/blocks/MapBlock'
import { TestimonialsBlock,  type TestimonialData }   from '@/components/blocks/TestimonialsBlock'
import { GoogleReviewsBlock }                          from '@/components/blocks/GoogleReviewsBlock'
import { PartnersBlock,      type PartnerData }       from '@/components/blocks/PartnersBlock'
import { InstagramFeedBlock }                          from '@/components/blocks/InstagramFeedBlock'
import { NewsletterBlock }                             from '@/components/blocks/NewsletterBlock'
import { BlogPreviewBlock,   type BlogArticleData }   from '@/components/blocks/BlogPreviewBlock'
import { CTAFinalBlock,      type CmsCtaFinal }       from '@/components/blocks/CTAFinalBlock'

// ─── Types Payload (structure brute retournée par l'API) ──────────────────────

type MediaPayload = { url?: string | null; width?: number | null; height?: number | null } | null

type PayloadBlock = {
  blockType: string
  id?: string
  [key: string]: unknown
}

type ServicePayload = {
  id: string
  nom?: string | null
  slug?: string | null
  icone?: string | null
}

type TestimonialPayload = {
  id: string
  nom?: string | null
  ville?: string | null
  note?: string | number | null
  texte?: string | null
}

type BlogDocPayload = {
  id: string
  titre?: string | null
  slug?: string | null
  extrait?: string | null
  imageAlaUne?: MediaPayload
  tempsLecture?: number | null
  datePublication?: string | null
  categories?: { id?: string; nom?: string }[] | null
}

type PartnerPayload = {
  id: string
  nom?: string | null
  logo?: MediaPayload
  lien?: string | null
}

// ─── Props du renderer ────────────────────────────────────────────────────────

interface BlockRendererProps {
  blocks:       PayloadBlock[]
  services:     ServiceData[]
  testimonials: TestimonialData[]
  blog:         BlogArticleData[]
  partners:     PartnerData[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function num(v: unknown): number | null {
  return typeof v === 'number' && !isNaN(v) ? v : null
}

function mediaUrl(v: unknown): string | null {
  if (!v || typeof v !== 'object') return null
  const url = (v as Record<string, unknown>).url
  return typeof url === 'string' ? url : null
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// ─── Adaptateurs bloc Payload → props React ───────────────────────────────────

function adaptHero(b: PayloadBlock): CmsHero {
  const ctaPrimaire   = b.ctaPrimaire   as Record<string, unknown> | null | undefined
  const ctaSecondaire = b.ctaSecondaire as Record<string, unknown> | null | undefined
  return {
    badge:      str(b.badge),
    titre:      str(b.titre),
    sousTitre:  str(b.sousTitre),
    cta1Texte:  str(ctaPrimaire?.texte)   ?? null,
    cta2Texte:  str(ctaSecondaire?.texte) ?? null,
  }
}

function adaptMiniFeatures(b: PayloadBlock): CmsPointsForts {
  type RawItem = { icone?: string | null; titre?: string | null; description?: string | null }
  const raw = arr<RawItem>(b.items)
  if (!raw.length) return {}
  return {
    items: raw.map((item) => ({
      icone:       item.icone       ?? null,
      titre:       item.titre       ?? '',
      description: item.description ?? '',
    })),
  }
}

function adaptAbout(b: PayloadBlock): CmsApropos {
  type StatRaw = { valeur?: number | null; suffixe?: string | null; label?: string | null }
  const stats = arr<StatRaw>(b.stats)

  const cms: CmsApropos = {
    badge:     str(b.badge),
    titre:     str(b.titre),
    texte:     str(b.texte),
    image:     b.image ? { url: mediaUrl(b.image) } : null,
    videoUrl:  str(b.videoUrl),
    ctaTexte:  str(b.ctaTexte),
  }

  // Injecter les 4 stats si définies dans Payload
  if (stats[0]) {
    cms.stat1Valeur  = num(stats[0].valeur)
    cms.stat1Suffixe = str(stats[0].suffixe)
    cms.stat1Label   = str(stats[0].label)
  }
  if (stats[1]) {
    cms.stat2Valeur  = num(stats[1].valeur)
    cms.stat2Suffixe = str(stats[1].suffixe)
    cms.stat2Label   = str(stats[1].label)
  }
  if (stats[2]) {
    cms.stat3Valeur  = num(stats[2].valeur)
    cms.stat3Suffixe = str(stats[2].suffixe)
    cms.stat3Label   = str(stats[2].label)
  }
  if (stats[3]) {
    cms.stat4Valeur  = num(stats[3].valeur)
    cms.stat4Suffixe = str(stats[3].suffixe)
    cms.stat4Label   = str(stats[3].label)
  }

  return cms
}

function adaptWhyUs(b: PayloadBlock): CmsPourquoiNous {
  type ArgRaw = { icone?: string | null; titre?: string | null; texte?: string | null }
  const args = arr<ArgRaw>(b.arguments)
  return {
    titre:      str(b.titre),
    sousTitre:  str(b.sousTitre),
    items: args.length
      ? args.map((a) => ({
          icone:       a.icone ?? null,
          titre:       a.titre ?? '',
          description: a.texte ?? '',
        }))
      : null,
  }
}

function adaptCta(b: PayloadBlock): CmsCtaFinal {
  const bouton1 = b.boutonPrimaire   as Record<string, unknown> | null | undefined
  const bouton2 = b.boutonSecondaire as Record<string, unknown> | null | undefined
  return {
    titre:        str(b.titre),
    sousTitre:    str(b.sousTitre),
    bouton1Texte: str(bouton1?.texte) ?? null,
    bouton2Texte: str(bouton2?.texte) ?? null,
  }
}

function adaptServices(
  b: PayloadBlock,
  fallback: ServiceData[],
): ServiceData[] {
  const rel = b.services
  if (Array.isArray(rel) && rel.length > 0) {
    const mapped: ServiceData[] = (rel as ServicePayload[]).map((s) => ({
      id:    s.id,
      nom:   s.nom   ?? '',
      slug:  s.slug  ?? '',
      icone: s.icone ?? null,
    }))
    return mapped
  }
  return fallback
}

function adaptTestimonials(
  b: PayloadBlock,
  fallback: TestimonialData[],
): TestimonialData[] {
  const rel = b.temoignages
  if (Array.isArray(rel) && rel.length > 0) {
    const nombreMax = typeof b.nombreMax === 'number' ? b.nombreMax : 20
    return (rel as TestimonialPayload[]).slice(0, nombreMax).map((t) => ({
      id:    t.id,
      nom:   t.nom   ?? '',
      ville: t.ville ?? '',
      note:  String(t.note ?? 5),
      texte: t.texte ?? '',
    }))
  }
  return fallback
}

function adaptPartners(
  b: PayloadBlock,
  fallback: PartnerData[],
): PartnerData[] {
  const rel = b.partenaires
  if (Array.isArray(rel) && rel.length > 0) {
    return (rel as PartnerPayload[]).map((p) => ({
      id:   p.id,
      nom:  p.nom  ?? '',
      logo: p.logo ? { url: mediaUrl(p.logo) } : null,
      lien: p.lien ?? null,
    }))
  }
  return fallback
}

// ─── BlockRenderer ────────────────────────────────────────────────────────────

export function BlockRenderer({
  blocks,
  services,
  testimonials,
  blog,
  partners,
}: BlockRendererProps) {
  if (!blocks.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? `block-${index}`

        switch (block.blockType) {

          case 'hero':
            return <HeroBlock key={key} cms={adaptHero(block)} />

          case 'mini-features':
            return <MiniFeaturesBlock key={key} cms={adaptMiniFeatures(block)} />

          case 'about':
            return <StatsAboutBlock key={key} cms={adaptAbout(block)} />

          case 'services':
            return (
              <ServicesBlock
                key={key}
                services={adaptServices(block, services)}
              />
            )

          case 'why-us':
            return <WhyUsBlock key={key} cms={adaptWhyUs(block)} />

          case 'map':
            return <MapBlock key={key} />

          case 'testimonials':
            return (
              <TestimonialsBlock
                key={key}
                testimonials={adaptTestimonials(block, testimonials)}
              />
            )

          case 'google-reviews':
            return <GoogleReviewsBlock key={key} />

          case 'partners':
            return (
              <PartnersBlock
                key={key}
                partners={adaptPartners(block, partners)}
              />
            )

          case 'instagram-feed':
            return <InstagramFeedBlock key={key} />

          case 'newsletter':
            return <NewsletterBlock key={key} />

          case 'blog-preview':
            return <BlogPreviewBlock key={key} articles={blog} />

          case 'cta':
            return <CTAFinalBlock key={key} cms={adaptCta(block)} />

          default:
            return null
        }
      })}
    </>
  )
}
