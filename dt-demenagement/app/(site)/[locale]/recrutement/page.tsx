import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Recrutement — ${COMPANY.name}` }
}

export default async function RecrutementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayload({ config })

  const [pageData, settings] = await Promise.all([
    payload
      .find({
        collection: 'pages',
        where: { and: [{ slug: { equals: 'recrutement' } }, { publie: { equals: true } }] },
        locale: 'fr',
        depth: 3,
        limit: 1,
      })
      .catch(() => ({ docs: [] as unknown[] })),

    payload
      .findGlobal({ slug: 'settings', locale: 'fr', depth: 0 })
      .catch(() => null) as Promise<{ email?: string | null } | null>,
  ])

  type PageDoc = { layout?: unknown[] }
  const page   = pageData.docs[0] as PageDoc | undefined
  const blocks = (page?.layout ?? []) as Array<{ blockType: string; id?: string; [key: string]: unknown }>
  const email  = (settings as { email?: string | null } | null)?.email ?? COMPANY.email

  // Si l'admin a créé une page "recrutement" dans Payload → page builder
  if (blocks.length > 0) {
    return (
      <main>
        <BlockRenderer
          blocks={blocks}
          services={[]}
          testimonials={[]}
          blog={[]}
          partners={[]}
          villes={[]}
          pays={[]}
        />
      </main>
    )
  }

  // Fallback — affiché tant que la page 'recrutement' n'est pas créée dans Payload
  return (
    <section className="min-h-[60vh] flex items-center justify-center py-section px-container bg-[var(--color-bg-dark)]">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
          Carrières
        </span>
        <h1
          className="font-heading font-bold text-[var(--color-text-light)] mb-6"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Rejoignez DT Déménagement
        </h1>
        <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-10">
          Nous sommes toujours à la recherche de talents passionnés. Envoyez votre candidature spontanée à{' '}
          <a href={`mailto:${email}`} className="text-[var(--color-red)] hover:underline">
            {email}
          </a>
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          Nous contacter →
        </Link>
      </div>
    </section>
  )
}
