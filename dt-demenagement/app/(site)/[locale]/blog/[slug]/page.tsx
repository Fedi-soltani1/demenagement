import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import config from '@payload-config'
import { unstable_noStore as noStore } from 'next/cache'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BlogLivePreviewWrapper } from '@/components/blocks/BlogLivePreviewWrapper'
import { GoogleReviewsBlock } from '@/components/blocks/GoogleReviewsBlock'
import { Clock, Calendar, User, ArrowLeft, Share2 } from 'lucide-react'

import type { ServiceData }       from '@/components/blocks/ServicesBlock'
import type { TestimonialData }   from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData }   from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }       from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'

export const dynamic = 'force-dynamic'

interface BlogPageProps {
  params: Promise<{ locale: string; slug: string }>
}

type CategoryDoc = { id: string | number; nom?: string }

type ArticleDoc = {
  id: string | number
  slug: string
  titre: string
  extrait: string
  contenu?: unknown
  blocks?: unknown[]
  imageAlaUne?: { url?: string; alt?: string } | null
  auteur?: string
  categories?: CategoryDoc[]
  tags?: { tag: string }[]
  tempsLecture?: number
  publie?: boolean
  datePublication?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { url?: string } | null
  }
}

async function getArticle(slug: string, locale: string): Promise<ArticleDoc | null> {
  noStore()
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog',
    draft: isDraft,
    where: isDraft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { publie: { equals: true } }] },
    locale: locale as 'fr' | 'ar' | 'en',
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as ArticleDoc) ?? null
}

