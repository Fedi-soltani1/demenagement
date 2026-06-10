'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { MenuToggleIcon } from '@/components/ui/MenuToggleIcon'
import { COMPANY, VILLES, PAYS } from '@/lib/constants'
import { useDevisModal } from '@/components/layout/DevisModal'

export type NavService  = { nom: string; slug: string }
export type NavVille    = { nom: string; slug: string }
export type NavPays     = { nom: string; slug: string; drapeau: string }
export type NavLien     = { libelle: string; chemin: string }
export type NavSettings = {
  telephone1:         string
  telephone2?:        string | null
  whatsapp:           string
  whatsappMessage:    string
  email:              string
  adresse?:           string | null
  horaires?:          string | null
  facebook?:          string | null
  instagram?:         string | null
  tagline?:           string | null
  liensNavigation?:   NavLien[] | null
  logoUrl?:           string | null
  copyright?:         string | null
  navbarCtaTexte?:    string | null
  navbarCtaLien?:     string | null
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      className={['transition-transform duration-200 shrink-0', open ? 'rotate-180' : ''].join(' ')}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle({
  labelDark,
  labelLight,
}: {
  labelDark: string
  labelLight: string
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Render placeholder to avoid layout shift before mount
  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />

  const isDark = theme !== 'light'
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? labelLight : labelDark}
      className="w-9 h-9 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded-full"
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  )
}

// ─── CTA Link styled as primary button ────────────────────────────────────────

const ctaClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold ' +
  'rounded-[var(--radius-btn)] bg-[var(--color-red)] text-white ' +
  'hover:bg-[var(--color-red-dark)] hover:shadow-[0_0_20px_rgba(181,32,39,0.4)] ' +
  'transition-all duration-200 focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]'

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  services = [],
  villes:   villesProp,
  pays:     paysProp,
  settings: settingsProp,
}: {
  services?:  NavService[]
  villes?:    NavVille[]
  pays?:      NavPays[]
  settings?:  NavSettings
}) {
  const villes   = villesProp  ?? VILLES.map((v) => ({ nom: v.nom, slug: v.slug }))
  const pays     = paysProp    ?? PAYS.map((p) => ({ nom: p.nom, slug: p.slug, drapeau: p.drapeau }))
  const phone1   = settingsProp?.telephone1 ?? COMPANY.phone1
  const phone2   = settingsProp?.telephone2 ?? COMPANY.phone2
  const t = useTranslations('Navbar')
  const pathname = usePathname()

  const { open: openDevisModal } = useDevisModal()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'services' | 'zones' | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<'services' | 'zones' | null>(null)

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close everything on route change
  useEffect(() => {
    setIsMobileOpen(false)
    setActiveDropdown(null)
    setMobileExpanded(null)
  }, [pathname])

  // Escape key closes menus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
        setIsMobileOpen(false)
        setMobileExpanded(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const toggleDropdown = useCallback((name: 'services' | 'zones') => {
    setActiveDropdown((prev) => (prev === name ? null : name))
  }, [])

  const toggleMobile = useCallback((name: 'services' | 'zones') => {
    setMobileExpanded((prev) => (prev === name ? null : name))
  }, [])

  const defaultNavLinks: NavLien[] = [
    { libelle: t('blog'),    chemin: '/blog' },
    { libelle: t('faq'),     chemin: '/faq' },
    { libelle: t('about'),   chemin: '/a-propos' },
    { libelle: t('contact'), chemin: '/contact' },
  ]
  const navLinks: NavLien[] = (settingsProp?.liensNavigation && settingsProp.liensNavigation.length > 0)
    ? settingsProp.liensNavigation
    : defaultNavLinks

  return (
    <>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[10000] focus-visible:bg-[var(--color-red)] focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded focus-visible:outline-none"
      >
        {t('skipToContent')}
      </a>

      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[var(--color-bg-dark)]/95 backdrop-blur-sm border-b border-[var(--color-border)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
              aria-label={t('logoAlt')}
            >
              {settingsProp?.logoUrl ? (
                <Image
                  src={settingsProp.logoUrl}
                  alt="DT Déménagement"
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
                />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-red)] flex items-center justify-center transition-opacity group-hover:opacity-90 shrink-0">
                    <span className="font-display text-white text-sm font-bold select-none">DT</span>
                  </div>
                  <span className="font-heading font-bold text-[var(--color-red)] text-xl tracking-wider hidden sm:block">
                    DT DÉMÉNAGEMENT
                  </span>
                </>
              )}
            </Link>

            {/* ── Desktop navigation ── */}
            <nav
              aria-label="Navigation principale"
              className="hidden lg:flex items-center gap-0.5 ms-8"
            >
              {/* Services dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  aria-expanded={activeDropdown === 'services'}
                  aria-controls="nav-dropdown-services"
                  onClick={() => toggleDropdown('services')}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
                >
                  {t('services')}
                  <IconChevronDown open={activeDropdown === 'services'} />
                </button>

                {activeDropdown === 'services' && (
                  <div
                    id="nav-dropdown-services"
                    role="menu"
                    aria-label={t('services')}
                    className="absolute top-full start-0 mt-1 w-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl py-2"
                  >
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        role="menuitem"
                        className="flex items-center px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-white/5 transition-colors"
                      >
                        {service.nom}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Zones dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('zones')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  aria-expanded={activeDropdown === 'zones'}
                  aria-controls="nav-dropdown-zones"
                  onClick={() => toggleDropdown('zones')}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
                >
                  {t('zones')}
                  <IconChevronDown open={activeDropdown === 'zones'} />
                </button>

                {activeDropdown === 'zones' && (
                  <div
                    id="nav-dropdown-zones"
                    role="menu"
                    aria-label={t('zones')}
                    className="absolute top-full start-0 mt-1 w-80 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl p-4"
                  >
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
                      {t('tunisiaLabel')}
                    </p>
                    <div className="grid grid-cols-2 gap-0.5 mb-4">
                      {villes.slice(0, 8).map((ville) => (
                        <Link
                          key={ville.slug}
                          href={`/villes/${ville.slug}`}
                          role="menuitem"
                          className="px-2 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-white/5 rounded transition-colors"
                        >
                          {ville.nom}
                        </Link>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
                      {t('europeLabel')}
                    </p>
                    <div className="flex flex-wrap gap-x-1 gap-y-0.5 mb-3">
                      {pays.map((p) => (
                        <Link
                          key={p.slug}
                          href="/zones"
                          role="menuitem"
                          className="px-2 py-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-white/5 rounded transition-colors"
                        >
                          {p.drapeau} {p.nom}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[var(--color-border)]">
                      <Link
                        href="/zones"
                        role="menuitem"
                        className="text-sm font-medium text-[var(--color-red)] hover:text-[var(--color-red-light)] transition-colors"
                      >
                        {t('allZones')} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Static nav links */}
              {navLinks.map(({ libelle, chemin }) => (
                <Link
                  key={chemin}
                  href={chemin}
                  className="px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
                >
                  {libelle}
                </Link>
              ))}
            </nav>

            {/* ── Desktop right actions ── */}
            <div className="hidden lg:flex items-center gap-2 ms-auto ps-4">
              <PhoneLink numero={phone1} source="navbar" />
              <ThemeToggle labelDark={t('switchToDark')} labelLight={t('switchToLight')} />
              {settingsProp?.navbarCtaLien && !settingsProp.navbarCtaLien.startsWith('/devis') ? (
                <Link
                  href={settingsProp.navbarCtaLien}
                  className={ctaClass}
                >
                  {settingsProp.navbarCtaTexte ?? t('devis')}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openDevisModal()}
                  className={ctaClass}
                >
                  {settingsProp?.navbarCtaTexte ?? t('devis')}
                </button>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav-menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[var(--color-text-light)] hover:text-[var(--color-red)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
            >
              <MenuToggleIcon open={isMobileOpen} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {isMobileOpen && (
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('openMenu')}
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-[var(--color-bg-dark)] overflow-y-auto border-t border-[var(--color-border)] z-40"
          >
            <nav aria-label="Navigation mobile" className="px-4 py-4 space-y-0.5">

              {/* Services accordion */}
              <div>
                <button
                  type="button"
                  aria-expanded={mobileExpanded === 'services'}
                  onClick={() => toggleMobile('services')}
                  className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-[var(--color-text-light)] hover:text-[var(--color-red)] transition-colors rounded"
                >
                  {t('services')}
                  <IconChevronDown open={mobileExpanded === 'services'} />
                </button>
                {mobileExpanded === 'services' && (
                  <div className="ms-4 border-s-2 border-[var(--color-red)]/30 ps-4 pb-2 space-y-0.5">
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="block py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors"
                      >
                        {service.nom}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Zones accordion */}
              <div>
                <button
                  type="button"
                  aria-expanded={mobileExpanded === 'zones'}
                  onClick={() => toggleMobile('zones')}
                  className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-[var(--color-text-light)] hover:text-[var(--color-red)] transition-colors rounded"
                >
                  {t('zones')}
                  <IconChevronDown open={mobileExpanded === 'zones'} />
                </button>
                {mobileExpanded === 'zones' && (
                  <div className="ms-4 border-s-2 border-[var(--color-red)]/30 ps-4 pb-2">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-1 mb-2">
                      {t('tunisiaLabel')}
                    </p>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      {villes.slice(0, 8).map((ville) => (
                        <Link
                          key={ville.slug}
                          href={`/villes/${ville.slug}`}
                          className="py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors"
                        >
                          {ville.nom}
                        </Link>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                      {t('europeLabel')}
                    </p>
                    <div className="space-y-1 mb-2">
                      {pays.map((p) => (
                        <Link
                          key={p.slug}
                          href="/zones"
                          className="block py-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors"
                        >
                          {p.drapeau} {p.nom}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/zones"
                      className="text-sm font-medium text-[var(--color-red)] hover:text-[var(--color-red-light)] transition-colors"
                    >
                      {t('allZones')} →
                    </Link>
                  </div>
                )}
              </div>

              {/* Static links */}
              {navLinks.map(({ libelle, chemin }) => (
                <Link
                  key={chemin}
                  href={chemin}
                  className="block px-3 py-3 text-base font-medium text-[var(--color-text-light)] hover:text-[var(--color-red)] transition-colors rounded"
                >
                  {libelle}
                </Link>
              ))}
            </nav>

            {/* Mobile bottom actions */}
            <div className="px-4 py-4 border-t border-[var(--color-border)] space-y-3">
              <div className="flex flex-col gap-2">
                <PhoneLink numero={phone1} source="navbar-mobile" />
                {phone2 && <PhoneLink numero={phone2} source="navbar-mobile" />}
              </div>
              {settingsProp?.navbarCtaLien && !settingsProp.navbarCtaLien.startsWith('/devis') ? (
                <Link
                  href={settingsProp.navbarCtaLien}
                  onClick={() => setIsMobileOpen(false)}
                  className={[ctaClass, 'w-full justify-center py-3 text-base'].join(' ')}
                >
                  {settingsProp.navbarCtaTexte ?? t('devis')}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsMobileOpen(false); openDevisModal() }}
                  className={[ctaClass, 'w-full justify-center py-3 text-base'].join(' ')}
                >
                  {settingsProp?.navbarCtaTexte ?? t('devis')}
                </button>
              )}
              <div className="flex items-center justify-end pt-1">
                <ThemeToggle labelDark={t('switchToDark')} labelLight={t('switchToLight')} />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export { Navbar }
