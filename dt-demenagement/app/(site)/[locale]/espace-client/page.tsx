import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getPayloadSafe } from '@/lib/payload-safe'
import { COMPANY, LOCALES } from '@/lib/constants'
import { dossierOwnershipWhere, clientLookupWhere } from '@/lib/espace-client-query'
import { parseLoginIdentity } from '@/lib/client-identity'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StatusBadge } from '@/components/espace-client/StatusBadge'
import { SignOutButton } from '@/components/espace-client/SignOutButton'
import { WelcomeBanner } from '@/components/espace-client/WelcomeBanner'
import {
  MapPin, Calendar, Package, ArrowRight, User,
  Truck, Plus, Clock, CheckCircle, FileText, MessageSquare,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps { params: Promise<{ locale: string }> }

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'EspaceClient' })
  return {
    title:       `${t('dashboardTitle')} — ${COMPANY.name}`,
    description: t('dashboardDescription'),
    robots:      { index: false, follow: false },
  }
}

type DemenagementDoc = {
  id:               string | number
  numeroDossier:    string
  statut:           string
  commentaire?:     string
  dateDemenagement?: string
  adresseDepart?:  { adresse?: string; ville?: string }
  adresseArrivee?: { adresse?: string; ville?: string }
  servicesInclus?:  string[]
  devisStatut?:     string
  clientId:         string
}

function detectType(doc: DemenagementDoc): 'livraison' | 'demenagement' {
  if (doc.commentaire?.startsWith('[LIVRAISON]')) return 'livraison'
  return 'demenagement'
}

