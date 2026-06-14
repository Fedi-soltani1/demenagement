import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Truck, Building2, Warehouse, Package, Wrench, Construction, Box, type LucideIcon } from 'lucide-react'
import { SetPartnerCookie } from '@/components/partenaire/SetPartnerCookie'
import { PartnerLandingMode } from '@/components/partenaire/PartnerLandingMode'
import { PartnerHero } from '@/components/partenaire/PartnerHero'
import { DevisButton } from '@/components/ui/DevisButton'
import { COMPANY } from '@/lib/constants'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

interface PageProps { params: Promise<{ locale: string; slug: string }> }

type PartnerDoc  = { id: number | string; nom?: string; logo?: { url?: string } | string | null }
type ServiceDoc  = { slug?: string; nom?: string; description?: string; icone?: string }
type Loc = 'fr' | 'ar' | 'en'

const ICONS: Record<string, LucideIcon> = {
  truck: Truck, building: Building2, crane: Construction,
  warehouse: Warehouse, package: Package, box: Box, wrench: Wrench,
}
function serviceIcon(name?: string): LucideIcon {
  return (name ? ICONS[name.trim().toLowerCase()] : undefined) ?? Package
}

export default async function PartenairePage({ params }: PageProps) {
  const { locale, slug } = await params
  const loc = locale as Loc
  const payload = await getPayload({ config })

  const partnerRes = await payload.find({
    collection: 'affiliates',
    where: { slug: { equals: slug } },
    limit: 1, depth: 1, locale: loc,
  })
  const partner = partnerRes.docs[0] as PartnerDoc | undefined
  if (!partner) notFound()

  const [settings, servicesRes] = await Promise.all([
    payload.findGlobal({ slug: 'settings', depth: 1, locale: loc }).catch(() => null),
    payload.find({ collection: 'services', where: { publie: { equals: true } }, sort: 'ordre', limit: 6, depth: 0, locale: loc }).catch(() => ({ docs: [] })),
  ])

  const s = settings as {
    logoImage?: { url?: string } | null
    landingPartenaire?: { titre?: string; sousTitre?: string; pill1?: string; pill2?: string; pill3?: string }
  } | null
  const lp         = s?.landingPartenaire
  const dtLogoUrl  = s?.logoImage?.url ?? undefined
  const titre      = lp?.titre     ?? 'Déménagez sereinement avec DT Déménagement Tunisie'
  const sousTitre  = lp?.sousTitre ?? 'Devis gratuit en 2 minutes. Une équipe professionnelle partout en Tunisie et vers l\'international.'
  const pills      = [lp?.pill1 ?? 'Devis gratuit', lp?.pill2 ?? 'Partout en Tunisie', lp?.pill3 ?? 'Équipe professionnelle'].filter(Boolean) as string[]
  const services   = servicesRes.docs as ServiceDoc[]
  const partnerLogoUrl = typeof partner.logo === 'object' && partner.logo ? partner.logo.url : undefined

  return (
    <div className="bg-bg text-text">
      {/* No-flash : masque le chrome du site dès le parsing (avant le 1er paint) */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('partner-landing')" }} />
      <PartnerLandingMode />
      <SetPartnerCookie slug={slug} />

      <PartnerHero
        dtLogoUrl={dtLogoUrl}
        partnerLogoUrl={partnerLogoUrl}
        partnerName={(partner.nom ?? 'Notre partenaire').trim()}
        titre={titre}
        sousTitre={sousTitre}
        pills={pills}
      />

      {/* ── Services ── */}
      {services.length > 0 && (
        <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mb-14 text-center">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">Ce que nous faisons</span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Nos services</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((sv, i) => {
              const Icon = serviceIcon(sv.icone)
              return (
                <article
                  key={sv.slug ?? i}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-red)]/40 hover:shadow-[0_20px_50px_-20px_rgba(181,32,39,0.35)]"
                >
                  <span aria-hidden="true" className="absolute end-6 top-6 font-mono text-sm text-white/10 transition-colors group-hover:text-[var(--color-gold)]/40">
                    0{i + 1}
                  </span>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-red)]/10 text-[var(--color-red)] transition-colors duration-300 group-hover:bg-[var(--color-red)] group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-semibold">{sv.nom}</h3>
                  {sv.description && (
                    <p className="font-body text-sm leading-relaxed text-text-muted line-clamp-3">{sv.description}</p>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden border-t border-border bg-bg-2">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[var(--color-red)]/[0.07] blur-[120px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">Prêt à déménager ?</h2>
          <p className="mx-auto mb-9 max-w-xl font-body text-text-muted">
            Obtenez votre devis gratuit en quelques minutes — sans engagement.
          </p>
          <DevisButton className="inline-flex items-center gap-2 rounded-full bg-[var(--color-red)] px-9 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,32,39,0.5)] active:scale-[0.97]">
            Demander un devis gratuit
          </DevisButton>
        </div>

        {/* ── Mini-footer DT (coordonnées) ── */}
        <footer className="relative border-t border-border px-6 py-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-start">
            <div>
              <p className="font-heading text-base font-bold text-[var(--color-red)]">DT Déménagement Tunisie</p>
              <p className="font-body text-xs text-text-muted">{COMPANY.address}</p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body text-sm text-text-muted">
              <a href={`tel:${COMPANY.phone1}`} className="transition-colors hover:text-text">{COMPANY.phone1}</a>
              <a href={`mailto:${COMPANY.email}`} className="transition-colors hover:text-text">{COMPANY.email}</a>
              <a href={`https://wa.me/${COMPANY.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text">WhatsApp</a>
            </nav>
          </div>
          <p className="mt-6 text-center font-body text-[11px] text-text-muted/60">
            © {new Date().getFullYear()} DT Déménagement Tunisie. Tous droits réservés.
          </p>
        </footer>
      </section>
    </div>
  )
}
