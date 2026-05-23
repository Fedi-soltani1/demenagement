import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { COMPANY, LOCALES } from '@/lib/constants'
import { BlockRenderer }          from '@/components/blocks/BlockRenderer'
import { LivePreviewWrapper }     from '@/components/blocks/LivePreviewWrapper'
import { GoogleReviewsBlock }     from '@/components/blocks/GoogleReviewsBlock'
import { buildMetadata, localBusinessSchema } from '@/lib/seo'

import type { ServiceData }     from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }     from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'

// ISR 60s — changes Payload visibles en moins d'une minute
export const revalidate = 60

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home.hero' })
  const title       = `${COMPANY.name} — N°1 Déménagement en Tunisie`
  const description = t('subtitle') || 'Solutions de déménagement pour particuliers et entreprises. Tunis et toute la Tunisie. Devis gratuit en 24h.'
  return buildMetadata({ title, description, path: '', locale })
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  // Fetch en parallèle — Page accueil (avec ses blocs) + collections relationnelles
  const [
    pageData,
    servicesRes,
    testimonialsRes,
    blogRes,
    partnersRes,
    villesRes,
    paysRes,
  ] = await Promise.all([

    // Page accueil depuis la collection Pages (slug = 'accueil')
    // depth: 3 pour peupler les relationships imbriquées dans les blocs
    payload.find({
      collection: 'pages',
      where: {
        and: [
          { slug:   { equals: 'accueil' } },
          { publie: { equals: true }      },
        ],
      },
      locale: loc,
      depth: 3,
      limit: 1,
    }).catch(() => ({ docs: [] as unknown[] })),

    // Services publiés — fallback si le bloc Services n'a pas de sélection manuelle
    payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: loc,
      limit: 12,
    }).catch(() => ({ docs: [] as unknown[] })),

    // Témoignages publiés — fallback si le bloc Témoignages n'a pas de sélection
    payload.find({
      collection: 'testimonials',
      where: { publie: { equals: true } },
      sort: 'ordre',
      limit: 20,
    }).catch(() => ({ docs: [] as unknown[] })),

    // 3 derniers articles de blog publiés
    payload.find({
      collection: 'blog',
      where: { statut: { equals: 'publie' } },
      sort: '-datePublication',
      locale: loc,
      limit: 3,
      depth: 1,
    }).catch(() => ({ docs: [] as unknown[] })),

    // Partenaires publiés
    payload.find({
      collection: 'partners',
      where: { publie: { equals: true } },
      sort: 'ordre',
      limit: 30,
      depth: 1,
    }).catch(() => ({ docs: [] as unknown[] })),

    // Villes tunisiennes publiées (pour la carte)
    payload.find({
      collection: 'villes',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: loc,
      limit: 50,
      depth: 0,
    }).catch(() => ({ docs: [] as unknown[] })),

    // Pays internationaux publiés (pour la carte)
    payload.find({
      collection: 'pays',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: loc,
      limit: 30,
      depth: 0,
    }).catch(() => ({ docs: [] as unknown[] })),
  ])

  // Extraire la page accueil depuis Payload
  type PageDoc = { layout?: unknown[] }
  const page = pageData.docs[0] as PageDoc | undefined

  type VilleDoc = { nom?: string | null; slug?: string | null; region?: string | null; coordonnees?: { lat?: number | null; lng?: number | null } | null }
  type PaysDoc  = { nom?: string | null; slug?: string | null; drapeau?: string | null; coordonnees?: { lat?: number | null; lng?: number | null } | null }

  const villes: MapVille[] = (villesRes.docs as VilleDoc[])
    .filter((v) => v.nom && v.slug && v.coordonnees?.lat != null && v.coordonnees?.lng != null)
    .map((v) => ({ nom: v.nom!, slug: v.slug!, lat: v.coordonnees!.lat!, lng: v.coordonnees!.lng!, region: v.region ?? '' }))

  const pays: MapPays[] = (paysRes.docs as PaysDoc[])
    .filter((p) => p.nom && p.slug && p.coordonnees?.lat != null && p.coordonnees?.lng != null)
    .map((p) => ({ nom: p.nom!, slug: p.slug!, drapeau: p.drapeau ?? '', lat: p.coordonnees!.lat!, lng: p.coordonnees!.lng! }))

  const sharedProps = {
    services:     servicesRes.docs     as ServiceData[],
    testimonials: testimonialsRes.docs as TestimonialData[],
    blog:         blogRes.docs         as BlogArticleData[],
    partners:     partnersRes.docs     as PartnerData[],
    villes,
    pays,
  }

  // Blocs de fallback si aucune page 'accueil' n'est configurée dans Payload
  const fallbackBlocks: Array<{ blockType: string; id?: string; [key: string]: unknown }> = [
    { blockType: 'hero' },
    { blockType: 'mini-features' },
    { blockType: 'about' },
    { blockType: 'why-us' },
    { blockType: 'services' },
    { blockType: 'map' },
    { blockType: 'testimonials' },
    { blockType: 'google-reviews' },
    { blockType: 'partners' },
    { blockType: 'instagram-feed' },
    { blockType: 'newsletter' },
    { blockType: 'blog-preview' },
    { blockType: 'cta' },
  ]

  // Extraire les champs du bloc google-reviews depuis Payload (s'il est défini)
  type BlockWithType = {
    blockType: string
    titre?: string | null
    afficherNoteGlobale?: boolean | null
    nombreAvis?: number | null
    noteMinimum?: string | null
    [key: string]: unknown
  }
  const grBlock = (page?.layout as BlockWithType[] | undefined)
    ?.find((b) => b.blockType === 'google-reviews')

  // GoogleReviewsBlock est un Server Component async — pré-rendu ici pour qu'il
  // puisse être passé comme slot React.ReactNode dans LivePreviewWrapper (Client Component)
  const googleReviewsNode = (
    <GoogleReviewsBlock cms={{
      titre:               grBlock?.titre ?? null,
      afficherNoteGlobale: grBlock?.afficherNoteGlobale ?? null,
      nombreAvis:          grBlock?.nombreAvis ?? null,
      noteMinimum:         grBlock?.noteMinimum ? parseInt(grBlock.noteMinimum, 10) : null,
    }} />
  )

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />
      {page ? (
        // Mode Live Preview : useLivePreview met à jour les blocs en temps réel
        <LivePreviewWrapper
          initialPage={page}
          googleReviewsNode={googleReviewsNode}
          {...sharedProps}
        />
      ) : (
        // Mode fallback : aucune page 'accueil' dans Payload
        <BlockRenderer
          blocks={fallbackBlocks}
          googleReviewsNode={googleReviewsNode}
          {...sharedProps}
        />
      )}
    </main>
  )
}
