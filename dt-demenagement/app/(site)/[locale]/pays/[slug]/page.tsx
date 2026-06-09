import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { DevisButton } from '@/components/ui/DevisButton'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PaysLivePreviewWrapper } from '@/components/blocks/PaysLivePreviewWrapper'
import { GoogleReviewsBlock } from '@/components/blocks/GoogleReviewsBlock'

import type { ServiceData }       from '@/components/blocks/ServicesBlock'
import type { TestimonialData }   from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData }   from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }       from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'

export const dynamic = 'force-dynamic'

interface PaysPageProps {
  params: Promise<{ locale: string; slug: string }>
}

type PaysDoc = {
  id: string | number
  nom: string
  slug: string
  drapeau: string
  blocks?: unknown[]
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null
}

type VilleMapDoc = {
  nom?: string | null
  slug?: string | null
  region?: string | null
  coordonnees?: { lat?: number | null; lng?: number | null } | null
}

type PaysMapDoc = {
  nom?: string | null
  slug?: string | null
  drapeau?: string | null
  coordonnees?: { lat?: number | null; lng?: number | null } | null
}

async function getPays(slug: string, locale: string) {
  noStore()
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  const paysRes = await payload.find({
    collection: 'pays',
    draft: isDraft,
    where: isDraft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { publie: { equals: true } }] },
    locale: loc,
    limit: 1,
    depth: 2,
  })

  const pays = (paysRes.docs[0] as PaysDoc) ?? null
  if (!pays) return null

  // Téléphone depuis les réglages globaux (fallback constante)
  const settings = await payload
    .findGlobal({ slug: 'settings', depth: 0 })
    .catch(() => null) as { telephone1?: string | null } | null
  const telephone = settings?.telephone1 ?? COMPANY.phone1

  return { pays, telephone }
}

export async function generateStaticParams() {
  noStore()
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'pays',
      where: { publie: { equals: true } },
      limit: 100,
      depth: 0,
      select: { slug: true },
    })
    const slugs = (res.docs as Array<{ slug?: string | null }>)
      .map((d) => d.slug)
      .filter((s): s is string => Boolean(s))
    return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PaysPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await getPays(slug, locale)
  if (!data) return { title: 'Pays introuvable' }
  const { pays } = data

  const title       = pays.seo?.metaTitle       ?? `Déménagement ${pays.nom} — ${COMPANY.name}`
  const description = pays.seo?.metaDescription ?? `DT Déménagement assure vos déménagements internationaux vers ${pays.nom}. Suivi complet de A à Z, devis gratuit en 24h.`

  return buildMetadata({ title, description, path: `/pays/${slug}`, locale })
}

export default async function PaysPage({ params }: PaysPageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const data = await getPays(slug, locale)
  if (!data) notFound()

  const { pays, telephone } = data
  const t = await getTranslations({ locale, namespace: 'Villes' })

  // Données partagées passées aux blocs (miroir de la page Ville)
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

  const villesForMap: MapVille[] = (villesRes.docs as VilleMapDoc[])
    .filter((v) => v.nom && v.slug && v.coordonnees?.lat != null && v.coordonnees?.lng != null)
    .map((v) => ({ nom: v.nom!, slug: v.slug!, lat: v.coordonnees!.lat!, lng: v.coordonnees!.lng!, region: v.region ?? '' }))

  const paysForMap: MapPays[] = (paysRes.docs as PaysMapDoc[])
    .filter((p) => p.nom && p.slug && p.coordonnees?.lat != null && p.coordonnees?.lng != null)
    .map((p) => ({ nom: p.nom!, slug: p.slug!, drapeau: p.drapeau ?? '', lat: p.coordonnees!.lat!, lng: p.coordonnees!.lng! }))

  // Pré-rendu du bloc Google Reviews (configuré depuis le bloc présent dans la page)
  type BlockWithType = { blockType: string; titre?: string | null; afficherNoteGlobale?: boolean | null; nombreAvis?: number | null; noteMinimum?: string | null; [key: string]: unknown }
  const grBlock = (pays.blocks as BlockWithType[] | undefined)
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
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbZones'), href: '/zones' },
          { label: `${pays.drapeau} ${pays.nom}`.trim() },
        ]}
      />

      {/* Hero + contenu — entièrement côté client pour le live preview en temps réel */}
      <PaysLivePreviewWrapper
        initialPays={pays}
        locale={locale}
        slug={slug}
        services={servicesRes.docs as ServiceData[]}
        testimonials={testimonialsRes.docs as TestimonialData[]}
        blog={blogRes.docs as BlogArticleData[]}
        partners={partnersRes.docs as PartnerData[]}
        villes={villesForMap}
        pays={paysForMap}
        googleReviewsNode={googleReviewsNode}
        telephone={telephone}
        settings={siteSettings}
      />

      {/* CTA */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-1">
              Prêt à déménager vers {pays.nom ?? slug} ?
            </p>
            <p className="font-body text-[var(--color-text-muted)] text-sm">
              Obtenez votre devis gratuit en moins de 24h.
            </p>
          </div>
          <DevisButton
            ville={pays.nom ?? slug}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            Devis gratuit →
          </DevisButton>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MovingCompany',
            name: COMPANY.name,
            url: COMPANY.siteUrl,
            telephone: COMPANY.phone1,
            areaServed: {
              '@type': 'Country',
              name: pays.nom,
            },
          }),
        }}
      />
    </>
  )
}
