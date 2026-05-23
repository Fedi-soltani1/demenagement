import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { COMPANY, SERVICES, VILLES, PAYS } from '@/lib/constants'
import type { NavService, NavVille, NavPays, NavSettings } from '@/components/layout/Navbar'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({
  services: cmsServices,
  villes:   villesProp,
  pays:     paysProp,
  settings: settingsProp,
}: {
  services?:  NavService[]
  villes?:    NavVille[]
  pays?:      NavPays[]
  settings?:  NavSettings
}) {
  const t = useTranslations('Footer')

  const displayServices: NavService[] = (cmsServices && cmsServices.length > 0)
    ? cmsServices
    : SERVICES.map((s) => ({ nom: s.nom, slug: s.slug }))

  const villes = (villesProp && villesProp.length > 0)
    ? villesProp
    : VILLES.map((v) => ({ nom: v.nom, slug: v.slug }))

  const pays = (paysProp && paysProp.length > 0)
    ? paysProp
    : PAYS.map((p) => ({ nom: p.nom, slug: p.slug, drapeau: p.drapeau }))

  const phone1          = settingsProp?.telephone1      ?? COMPANY.phone1
  const phone2          = settingsProp?.telephone2      ?? COMPANY.phone2
  const email           = settingsProp?.email           ?? COMPANY.email
  const adresse         = settingsProp?.adresse         ?? COMPANY.address
  const horaires        = settingsProp?.horaires        ?? null
  const facebook        = settingsProp?.facebook        ?? COMPANY.facebook
  const instagram       = settingsProp?.instagram       ?? COMPANY.instagram
  const whatsapp        = settingsProp?.whatsapp        ?? COMPANY.whatsapp
  const whatsappMessage = settingsProp?.whatsappMessage ?? COMPANY.whatsappMessage
  const tagline         = settingsProp?.tagline         ?? null

  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      href:  facebook,
      label: t('followFacebook'),
      icon:  <IconFacebook />,
    },
    {
      href:  instagram,
      label: t('followInstagram'),
      icon:  <IconInstagram />,
    },
    {
      href:  `https://wa.me/${whatsapp.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`,
      label: t('contactWhatsapp'),
      icon:  <IconWhatsApp />,
    },
  ] as const

  return (
    <footer
      aria-label={t('ariaLabel')}
      className="bg-[var(--color-bg-dark-2)] border-t border-[var(--color-border)]"
    >
      {/* ── Main columns ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* ── Col 1 : Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo placeholder */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-red)] flex items-center justify-center shrink-0">
                <span className="font-display text-white text-sm font-bold select-none">DT</span>
              </div>
              <span className="font-display text-[var(--color-text-light)] font-bold text-lg leading-none">
                DT Déménagement
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
              {tagline ?? t('tagline')}
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-5">
              {adresse && (
                <div className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <IconMapPin />
                  <span>{adresse}</span>
                </div>
              )}
              {horaires && (
                <div className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <span className="shrink-0 mt-0.5">🕐</span>
                  <span className="whitespace-pre-line">{horaires}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <PhoneLink numero={phone1} source="footer" />
              </div>
              {phone2 && (
                <div className="flex items-center gap-2">
                  <PhoneLink numero={phone2} source="footer" />
                </div>
              )}
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
              >
                <IconMail />
                <span>{email}</span>
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (${t('newTab')})`}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-red)] hover:border-[var(--color-red)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 : Services ── */}
          <div>
            <h3 className="font-heading text-[var(--color-text-light)] font-semibold text-base mb-4">
              {t('servicesTitle')}
            </h3>
            <ul className="space-y-2.5">
              {displayServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
                  >
                    {service.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 : Zones ── */}
          <div>
            <h3 className="font-heading text-[var(--color-text-light)] font-semibold text-base mb-4">
              {t('zonesTitle')}
            </h3>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              {t('tunisiaLabel')}
            </p>
            <ul className="space-y-2 mb-4">
              {villes.slice(0, 6).map((ville) => (
                <li key={ville.slug}>
                  <Link
                    href={`/villes/${ville.slug}`}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
                  >
                    {ville.nom}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/zones"
                  className="text-sm font-medium text-[var(--color-red)] hover:text-[var(--color-red-light)] transition-colors"
                >
                  {t('allCities')} →
                </Link>
              </li>
            </ul>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              {t('europeLabel')}
            </p>
            <ul className="space-y-2">
              {pays.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <Link
                    href="/zones"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
                  >
                    {p.drapeau} {p.nom}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/zones#europe"
                  className="text-sm font-medium text-[var(--color-red)] hover:text-[var(--color-red-light)] transition-colors"
                >
                  {t('allCountries')} →
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Col 4 : Quick links + CTA ── */}
          <div>
            <h3 className="font-heading text-[var(--color-text-light)] font-semibold text-base mb-4">
              {t('linksTitle')}
            </h3>
            <ul className="space-y-2.5 mb-6">
              {(
                [
                  { key: 'blog',    path: '/blog' },
                  { key: 'about',   path: '/a-propos' },
                  { key: 'contact', path: '/contact' },
                  { key: 'faq',     path: '/faq' },
                  { key: 'careers', path: '/recrutement' },
                ] as const
              ).map(({ key, path }) => (
                <li key={key}>
                  <Link
                    href={path}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA devis */}
            <Link
              href="/devis"
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-[var(--radius-btn)] bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] hover:shadow-[0_0_20px_rgba(181,32,39,0.4)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark-2)]"
            >
              {t('devis')}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-muted)] text-center sm:text-start">
            © {currentYear} DT Déménagement Tunisie. {t('rights')}
          </p>
          <nav
            aria-label={t('legalNav')}
            className="flex items-center gap-4 flex-wrap justify-center"
          >
            {(
              [
                { key: 'privacy', path: '/politique-confidentialite' },
                { key: 'terms',   path: '/mentions-legales' },
                { key: 'cookies', path: '/politique-cookies' },
                { key: 'sitemap', path: '/plan-du-site' },
              ] as const
            ).map(({ key, path }) => (
              <Link
                key={key}
                href={path}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
