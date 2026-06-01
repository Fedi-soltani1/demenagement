'use client'

import React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import { BlockSkeleton }                                from '@/components/blocks/BlockSkeleton'
import { SectionWrapper }                               from '@/components/blocks/SectionWrapper'
import { CounterAnimation }                             from '@/components/ui/CounterAnimation'
import type { SectionOptions, TypographieOptions }      from '@/lib/sectionOptions'
import {
  resolveHeadingTag, resolveTitleTypography, resolveTextTypography, cx,
} from '@/lib/sectionOptions'

// ─── Dynamic imports — un chunk par bloc ─────────────────────────────────────

const sk = (h: 'sm' | 'md' | 'lg' | 'xl') => () => <BlockSkeleton height={h} />

const HeroBlock = dynamic(
  () => import('@/components/blocks/HeroBlock').then((m) => ({ default: m.HeroBlock })),
  { loading: sk('xl') },
)
const MiniFeaturesBlock = dynamic(
  () => import('@/components/blocks/MiniFeaturesBlock').then((m) => ({ default: m.MiniFeaturesBlock })),
  { loading: sk('sm') },
)
const StatsAboutBlock = dynamic(
  () => import('@/components/blocks/StatsAboutBlock').then((m) => ({ default: m.StatsAboutBlock })),
  { loading: sk('lg') },
)
const WhyUsBlock = dynamic(
  () => import('@/components/blocks/WhyUsBlock').then((m) => ({ default: m.WhyUsBlock })),
  { loading: sk('lg') },
)
const ServicesBlock = dynamic(
  () => import('@/components/blocks/ServicesBlock').then((m) => ({ default: m.ServicesBlock })),
  { loading: sk('lg') },
)
const MapBlock = dynamic(
  () => import('@/components/blocks/MapBlock').then((m) => ({ default: m.MapBlock })),
  { loading: sk('xl') },
)
const TestimonialsBlock = dynamic(
  () => import('@/components/blocks/TestimonialsBlock').then((m) => ({ default: m.TestimonialsBlock })),
  { loading: sk('lg') },
)
const PartnersBlock = dynamic(
  () => import('@/components/blocks/PartnersBlock').then((m) => ({ default: m.PartnersBlock })),
  { loading: sk('sm') },
)
const InstagramFeedBlock = dynamic(
  () => import('@/components/blocks/InstagramFeedBlock').then((m) => ({ default: m.InstagramFeedBlock })),
  { loading: sk('lg') },
)
const NewsletterBlock = dynamic(
  () => import('@/components/blocks/NewsletterBlock').then((m) => ({ default: m.NewsletterBlock })),
  { loading: sk('md') },
)
const BlogPreviewBlock = dynamic(
  () => import('@/components/blocks/BlogPreviewBlock').then((m) => ({ default: m.BlogPreviewBlock })),
  { loading: sk('lg') },
)
const CTAFinalBlock = dynamic(
  () => import('@/components/blocks/CTAFinalBlock').then((m) => ({ default: m.CTAFinalBlock })),
  { loading: sk('md') },
)
const ProcessBlock = dynamic(
  () => import('@/components/blocks/ProcessBlock').then((m) => ({ default: m.ProcessBlock })),
  { loading: sk('lg') },
)
const PricingBlock = dynamic(
  () => import('@/components/blocks/PricingBlock').then((m) => ({ default: m.PricingBlock })),
  { loading: sk('xl') },
)
const FAQBlock = dynamic(
  () => import('@/components/blocks/FAQBlock').then((m) => ({ default: m.FAQBlock })),
  { loading: sk('md') },
)

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
  photo?: { url?: string | null } | null
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

type VillePayload = {
  id: string
  nom?: string | null
  slug?: string | null
  region?: string | null
  coordonnees?: { lat?: number | null; lng?: number | null } | null
}

type PaysPayload = {
  id: string
  nom?: string | null
  slug?: string | null
  drapeau?: string | null
  coordonnees?: { lat?: number | null; lng?: number | null } | null
}

// ─── Types de blocs (uniquement pour les props du renderer et les adaptateurs) ─