export default async function EspaceClientPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  if (!session?.user?.email) redirect(`/${locale}/connexion`)

  const t       = await getTranslations({ locale, namespace: 'EspaceClient' })
  const payload = await getPayloadSafe()

  let dossiers: DemenagementDoc[] = []

  if (payload) {
    const identity = session.user.email
    const parsed = parseLoginIdentity(identity)

    // Auto-création de la fiche client uniquement pour une identité email réelle.
    if (parsed.kind === 'email') {
      const existing = await payload.find({
        collection: 'clients',
        where: clientLookupWhere(identity),
        limit: 1,
        overrideAccess: true,
      })
      if (existing.totalDocs === 0) {
        const prefix = parsed.email.split('@')[0] ?? parsed.email
        const partsName = prefix.replace(/[._-]+/g, ' ').trim().split(' ')
        await payload.create({
          collection: 'clients',
          data: { email: parsed.email, prenom: partsName[0] ?? '—', nom: partsName.slice(1).join(' ') || '—' },
          overrideAccess: true,
        })
      }
    }

    const result = await payload.find({
      collection: 'demenagements',
      where:      dossierOwnershipWhere(identity),
      sort:       '-createdAt',
      limit:      50,
      overrideAccess: true,
    })
    dossiers = result.docs as DemenagementDoc[]
  }

  // Unread messages count — use `or` on each dossier ID (safer than `in` on relationship fields)
  let messagesNonLus = 0
  if (payload && dossiers.length > 0) {
    const ids = dossiers.map((d) => d.id as number)
    const unreadResult = await payload.find({
      collection: 'messages',
      where: {
        and: [
          { or: ids.map((id) => ({ demenagement: { equals: id } })) },
          { auteur:      { equals: 'admin' } },
          { luParClient: { equals: false } },
        ],
      },
      limit: 0,
      overrideAccess: true,
    })
    messagesNonLus = unreadResult.totalDocs
  }

  // Stats
  const enCours         = dossiers.filter(d => ['confirme','en_preparation','en_cours'].includes(d.statut)).length
  const devisEnAttente  = dossiers.filter(d => d.devisStatut === 'envoye').length
  const termines        = dossiers.filter(d => d.statut === 'livre').length
  const prochainDossier = dossiers.find(d => d.dateDemenagement && ['confirme','en_preparation'].includes(d.statut))

  const identityParsed = parseLoginIdentity(session.user.email)
  const contactLabel = identityParsed.kind === 'phone' ? `+${identityParsed.phoneCore}` : session.user.email

  const displayName = session.user.name
    ?? (identityParsed.kind === 'email' ? identityParsed.email.split('@')[0]?.replace(/[._-]+/g, ' ') : contactLabel)
    ?? contactLabel

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbDashboard') },
        ]}
      />

      <main className="min-h-screen bg-[var(--color-bg-dark)] py-12 px-container">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="font-heading font-bold text-[var(--color-text-light)] text-2xl leading-tight">
                    Bonjour, {displayName.split(' ')[0]} 👋
                  </h1>
                  <p className="font-body text-xs text-[var(--color-text-muted)]">{contactLabel}</p>
                </div>
              </div>
            </div>
            <SignOutButton locale={locale} label={t('signOut')} />
          </div>

          {/* ── Bannière bienvenue (première connexion) ── */}
          <WelcomeBanner />

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard
              value={String(dossiers.length)}
              label="Dossiers total"
              icon={<FileText className="w-4 h-4" />}
              color="text-[var(--color-text-muted)]"
            />
            <StatCard
              value={String(enCours)}
              label="En cours"
              icon={<Clock className="w-4 h-4" />}
              color="text-blue-400"
              highlight={enCours > 0}
            />
            <StatCard
              value={String(devisEnAttente)}
              label="Devis à valider"
              icon={<FileText className="w-4 h-4" />}
              color="text-amber-400"
              highlight={devisEnAttente > 0}
              badge={devisEnAttente > 0 ? '!' : undefined}
            />
            <StatCard
              value={String(termines)}
              label="Terminés"
              icon={<CheckCircle className="w-4 h-4" />}
              color="text-emerald-400"
            />
          </div>

          {/* ── Prochain déménagement ── */}
          {prochainDossier?.dateDemenagement && (
            <div className="mb-8 p-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 flex items-center gap-4">
              <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-body text-xs text-amber-400/80 uppercase tracking-widest mb-0.5">Prochain déménagement</p>
                <p className="font-body text-sm text-[var(--color-text-light)] font-semibold">
                  {new Date(prochainDossier.dateDemenagement).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {' '}· Dossier <span className="text-[var(--color-gold)]">#{prochainDossier.numeroDossier}</span>
                </p>
              </div>
              <Link
                href={`/${locale}/espace-client/${prochainDossier.numeroDossier}`}
                className="flex-shrink-0 text-amber-400 hover:text-amber-300 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ── Actions rapides ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Link
              href={`/${locale}/espace-client/nouveau`}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-[var(--color-red)]/30 bg-[var(--color-red)]/5 hover:bg-[var(--color-red)]/10 hover:border-[var(--color-red)]/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--color-red)]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-red)]/25 transition-colors">
                <Truck className="w-5 h-5 text-[var(--color-red)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-[var(--color-text-light)]">Nouveau déménagement</p>
                <p className="font-body text-xs text-[var(--color-text-muted)]">Devis personnalisé</p>
              </div>
              <Plus className="w-4 h-4 text-[var(--color-red)] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>

            <Link
              href={`/${locale}/espace-client/nouveau`}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                <Package className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-[var(--color-text-light)]">Nouvelle livraison</p>
                <p className="font-body text-xs text-[var(--color-text-muted)]">Transport de colis</p>
              </div>
              <Plus className="w-4 h-4 text-[var(--color-text-muted)] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>

            {/* Messages quick link */}
            <Link
              href={`/${locale}/espace-client/messages`}
              className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                messagesNonLus > 0
                  ? 'border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/10 hover:border-violet-400/50'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              {messagesNonLus > 0 && (
                <span className="absolute top-3 end-3 min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-red)] text-white font-body text-[10px] font-bold flex items-center justify-center">
                  {messagesNonLus > 9 ? '9+' : messagesNonLus}
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:opacity-80 transition-opacity ${
                messagesNonLus > 0 ? 'bg-violet-400/15' : 'bg-white/5'
              }`}>
                <MessageSquare className={`w-5 h-5 ${messagesNonLus > 0 ? 'text-violet-400' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)]'} transition-colors`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-[var(--color-text-light)]">Messages</p>
                <p className="font-body text-xs text-[var(--color-text-muted)]">
                  {messagesNonLus > 0
                    ? `${messagesNonLus} non lu${messagesNonLus > 1 ? 's' : ''}`
                    : 'Conversations'}
                </p>
              </div>
              <ArrowRight className={`w-4 h-4 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity ${messagesNonLus > 0 ? 'text-violet-400' : 'text-[var(--color-text-muted)]'}`} />
            </Link>
          </div>

          {/* ── Dossiers ── */}
          <div>
            <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
              Mes dossiers ({dossiers.length})
            </p>

            {dossiers.length === 0 ? (
              <EmptyState locale={locale} />
            ) : (
              <div className="space-y-3">
                {dossiers.map((d) => {
                  const type = detectType(d)
                  return (
                    <Link
                      key={d.id}
                      href={`/${locale}/espace-client/${d.numeroDossier}`}
                      className="group block p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[var(--color-red)]/20 hover:bg-white/[0.04] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Icon type */}
                        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/5 items-center justify-center flex-shrink-0">
                          {type === 'livraison'
                            ? <Package className="w-4 h-4 text-[var(--color-text-muted)]" />
                            : <Truck   className="w-4 h-4 text-[var(--color-text-muted)]" />
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-bold text-[var(--color-gold)]">
                              #{d.numeroDossier}
                            </span>
                            <StatusBadge statut={d.statut} />
                            {d.devisStatut === 'envoye' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold bg-amber-400/10 border border-amber-400/20 text-amber-400">
                                ⚡ Devis à valider
                              </span>
                            )}
                            {d.devisStatut === 'accepte' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                                ✓ Devis accepté
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1">
                            {d.adresseDepart?.ville && (
                              <span className="flex items-center gap-1.5 font-body text-xs text-[var(--color-text-muted)]">
                                <MapPin className="w-3 h-3 text-[var(--color-red)]" aria-hidden="true" />
                                {d.adresseDepart.ville}
                                {d.adresseArrivee?.ville && (
                                  <><span aria-hidden="true">→</span>{d.adresseArrivee.ville}</>
                                )}
                              </span>
                            )}
                            {d.dateDemenagement && (
                              <span className="flex items-center gap-1.5 font-body text-xs text-[var(--color-text-muted)]">
                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                {new Date(d.dateDemenagement).toLocaleDateString(
                                  locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-GB' : 'fr-FR',
                                  { day: 'numeric', month: 'long', year: 'numeric' }
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-red)] transition-colors flex-shrink-0 hidden sm:block" aria-hidden="true" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}

function StatCard({ value, label, icon, color, highlight = false, badge }: {
  value: string
  label: string
  icon: React.ReactNode
  color: string
  highlight?: boolean
  badge?: string
}) {
  return (
    <div className={`relative p-4 rounded-2xl border ${
      highlight ? 'border-white/15 bg-white/[0.04]' : 'border-white/8 bg-white/[0.02]'
    }`}>
      {badge && (
        <span className="absolute top-2 end-2 w-4 h-4 rounded-full bg-amber-400 text-[var(--color-bg-dark)] text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="font-mono text-2xl font-bold text-[var(--color-text-light)]">{value}</p>
      <p className="font-body text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}

function EmptyState({ locale }: { locale: string }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mx-auto mb-6">
        <Package className="w-8 h-8 text-[var(--color-text-muted)]" aria-hidden="true" />
      </div>
      <h2 className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-2">
        Aucun dossier pour l&apos;instant
      </h2>
      <p className="font-body text-sm text-[var(--color-text-muted)] mb-8 max-w-sm mx-auto">
        Soumettez votre première demande de devis et suivez son avancement en temps réel.
      </p>
      <Link
        href={`/${locale}/espace-client/nouveau`}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
      >
        <Plus className="w-4 h-4" />
        Faire une demande
      </Link>
    </div>
  )
}
