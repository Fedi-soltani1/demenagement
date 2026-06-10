import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadSafe } from '@/lib/payload-safe'
import { setRequestLocale } from 'next-intl/server'
import { LOCALES, COMPANY } from '@/lib/constants'

export const revalidate = 3600

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Plan du site — ${COMPANY.name}` }
}

export default async function PlanDuSitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const payload = await getPayloadSafe()

  const [servicesRes, villesRes] = payload
    ? await Promise.all([
        payload.find({
          collection: 'services',
          where: { publie: { equals: true } },
          sort: 'ordre',
          locale: locale as 'fr' | 'ar' | 'en',
          limit: 50,
          select: { nom: true, slug: true },
          depth: 0,
        }).catch(() => ({ docs: [] as unknown[] })),

        payload.find({
          collection: 'villes',
          where: { publie: { equals: true } },
          sort: 'nom',
          locale: locale as 'fr' | 'ar' | 'en',
          limit: 100,
          select: { nom: true, slug: true },
          depth: 0,
        }).catch(() => ({ docs: [] as unknown[] })),
      ])
    : [{ docs: [] as unknown[] }, { docs: [] as unknown[] }]

  type ServiceDoc = { nom?: string | null; slug?: string | null }
  type VilleDoc   = { nom?: string | null; slug?: string | null }

  const services = (servicesRes.docs as ServiceDoc[]).filter((s) => s.nom && s.slug)
  const villes   = (villesRes.docs   as VilleDoc[]).filter((v) => v.nom && v.slug)

  const mainLinks = [
    { label: 'Accueil',               href: '/' },
    { label: 'Nos services',          href: '/services' },
    { label: 'Zones d\'intervention', href: '/zones' },
    { label: 'Blog & conseils',       href: '/blog' },
    { label: 'À propos',              href: '/a-propos' },
    { label: 'Contact',               href: '/contact' },
    { label: 'Devis gratuit',         href: '/devis' },
    { label: 'FAQ',                   href: '/faq' },
  ]

  return (
    <section className="py-section px-container bg-[var(--color-bg-dark)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-[var(--color-text-light)] mb-12" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>
          Plan du site
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          <div>
            <h2 className="font-heading font-semibold text-[var(--color-red)] text-sm uppercase tracking-widest mb-4">Pages principales</h2>
            <ul className="space-y-3">
              {mainLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-[var(--color-red)] text-sm uppercase tracking-widest mb-4">Services</h2>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.slug!}>
                  <Link href={`/services/${s.slug}`} className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors text-sm">
                    {s.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {villes.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-[var(--color-red)] text-sm uppercase tracking-widest mb-4">Villes</h2>
              <ul className="space-y-3">
                {villes.map((v) => (
                  <li key={v.slug!}>
                    <Link href={`/villes/${v.slug}`} className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors text-sm">
                      {v.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="font-heading font-semibold text-[var(--color-red)] text-sm uppercase tracking-widest mb-4">Mentions légales</h2>
            <ul className="space-y-3">
              {[
                { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
                { label: 'Mentions légales',             href: '/mentions-legales' },
                { label: 'Politique cookies',            href: '/politique-cookies' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