async function getRelatedArticles(currentSlug: string, locale: string): Promise<ArticleDoc[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog',
    where: { slug: { not_equals: currentSlug }, publie: { equals: true } },
    locale: locale as 'fr' | 'ar' | 'en',
    limit: 3,
    sort: '-datePublication',
  })
  return result.docs as ArticleDoc[]
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog',
    where: { publie: { equals: true } },
    limit: 200,
  })

  return LOCALES.flatMap((locale) =>
    result.docs.map((doc) => ({ locale, slug: (doc as ArticleDoc).slug }))
  )
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticle(slug, locale)
  if (!article) return { title: 'Article introuvable' }

  const title = article.seo?.metaTitle ?? `${article.titre} — ${COMPANY.name}`
  const description = article.seo?.metaDescription ?? article.extrait
  const ogImage = article.seo?.ogImage?.url ?? article.imageAlaUne?.url

  const base = buildMetadata({ title, description, path: `/blog/${slug}`, locale, image: ogImage })
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type:          'article',
      publishedTime: article.datePublication,
      authors:       article.auteur ? [article.auteur] : [],
    },
  }
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-GB' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [article, relatedArticles] = await Promise.all([
    getArticle(slug, locale),
    getRelatedArticles(slug, locale),
  ])

  if (!article) notFound()

  // Données partagées passées aux blocs (mirroir des pages Villes / Services)
  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  const [
    servicesRes,
    testimonialsRes,
    blogRes,
    partnersRes,
    villesRes,
    paysRes,
    settingsRes,
  ] = await Promise.all([
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
      where: { publie: { equals: true } },
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

    payload.find({
      collection: 'villes',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: loc,
      limit: 50,
      depth: 0,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'pays',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: loc,
      limit: 30,
      depth: 0,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.findGlobal({ slug: 'settings', locale: loc, depth: 0 })
      .catch(() => null),
  ])

  const s = settingsRes as {
    telephone1?: string | null; email?: string | null; adresse?: string | null; horaires?: string | null
    facebook?: string | null; instagram?: string | null; linkedin?: string | null; tiktok?: string | null; whatsapp?: string | null
  } | null

  // Données globales passées aux blocs Coordonnées / Réseaux sociaux
  const siteSettings = {
    telephone: s?.telephone1 ?? COMPANY.phone1,
    email:     s?.email     ?? COMPANY.email,
    adresse:   s?.adresse   ?? null,
    horaires:  s?.horaires  ?? null,
    facebook:  s?.facebook  ?? null,
    instagram: s?.instagram ?? null,
    linkedin:  s?.linkedin  ?? null,
    tiktok:    s?.tiktok    ?? null,
    whatsapp:  s?.whatsapp  ?? null,
  }

  const telephone = siteSettings.telephone

  type VilleMapDoc = {
    nom?: string | null; slug?: string | null; region?: string | null
    coordonnees?: { lat?: number | null; lng?: number | null } | null
  }
  type PaysDoc = {
    nom?: string | null; slug?: string | null; drapeau?: string | null
    coordonnees?: { lat?: number | null; lng?: number | null } | null
  }

  const villesForMap: MapVille[] = (villesRes.docs as VilleMapDoc[])
    .filter((v) => v.nom && v.slug && v.coordonnees?.lat != null && v.coordonnees?.lng != null)
    .map((v) => ({ nom: v.nom!, slug: v.slug!, lat: v.coordonnees!.lat!, lng: v.coordonnees!.lng!, region: v.region ?? '' }))

  const paysForMap: MapPays[] = (paysRes.docs as PaysDoc[])
    .filter((p) => p.nom && p.slug && p.coordonnees?.lat != null && p.coordonnees?.lng != null)
    .map((p) => ({ nom: p.nom!, slug: p.slug!, drapeau: p.drapeau ?? '', lat: p.coordonnees!.lat!, lng: p.coordonnees!.lng! }))

  // Pré-rendu du bloc Google Reviews (configuré depuis le bloc présent dans la page)
  type BlockWithType = { blockType: string; titre?: string | null; afficherNoteGlobale?: boolean | null; nombreAvis?: number | null; noteMinimum?: string | null; [key: string]: unknown }
  const grBlock = (article.blocks as BlockWithType[] | undefined)
    ?.find((b) => b.blockType === 'google-reviews')

  const googleReviewsNode = (
    <GoogleReviewsBlock cms={{
      titre:               grBlock?.titre ?? null,
      afficherNoteGlobale: grBlock?.afficherNoteGlobale ?? null,
      nombreAvis:          grBlock?.nombreAvis ?? null,
      noteMinimum:         grBlock?.noteMinimum ? parseInt(grBlock.noteMinimum, 10) : null,
    }} />
  )

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: `/${locale}` },
          { label: 'Blog', href: '/blog' },
          { label: article.titre },
        ]}
      />

      {/* Image à la une */}
      {article.imageAlaUne?.url && (
        <div className="relative h-[45vh] min-h-[300px] max-h-[520px] w-full overflow-hidden">
          <Image
            src={article.imageAlaUne.url}
            alt={article.imageAlaUne.alt ?? article.titre}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-[var(--color-bg-dark)]/40 to-transparent" />
        </div>
      )}

      {/* Contenu principal */}
      <article className="py-16 px-container bg-[var(--color-bg-dark)]">
        <div className="max-w-3xl mx-auto">
          {/* Catégories */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 rounded-full bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 text-[var(--color-red)] font-body text-xs font-semibold"
                >
                  {cat.nom ?? ''}
                </span>
              ))}
            </div>
          )}

          {/* Titre */}
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            {article.titre}
          </h1>

          {/* Meta : auteur, date, temps lecture */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-white/10">
            {article.auteur && (
              <span className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]">
                <User className="w-4 h-4" aria-hidden="true" />
                {article.auteur}
              </span>
            )}
            {article.datePublication && (
              <time
                dateTime={article.datePublication}
                className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                {formatDate(article.datePublication, locale)}
              </time>
            )}
            {article.tempsLecture && (
              <span className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {article.tempsLecture} min de lecture
              </span>
            )}
          </div>

          {/* Extrait en lead */}
          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-8 italic border-s-4 border-[var(--color-red)]/40 ps-6">
            {article.extrait}
          </p>

          {/* Corps de l'article — block page-builder + Live Preview en temps réel */}
          <BlogLivePreviewWrapper
            initialArticle={article}
            locale={locale}
            slug={slug}
            telephone={telephone}
            settings={siteSettings}
            services={servicesRes.docs as ServiceData[]}
            testimonials={testimonialsRes.docs as TestimonialData[]}
            blog={blogRes.docs as BlogArticleData[]}
            partners={partnersRes.docs as PartnerData[]}
            villes={villesForMap}
            pays={paysForMap}
            googleReviewsNode={googleReviewsNode}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/10">
              {article.tags.map(({ tag }) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 font-body text-xs text-[var(--color-text-muted)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Partager */}
          <div className="mt-8 flex items-center gap-4">
            <span className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]">
              <Share2 className="w-4 h-4" aria-hidden="true" />
              Partager cet article
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${COMPANY.siteUrl}/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full border border-white/15 font-body text-xs text-[var(--color-text-muted)] hover:border-blue-400/40 hover:text-blue-400 transition-colors duration-200"
            >
              Facebook
              <span className="sr-only">(ouvre dans un nouvel onglet)</span>
            </a>
            <a
              href={`https://wa.me/?text=${COMPANY.siteUrl}/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full border border-white/15 font-body text-xs text-[var(--color-text-muted)] hover:border-green-400/40 hover:text-green-400 transition-colors duration-200"
            >
              WhatsApp
              <span className="sr-only">(ouvre dans un nouvel onglet)</span>
            </a>
          </div>
        </div>
      </article>

      {/* Articles récents */}
      {relatedArticles.length > 0 && (
        <section className="py-16 px-container bg-[var(--color-bg-dark2)] border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-10 text-2xl">
              Articles récents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((art) => (
                <Link
                  key={art.id}
                  href={`/blog/${art.slug}`}
                  className="group block rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden hover:border-[var(--color-red)]/30 transition-colors duration-300"
                >
                  {art.imageAlaUne?.url && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={art.imageAlaUne.url}
                        alt={art.imageAlaUne.alt ?? art.titre}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 33vw, 400px"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-2 line-clamp-2 text-sm leading-snug group-hover:text-white transition-colors">
                      {art.titre}
                    </h3>
                    {art.tempsLecture && (
                      <span className="font-body text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {art.tempsLecture} min
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Retour blog */}
      <div className="py-8 px-container bg-[var(--color-bg-dark)] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Retour au blog
          </Link>
        </div>
      </div>

      {/* Schema.org Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.titre,
            description: article.extrait,
            author: { '@type': 'Person', name: article.auteur ?? COMPANY.name },
            publisher: {
              '@type': 'Organization',
              name: COMPANY.name,
              url: COMPANY.siteUrl,
            },
            datePublished: article.datePublication,
            ...(article.imageAlaUne?.url && { image: article.imageAlaUne.url }),
            url: `${COMPANY.siteUrl}/blog/${slug}`,
          }),
        }}
      />
    </>
  )
}
