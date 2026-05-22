import React from 'react'
import Image from 'next/image'

import { HeroBlock,          type CmsHero }          from '@/components/blocks/HeroBlock'
import { MiniFeaturesBlock,  type CmsPointsForts }    from '@/components/blocks/MiniFeaturesBlock'
import { StatsAboutBlock,    type CmsApropos }        from '@/components/blocks/StatsAboutBlock'
import { WhyUsBlock,         type CmsPourquoiNous }   from '@/components/blocks/WhyUsBlock'
import { ServicesBlock,      type ServiceData }       from '@/components/blocks/ServicesBlock'
import { MapBlock }                                    from '@/components/blocks/MapBlock'
import { TestimonialsBlock,  type TestimonialData }   from '@/components/blocks/TestimonialsBlock'
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
  blocks:             PayloadBlock[]
  services:           ServiceData[]
  testimonials:       TestimonialData[]
  blog:               BlogArticleData[]
  partners:           PartnerData[]
  googleReviewsNode?: React.ReactNode
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
    videoFichier: mediaUrl(b.videoFichier),
    videoYoutube: str(b.videoYoutube),
    imageHero:    mediaUrl(b.imageHero),
    afficher3D:   typeof b.afficher3D === 'boolean' ? b.afficher3D : true,
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
    image:         b.image ? { url: mediaUrl(b.image) } : null,
    videoFichier:  mediaUrl(b.videoFichier),
    videoUrl:      str(b.videoUrl),
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
  googleReviewsNode,
}: BlockRendererProps) {
  if (!blocks.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? `block-${index}`

        if (block.actif === false) return null

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
                cms={{ titre: str(block.titre), sousTitre: str(block.sousTitre), ctaTexte: str(block.ctaTexte) }}
              />
            )

          case 'why-us':
            return <WhyUsBlock key={key} cms={adaptWhyUs(block)} />

          case 'map':
            return <MapBlock key={key} cms={{ titre: str(block.titre), sousTitre: str(block.sousTitre) }} />

          case 'testimonials':
            return (
              <TestimonialsBlock
                key={key}
                testimonials={adaptTestimonials(block, testimonials)}
                cms={{ titre: str(block.titre), sousTitre: str(block.sousTitre) }}
              />
            )

          case 'google-reviews':
            return <React.Fragment key={key}>{googleReviewsNode}</React.Fragment>

          case 'partners':
            return (
              <PartnersBlock
                key={key}
                partners={adaptPartners(block, partners)}
                cms={{ titre: str(block.titre) }}
              />
            )

          case 'instagram-feed':
            return <InstagramFeedBlock key={key} cms={{ titre: str(block.titre), lienProfil: str(block.lienProfil) }} />

          case 'newsletter':
            return (
              <NewsletterBlock
                key={key}
                cms={{
                  titre:            str(block.titre),
                  sousTitre:        str(block.sousTitre),
                  texteBouton:      str(block.texteBouton),
                  placeholderEmail: str(block.placeholderEmail),
                  texteRgpd:        str(block.texteRgpd),
                }}
              />
            )

          case 'blog-preview':
            return (
              <BlogPreviewBlock
                key={key}
                articles={blog}
                cms={{ titre: str(block.titre), sousTitre: str(block.sousTitre), ctaTexte: str(block.ctaTexte) }}
              />
            )

          case 'cta':
            return <CTAFinalBlock key={key} cms={adaptCta(block)} />

          case 'stats': {
            // Bloc stats autonome → StatsAboutBlock avec seulement les chiffres
            type StatRaw = { valeur?: number | null; suffixe?: string | null; libelle?: string | null }
            const statsArr = arr<StatRaw>(block.stats)
            const statsCms: CmsApropos = {}
            if (statsArr[0]) { statsCms.stat1Valeur = num(statsArr[0].valeur); statsCms.stat1Suffixe = str(statsArr[0].suffixe); statsCms.stat1Label = str(statsArr[0].libelle) }
            if (statsArr[1]) { statsCms.stat2Valeur = num(statsArr[1].valeur); statsCms.stat2Suffixe = str(statsArr[1].suffixe); statsCms.stat2Label = str(statsArr[1].libelle) }
            if (statsArr[2]) { statsCms.stat3Valeur = num(statsArr[2].valeur); statsCms.stat3Suffixe = str(statsArr[2].suffixe); statsCms.stat3Label = str(statsArr[2].libelle) }
            if (statsArr[3]) { statsCms.stat4Valeur = num(statsArr[3].valeur); statsCms.stat4Suffixe = str(statsArr[3].suffixe); statsCms.stat4Label = str(statsArr[3].libelle) }
            return <StatsAboutBlock key={key} cms={statsCms} />
          }

          case 'faq': {
            // Bloc FAQ inline — rend un simple accordéon avec les questions du bloc
            type FAQRaw = { id?: string; question?: string | null; reponse?: unknown }
            const faqItems = arr<FAQRaw>(block.questions)
            if (!faqItems.length) return null
            return (
              <section key={key} className="py-section px-container bg-[var(--color-bg-dark2)]">
                <div className="max-w-3xl mx-auto">
                  {str(block.titre) && (
                    <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-10 text-center"
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                      {str(block.titre)}
                    </h2>
                  )}
                  <dl className="space-y-4">
                    {faqItems.map((q, qi) => (
                      <div key={q.id ?? qi} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
                        <dt className="font-heading font-semibold text-[var(--color-text-light)] mb-3">{q.question}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )
          }

          case 'video': {
            const urlRaw = str(block.urlVideo)
            if (!urlRaw) return null
            // Convertit https://youtube.com/watch?v=ID → https://youtube.com/embed/ID
            const embedUrl = urlRaw.includes('watch?v=')
              ? urlRaw.replace('watch?v=', 'embed/')
              : urlRaw
            return (
              <section key={key} className="py-section px-container bg-[var(--color-bg-dark)]">
                <div className="max-w-4xl mx-auto">
                  {str(block.titre) && (
                    <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-8 text-center"
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                      {str(block.titre)}
                    </h2>
                  )}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      title={str(block.titre) ?? 'Vidéo'}
                      loading="lazy"
                    />
                  </div>
                  {str(block.sousTitre) && (
                    <p className="font-body text-center text-[var(--color-text-muted)] text-sm mt-4">
                      {str(block.sousTitre)}
                    </p>
                  )}
                </div>
              </section>
            )
          }

          case 'gallery': {
            type ImgRaw = { image?: { url?: string | null } | null; legende?: string | null }
            const images = arr<ImgRaw>(block.images).filter((i) => i.image?.url)
            if (!images.length) return null
            const cols = str(block.colonnes) ?? '3'
            const gridCols = cols === '2' ? 'grid-cols-2' : cols === '4' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'
            return (
              <section key={key} className="py-section px-container bg-[var(--color-bg-dark2)]">
                <div className="max-w-7xl mx-auto">
                  {str(block.titre) && (
                    <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-10 text-center"
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                      {str(block.titre)}
                    </h2>
                  )}
                  <div className={`grid ${gridCols} gap-4`}>
                    {images.map((img, gi) => (
                      <div key={gi} className="relative aspect-square rounded-xl overflow-hidden">
                        <Image
                          src={img.image!.url!}
                          alt={img.legende ?? ''}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          }

          case 'custom': {
            const bgMap: Record<string, string> = {
              noir:   'bg-[var(--color-bg-dark)]',
              fonce:  'bg-[var(--color-bg-dark2)]',
              rouge:  'bg-[var(--color-red)]',
              blanc:  'bg-[var(--color-text-light)]',
            }
            const bgClass  = bgMap[str(block.couleurFond) ?? 'noir'] ?? 'bg-[var(--color-bg-dark)]'
            const textClass = str(block.couleurFond) === 'blanc' ? 'text-[var(--color-bg-dark)]' : 'text-[var(--color-text-light)]'
            const mutedClass = str(block.couleurFond) === 'blanc' ? 'text-[var(--color-bg-dark)]/70' : 'text-[var(--color-text-muted)]'
            const btnHref = str((block.cta as Record<string, unknown> | null | undefined)?.lien)
            const btnTxt  = str((block.cta as Record<string, unknown> | null | undefined)?.texte)
            const imgUrl  = mediaUrl(block.imagePrincipale)
            return (
              <section key={key} className={`py-section px-container ${bgClass}`}>
                <div className="max-w-4xl mx-auto text-center">
                  {str(block.titre) && (
                    <h2 className={`font-heading font-bold mb-4 ${textClass}`}
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                      {str(block.titre)}
                    </h2>
                  )}
                  {str(block.sousTitre) && (
                    <p className={`font-body text-lg mb-6 ${mutedClass}`}>{str(block.sousTitre)}</p>
                  )}
                  {imgUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 mx-auto max-w-2xl">
                      <Image src={imgUrl} alt={str(block.titre) ?? ''} fill className="object-cover" />
                    </div>
                  )}
                  {btnHref && btnTxt && (
                    <a
                      href={btnHref}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200"
                    >
                      {btnTxt}
                    </a>
                  )}
                </div>
              </section>
            )
          }

          default:
            return null
        }
      })}
    </>
  )
}
