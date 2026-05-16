import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { LOCALES, COMPANY, SERVICES } from '@/lib/constants'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Plan du site — ${COMPANY.name}` }
}

export default async function PlanDuSitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const mainLinks = [
    { label: 'Accueil',           href: `/${locale}` },
    { label: 'Nos services',      href: `/${locale}/services` },
    { label: 'Zones d\'intervention', href: `/${locale}/zones` },
    { label: 'Blog & conseils',   href: `/${locale}/blog` },
    { label: 'À propos',          href: `/${locale}/a-propos` },
    { label: 'Contact',           href: `/${locale}/contact` },
    { label: 'Devis gratuit',     href: `/${locale}/devis` },
    { label: 'FAQ',               href: `/${locale}/faq` },
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
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${locale}/services/${s.slug}`} className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors text-sm">
                    {s.slug.replace(/-/g, ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-[var(--color-red)] text-sm uppercase tracking-widest mb-4">Mentions légales</h2>
            <ul className="space-y-3">
              {[
                { label: 'Politique de confidentialité', href: `/${locale}/politique-confidentialite` },
                { label: 'Mentions légales',             href: `/${locale}/mentions-legales` },
                { label: 'Politique cookies',            href: `/${locale}/politique-cookies` },
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