import type { CmsHero }          from '@/components/blocks/HeroBlock'
import type { CmsPointsForts }   from '@/components/blocks/MiniFeaturesBlock'
import type { CmsApropos }       from '@/components/blocks/StatsAboutBlock'
import type { CmsPourquoiNous }  from '@/components/blocks/WhyUsBlock'
import type { ServiceData }      from '@/components/blocks/ServicesBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'
import type { TestimonialData }  from '@/components/blocks/TestimonialsBlock'
import type { PartnerData }      from '@/components/blocks/PartnersBlock'
import type { BlogArticleData }  from '@/components/blocks/BlogPreviewBlock'
import type { CmsCtaFinal }      from '@/components/blocks/CTAFinalBlock'
import type { ProcessCms }       from '@/components/blocks/ProcessBlock'
import type { PricingCms }       from '@/components/blocks/PricingBlock'
import type { FaqCms }           from '@/components/blocks/FAQBlock'

// ─── Props du renderer ────────────────────────────────────────────────────────

interface BlockRendererProps {
  blocks:             PayloadBlock[]
  services:           ServiceData[]
  testimonials:       TestimonialData[]
  blog:               BlogArticleData[]
  partners:           PartnerData[]
  villes:             MapVille[]
  pays:               MapPays[]
  googleReviewsNode?: React.ReactNode
  telephone?:         string
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

// ─── Extracteurs sectionOptions & typographie ─────────────────────────────────

function extractSectionOptions(b: PayloadBlock): SectionOptions {
  const raw = b.sectionOptions as Record<string, unknown> | null | undefined
  if (!raw) return {}
  return {
    fond:           str(raw.fond)           as SectionOptions['fond'],
    imageFond:      mediaUrl(raw.imageFond),
    overlayOpacite: str(raw.overlayOpacite) as SectionOptions['overlayOpacite'],
    espacement:     str(raw.espacement)     as SectionOptions['espacement'],
    largeurContenu: str(raw.largeurContenu) as SectionOptions['largeurContenu'],
    hauteurMin:     str(raw.hauteurMin)     as SectionOptions['hauteurMin'],
    visibilite:     str(raw.visibilite)     as SectionOptions['visibilite'],
    ancreId:        str(raw.ancreId),
    niveauTitre:    str(raw.niveauTitre)    as SectionOptions['niveauTitre'],
    couleurTexte:   str(raw.couleurTexte)   as SectionOptions['couleurTexte'],
  }
}

function extractTypographie(raw: unknown): TypographieOptions {
  const r = raw as Record<string, unknown> | null | undefined
  if (!r) return {}
  return {
    tailleTexte: str(r.tailleTexte) as TypographieOptions['tailleTexte'],
    alignement:  str(r.alignement)  as TypographieOptions['alignement'],
    poids:       str(r.poids)       as TypographieOptions['poids'],
  }
}

// ─── Adaptateurs bloc Payload → props React ───────────────────────────────────

function adaptHero(b: PayloadBlock): CmsHero {
  const ctaPrimaire   = b.ctaPrimaire   as Record<string, unknown> | null | undefined
  const ctaSecondaire = b.ctaSecondaire as Record<string, unknown> | null | undefined
  return {
    badge:        str(b.badge),
    titre:        str(b.titre),
    sousTitre:    str(b.sousTitre),
    cta1Texte:    str(ctaPrimaire?.texte)   ?? null,
    cta2Texte:    str(ctaSecondaire?.texte) ?? null,
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
    badge:         str(b.badge),
    titre:         str(b.titre),
    texte:         str(b.texte),
    image:         b.image ? { url: mediaUrl(b.image) } : null,
    videoFichier:  mediaUrl(b.videoFichier),
    videoUrl:      str(b.videoUrl),
    ctaTexte:      str(b.ctaTexte),
    imagePosition: (str(b.imagePosition) as 'gauche' | 'droite') || null,
  }

  if (stats[0]) { cms.stat1Valeur = num(stats[0].valeur); cms.stat1Suffixe = str(stats[0].suffixe); cms.stat1Label = str(stats[0].label) }
  if (stats[1]) { cms.stat2Valeur = num(stats[1].valeur); cms.stat2Suffixe = str(stats[1].suffixe); cms.stat2Label = str(stats[1].label) }
  if (stats[2]) { cms.stat3Valeur = num(stats[2].valeur); cms.stat3Suffixe = str(stats[2].suffixe); cms.stat3Label = str(stats[2].label) }
  if (stats[3]) { cms.stat4Valeur = num(stats[3].valeur); cms.stat4Suffixe = str(stats[3].suffixe); cms.stat4Label = str(stats[3].label) }

  return cms
}

function adaptWhyUs(b: PayloadBlock): CmsPourquoiNous {
  type ArgRaw = { icone?: string | null; titre?: string | null; texte?: string | null }
  const args = arr<ArgRaw>(b.arguments)
  return {
    titre:     str(b.titre),
    sousTitre: str(b.sousTitre),
    items: args.length
      ? args.map((a) => ({ icone: a.icone ?? null, titre: a.titre ?? '', description: a.texte ?? '' }))
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

function adaptServices(b: PayloadBlock, fallback: ServiceData[]): ServiceData[] {
  const rel = b.services
  if (Array.isArray(rel) && rel.length > 0) {
    return (rel as ServicePayload[]).map((s) => ({
      id: s.id, nom: s.nom ?? '', slug: s.slug ?? '', icone: s.icone ?? null,
    }))
  }
  return fallback
}

function adaptTestimonials(b: PayloadBlock, fallback: TestimonialData[]): TestimonialData[] {
  const rel = b.temoignages
  if (Array.isArray(rel) && rel.length > 0) {
    const nombreMax = typeof b.nombreMax === 'number' ? b.nombreMax : 20
    return (rel as TestimonialPayload[]).slice(0, nombreMax).map((t) => ({
      id: t.id, nom: t.nom ?? '', ville: t.ville ?? '',
      note: String(t.note ?? 5), texte: t.texte ?? '', photo: t.photo ?? null,
    }))
  }
  return fallback
}

function adaptPartners(b: PayloadBlock, fallback: PartnerData[]): PartnerData[] {
  const rel = b.partenaires
  if (Array.isArray(rel) && rel.length > 0) {
    return (rel as PartnerPayload[]).map((p) => ({
      id: p.id, nom: p.nom ?? '',
      logo: p.logo ? { url: mediaUrl(p.logo) } : null,
      lien: p.lien ?? null,
    }))
  }
  return fallback
}

function adaptVilles(b: PayloadBlock, fallback: MapVille[]): MapVille[] {
  const rel = b.villes
  if (Array.isArray(rel) && rel.length > 0) {
    return (rel as VillePayload[])
      .filter((v) => v.nom && v.slug && v.coordonnees?.lat != null && v.coordonnees?.lng != null)
      .map((v) => ({
        nom: v.nom!, slug: v.slug!, lat: v.coordonnees!.lat!, lng: v.coordonnees!.lng!, region: v.region ?? '',
      }))
  }
  return fallback
}

function adaptPays(b: PayloadBlock, fallback: MapPays[]): MapPays[] {
  const rel = b.pays
  if (Array.isArray(rel) && rel.length > 0) {
    return (rel as PaysPayload[])
      .filter((p) => p.nom && p.slug && p.coordonnees?.lat != null && p.coordonnees?.lng != null)
      .map((p) => ({
        nom: p.nom!, slug: p.slug!, drapeau: p.drapeau ?? '', lat: p.coordonnees!.lat!, lng: p.coordonnees!.lng!,
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
  villes,
  pays,
  googleReviewsNode,
  telephone,
}: BlockRendererProps) {
  if (!blocks.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? `block-${index}`

        if (block.actif === false) return null

        const sectionOpts = extractSectionOptions(block)
        const typoTitre   = extractTypographie(block.typographieTitre)
        const typoTexte   = extractTypographie(block.typographieTexte)

        switch (block.blockType) {

          case 'hero':
            return (
              <HeroBlock
                key={key}
                cms={adaptHero(block)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                telephone={telephone}
              />
            )

          case 'mini-features':
            return (
              <MiniFeaturesBlock
                key={key}
                cms={adaptMiniFeatures(block)}
                sectionOptions={sectionOpts}
              />
            )

          case 'about':
            return (
              <StatsAboutBlock
                key={key}
                cms={adaptAbout(block)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                couleurAccent={str(block.couleurAccent) as 'rouge' | 'or' | null}
              />
            )

          case 'services':
            return (
              <ServicesBlock
                key={key}
                services={adaptServices(block, services)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                cms={{
                  titre:     str(block.titre),
                  sousTitre: str(block.sousTitre),
                  ctaTexte:  str(block.ctaTexte),
                  layout:    (str(block.layout) as 'grille' | 'liste' | 'carrousel' | null),
                  colonnes:  str(block.colonnes),
                }}
              />
            )

          case 'why-us':
            return (
              <WhyUsBlock
                key={key}
                cms={adaptWhyUs(block)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
              />
            )

          case 'map':
            return (
              <MapBlock
                key={key}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                cms={{
                  titre:     str(block.titre),
                  sousTitre: str(block.sousTitre),
                  mode:      (str(block.mode) as 'tunisie' | 'europe' | 'complet' | null),
                }}
                villes={adaptVilles(block, villes)}
                pays={adaptPays(block, pays)}
              />
            )

          case 'testimonials':
            return (
              <TestimonialsBlock
                key={key}
                testimonials={adaptTestimonials(block, testimonials)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                cms={{
                  titre:     str(block.titre),
                  sousTitre: str(block.sousTitre),
                  affichage: (str(block.affichage) as 'carrousel' | 'grille' | 'liste' | null),
                }}
              />
            )

          case 'google-reviews':
            return <React.Fragment key={key}>{googleReviewsNode}</React.Fragment>

          case 'partners':
            return (
              <PartnersBlock
                key={key}
                partners={adaptPartners(block, partners)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                cms={{
                  titre:     str(block.titre),
                  affichage: (str(block.affichage) as 'defilement' | 'grille' | null),
                }}
              />
            )

          case 'instagram-feed':
            return (
              <InstagramFeedBlock
                key={key}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                cms={{ titre: str(block.titre), lienProfil: str(block.lienProfil) }}
              />
            )

          case 'newsletter':
            return (
              <NewsletterBlock
                key={key}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                cms={{
                  titre:            str(block.titre),
                  sousTitre:        str(block.sousTitre),
                  texteBouton:      str(block.texteBouton),
                  placeholderEmail: str(block.placeholderEmail),
                  texteRgpd:        str(block.texteRgpd),
                }}
              />
            )

          case 'blog-preview': {
            type RawArticle = {
              id?: string | number
              titre?: string
              slug?: string
              extrait?: string | null
              imageAlaUne?: { url?: string | null } | null
              tempsLecture?: number | null
              datePublication?: string | null
              categories?: { id?: string; nom?: string }[] | null
            }
            const rawArticles     = arr<RawArticle>(block.articles)
            const manualArticles: BlogArticleData[] = rawArticles
              .filter((a) => a && typeof a === 'object' && typeof a.slug === 'string')
              .map((a) => ({
                id:              String(a.id ?? ''),
                titre:           a.titre ?? '',
                slug:            a.slug  ?? '',
                extrait:         a.extrait         ?? null,
                imageAlaUne:     a.imageAlaUne     ?? null,
                tempsLecture:    a.tempsLecture    ?? null,
                datePublication: a.datePublication ?? null,
                categories:      a.categories      ?? null,
              }))
            const nombreArticles = num(block.nombreArticles) ?? 3
            const articlesToShow = manualArticles.length > 0 ? manualArticles : blog.slice(0, nombreArticles)
            return (
              <BlogPreviewBlock
                key={key}
                articles={articlesToShow}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                cms={{
                  titre:          str(block.titre),
                  sousTitre:      str(block.sousTitre),
                  ctaTexte:       str(block.ctaTexte),
                  nombreArticles: nombreArticles,
                }}
              />
            )
          }

          case 'cta':
            return (
              <CTAFinalBlock
                key={key}
                cms={adaptCta(block)}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
                telephone={telephone}
              />
            )

          case 'stats': {
            type StatRaw = { valeur?: number | null; suffixe?: string | null; libelle?: string | null }
            const statsArr = arr<StatRaw>(block.stats).filter((s) => s.valeur != null).slice(0, 4)
            if (!statsArr.length) return null
            const StatsH = resolveHeadingTag(sectionOpts)
            const statsTitleTypo = resolveTitleTypography(typoTitre)
            const desktopCols = statsArr.length === 2 ? 'md:grid-cols-2'
                              : statsArr.length === 3 ? 'md:grid-cols-3'
                              : 'md:grid-cols-4'
            const statsAccent = str(block.couleurAccent) === 'rouge'
              ? 'text-[var(--color-red)]'
              : 'text-[var(--color-gold)]'
            return (
              <SectionWrapper key={key} options={sectionOpts} defaultFond="sombre" defaultEspacement="normal">
                {str(block.titre) && (
                  <StatsH
                    className={cx('font-heading font-bold text-center text-[var(--color-text-light)] mb-12', statsTitleTypo)}
                    style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                  >
                    {str(block.titre)}
                  </StatsH>
                )}
                <div className={cx('grid grid-cols-2 gap-8 max-w-5xl mx-auto', desktopCols)}>
                  {statsArr.map((stat, i) => (
                    <div key={i} className="text-center border-t-2 border-[var(--color-red)] pt-6">
                      <CounterAnimation
                        target={stat.valeur!}
                        suffix={stat.suffixe ?? ''}
                        className={cx('font-mono text-4xl font-bold', statsAccent)}
                      />
                      {stat.libelle && (
                        <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mt-2">
                          {stat.libelle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            )
          }

          case 'faq': {
            type FAQItemRaw = { actif?: boolean | null; question?: string | null; reponse?: unknown }
            const faqCms: FaqCms = {
              titre:     str(block.titre),
              sousTitre: str(block.sousTitre),
              questions: arr<FAQItemRaw>(block.questions).map((q) => ({
                actif:    typeof q.actif === 'boolean' ? q.actif : true,
                question: q.question ?? '',
                reponse:  q.reponse  ?? null,
              })),
            }
            return (
              <FAQBlock
                key={key}
                cms={faqCms}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
              />
            )
          }

          case 'video': {
            const urlRaw = str(block.urlVideo)
            if (!urlRaw) return null
            const embedUrl = urlRaw.includes('watch?v=')
              ? urlRaw.replace('watch?v=', 'embed/')
              : urlRaw
            const VideoHeading   = resolveHeadingTag(sectionOpts)
            const videoTitleTypo = resolveTitleTypography(typoTitre)
            const videoTextTypo  = resolveTextTypography(typoTexte)
            return (
              <SectionWrapper key={key} options={sectionOpts} defaultFond="sombre" defaultEspacement="normal">
                <div className="max-w-4xl mx-auto">
                  {str(block.titre) && (
                    <VideoHeading
                      className={cx(
                        'font-heading font-bold text-[var(--color-text-light)] mb-8',
                        !typoTitre?.alignement && 'text-center',
                        videoTitleTypo,
                      )}
                      style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                    >
                      {str(block.titre)}
                    </VideoHeading>
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
                    <p className={cx(
                      'font-body text-[var(--color-text-muted)] text-sm mt-4',
                      !typoTexte?.alignement && 'text-center',
                      videoTextTypo,
                    )}>
                      {str(block.sousTitre)}
                    </p>
                  )}
                </div>
              </SectionWrapper>
            )
          }

          case 'gallery': {
            type ImgRaw = { image?: { url?: string | null } | null; legende?: string | null }
            const images = arr<ImgRaw>(block.images).filter((i) => i.image?.url)
            if (!images.length) return null
            const cols = str(block.colonnes) ?? '3'
            const gridCols = cols === '2' ? 'grid-cols-2'
                           : cols === '4' ? 'grid-cols-2 md:grid-cols-4'
                           :               'grid-cols-2 md:grid-cols-3'
            const GalleryHeading   = resolveHeadingTag(sectionOpts)
            const galleryTitleTypo = resolveTitleTypography(typoTitre)
            return (
              <SectionWrapper key={key} options={sectionOpts} defaultFond="sombre2" defaultEspacement="normal">
                <div className="max-w-7xl mx-auto">
                  {str(block.titre) && (
                    <GalleryHeading
                      className={cx(
                        'font-heading font-bold text-[var(--color-text-light)] mb-10',
                        !typoTitre?.alignement && 'text-center',
                        galleryTitleTypo,
                      )}
                      style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                    >
                      {str(block.titre)}
                    </GalleryHeading>
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
              </SectionWrapper>
            )
          }

          case 'custom': {
            const customFondMap: Record<string, SectionOptions['fond']> = {
              noir: 'sombre', fonce: 'sombre2', rouge: 'rouge', blanc: 'transparent',
            }
            const customEspMap: Record<string, SectionOptions['espacement']> = {
              compact: 'serre', normal: 'normal', large: 'large',
            }
            const couleurFond  = str(block.couleurFond) ?? 'noir'
            const isLegacyBlanc = couleurFond === 'blanc' && !sectionOpts.fond
            const mergedOpts: SectionOptions = {
              ...sectionOpts,
              fond:       sectionOpts.fond      ?? customFondMap[couleurFond] ?? 'sombre',
              espacement: sectionOpts.espacement ?? customEspMap[str(block.espacement) ?? 'normal'] ?? 'normal',
            }
            const textClass  = isLegacyBlanc ? 'text-[var(--color-bg-dark)]'    : 'text-[var(--color-text-light)]'
            const mutedClass = isLegacyBlanc ? 'text-[var(--color-bg-dark)]/70' : 'text-[var(--color-text-muted)]'
            const ctaBlock   = block.cta as Record<string, unknown> | null | undefined
            const btnHref    = str(ctaBlock?.lien)
            const btnTxt     = str(ctaBlock?.texte)
            const imgUrl     = mediaUrl(block.imagePrincipale)
            const CustomHeading   = resolveHeadingTag(mergedOpts)
            const customTitleTypo = resolveTitleTypography(typoTitre)
            const customTextTypo  = resolveTextTypography(typoTexte)
            return (
              <SectionWrapper
                key={key}
                options={mergedOpts}
                className={isLegacyBlanc ? 'bg-[var(--color-text-light)]' : ''}
              >
                <div className={cx('max-w-4xl mx-auto', !typoTitre?.alignement && 'text-center')}>
                  {str(block.titre) && (
                    <CustomHeading
                      className={cx('font-heading font-bold mb-4', textClass, customTitleTypo)}
                      style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                    >
                      {str(block.titre)}
                    </CustomHeading>
                  )}
                  {str(block.sousTitre) && (
                    <p className={cx('font-body text-lg mb-6', mutedClass, customTextTypo)}>
                      {str(block.sousTitre)}
                    </p>
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
              </SectionWrapper>
            )
          }

          case 'process': {
            type EtapeRaw = { titre?: string | null; description?: string | null; icone?: string | null }
            const etapes = arr<EtapeRaw>(block.etapes)
            const processCms: ProcessCms = {
              titre:     str(block.titre),
              sousTitre: str(block.sousTitre),
              layout:    (str(block.layout) as ProcessCms['layout']),
              etapes:    etapes.map((e) => ({
                titre:       e.titre       ?? '',
                description: e.description ?? null,
                icone:       e.icone       ?? null,
              })),
            }
            return (
              <ProcessBlock
                key={key}
                cms={processCms}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
              />
            )
          }

          case 'pricing': {
            type CaracRaw  = { texte?: string | null; inclus?: boolean | null }
            type FormuleRaw = {
              nom?: string | null; prix?: string | null; description?: string | null
              caracteristiques?: CaracRaw[]; misEnAvant?: boolean | null
              badgeTexte?: string | null; ctaTexte?: string | null; ctaLien?: string | null
            }
            const formules   = arr<FormuleRaw>(block.formules)
            const pricingCms: PricingCms = {
              titre:      str(block.titre),
              sousTitre:  str(block.sousTitre),
              noteDeBase: str(block.noteDeBase),
              formules: formules.map((f) => ({
                nom:         f.nom         ?? '',
                prix:        f.prix        ?? null,
                description: f.description ?? null,
                misEnAvant:  f.misEnAvant  ?? false,
                badgeTexte:  f.badgeTexte  ?? null,
                ctaTexte:    f.ctaTexte    ?? null,
                ctaLien:     f.ctaLien     ?? null,
                caracteristiques: arr<CaracRaw>(f.caracteristiques).map((c) => ({
                  texte: c.texte ?? '', inclus: c.inclus ?? true,
                })),
              })),
            }
            return (
              <PricingBlock
                key={key}
                cms={pricingCms}
                sectionOptions={sectionOpts}
                typoTitre={typoTitre}
                typoTexte={typoTexte}
              />
            )
          }

          default:
            return null
        }
      })}
    </>
  )
}
