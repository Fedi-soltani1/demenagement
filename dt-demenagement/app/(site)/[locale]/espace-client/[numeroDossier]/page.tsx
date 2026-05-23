import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COMPANY } from '@/lib/constants'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StatusBadge, StatusProgress } from '@/components/espace-client/StatusBadge'
import { MessageThread } from '@/components/espace-client/MessageThread'
import { MapPin, Calendar, Package, FileText, ArrowLeft, Phone } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string; numeroDossier: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { numeroDossier } = await params
  return {
    title: `Dossier ${numeroDossier} — ${COMPANY.name}`,
    robots: { index: false, follow: false },
  }
}

type MessageDoc = {
  id: string | number
  auteur: 'client' | 'admin'
  contenu: string
  lu: boolean
  createdAt: string
  clientId?: string
}

type DemenagementDoc = {
  id: string | number
  numeroDossier: string
  statut: string
  dateDemenagement?: string
  clientId: string
  adresseDepart?:  { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }
  adresseArrivee?: { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }
  servicesInclus?: string[]
  volumeM3?: number
  demenageur?: { nom?: string; telephone?: string }
  documents?: { id: string; nom: string; type: string; fichier?: { url?: string } }[]
}

const SERVICES_LABELS: Record<string, string> = {
  'transporteur-en-tunisie': 'Transporteur en Tunisie',
  'transfert-entreprises':   'Transfert Entreprises',
  'location-monte-meubles':  'Location Monte-Meubles',
  'gardes-meubles':          'Gardes Meubles',
  'services-emballage':      'Services Emballage',
  'montage-demontage':       'Montage / Démontage',
}

export default async function DossierPage({ params }: PageProps) {
  const { locale, numeroDossier } = await params
  setRequestLocale(locale)

  const session = await auth()
  if (!session?.user?.email) redirect('/connexion')

  const t = await getTranslations({ locale, namespace: 'EspaceClient' })
  const payload = await getPayload({ config })

  // Vérifier que le dossier appartient au client connecté
  const result = await payload.find({
    collection: 'demenagements',
    where:      { numeroDossier: { equals: numeroDossier }, clientId: { equals: session.user.email } },
    limit:      1,
    overrideAccess: true,
  })

  const dossier = result.docs[0] as DemenagementDoc | undefined
  if (!dossier) notFound()

  // Fetch messages du dossier
  const messagesResult = await payload.find({
    collection: 'messages',
    where:      { 'demenagement': { equals: dossier.id } },
    sort:       'createdAt',
    limit:      100,
    overrideAccess: true,
  })
  const messages = messagesResult.docs as MessageDoc[]

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'),      href: `/${locale}` },
          { label: t('breadcrumbDashboard'), href: '/espace-client' },
          { label: `#${dossier.numeroDossier}` },
        ]}
      />

      <main className="min-h-screen bg-[var(--color-bg-dark)] py-12 px-container">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/espace-client"
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
              aria-label={t('backToDashboard')}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-[var(--color-gold)]">#{dossier.numeroDossier}</span>
                <StatusBadge statut={dossier.statut} />
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] mb-6">
            <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">{t('progressLabel')}</p>
            <StatusProgress statut={dossier.statut} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">

              {/* Adresses */}
              <Card title={t('addressesTitle')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AddressBlock
                    label={t('departLabel')}
                    adresse={dossier.adresseDepart?.adresse}
                    ville={dossier.adresseDepart?.ville}
                    etage={dossier.adresseDepart?.etage}
                    ascenseur={dossier.adresseDepart?.ascenseur}
                  />
                  <AddressBlock
                    label={t('arriveeLabel')}
                    adresse={dossier.adresseArrivee?.adresse}
                    ville={dossier.adresseArrivee?.ville}
                    etage={dossier.adresseArrivee?.etage}
                    ascenseur={dossier.adresseArrivee?.ascenseur}
                  />
                </div>
              </Card>

              {/* Services inclus */}
              {(dossier.servicesInclus?.length ?? 0) > 0 && (
                <Card title={t('servicesInclusTitle')}>
                  <div className="flex flex-wrap gap-2">
                    {dossier.servicesInclus!.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-red)]/8 border border-[var(--color-red)]/15 text-[var(--color-red)] font-body text-xs font-medium">
                        <Package className="w-3 h-3" aria-hidden="true" />
                        {SERVICES_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Documents */}
              {(dossier.documents?.length ?? 0) > 0 && (
                <Card title={t('documentsTitle')}>
                  <ul className="space-y-2">
                    {dossier.documents!.map((doc) => (
                      <li key={doc.id}>
                        {doc.fichier?.url ? (
                          <a
                            href={doc.fichier.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/[0.02] hover:border-[var(--color-red)]/20 hover:bg-[var(--color-red)]/5 transition-all group"
                          >
                            <FileText className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-red)] transition-colors" aria-hidden="true" />
                            <span className="font-body text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] flex-1">{doc.nom}</span>
                            <span className="font-body text-xs text-[var(--color-text-muted)] capitalize">{doc.type.replace('_', ' ')}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 opacity-50">
                            <FileText className="w-4 h-4" aria-hidden="true" />
                            <span className="font-body text-sm text-[var(--color-text-muted)]">{doc.nom}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Messagerie */}
              <Card title={t('messagerieTitle')}>
                <MessageThread
                  messages={messages}
                  dossierId={String(dossier.id)}
                  clientEmail={session.user.email!}
                  labels={{
                    placeholder:  t('messagePlaceholder'),
                    send:         t('messageSend'),
                    sending:      t('messageSending'),
                    fromAdmin:    t('messageFromAdmin'),
                    fromClient:   t('messageFromClient'),
                    emptyHint:    t('messageEmptyHint'),
                  }}
                />
              </Card>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-4">

              {/* Infos clés */}
              <Card title={t('infoTitle')}>
                <dl className="space-y-3">
                  {dossier.dateDemenagement && (
                    <InfoRow
                      icon={<Calendar className="w-3.5 h-3.5" />}
                      label={t('dateLabel')}
                      value={new Date(dossier.dateDemenagement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    />
                  )}
                  {dossier.volumeM3 && (
                    <InfoRow
                      icon={<Package className="w-3.5 h-3.5" />}
                      label={t('volumeLabel')}
                      value={`${dossier.volumeM3} m³`}
                    />
                  )}
                </dl>
              </Card>

              {/* Déménageur assigné */}
              {dossier.demenageur?.nom && (
                <Card title={t('demenageurTitle')}>
                  <p className="font-body text-sm text-[var(--color-text-light)] mb-1">{dossier.demenageur.nom}</p>
                  {dossier.demenageur.telephone && (
                    <a
                      href={`tel:${dossier.demenageur.telephone}`}
                      className="flex items-center gap-1.5 font-body text-xs text-[var(--color-red)] hover:underline"
                    >
                      <Phone className="w-3 h-3" aria-hidden="true" />
                      {dossier.demenageur.telephone}
                    </a>
                  )}
                </Card>
              )}

              {/* Contact DT */}
              <Card title={t('contactTitle')}>
                <a
                  href={`tel:${COMPANY.phone1}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-red)]/8 border border-[var(--color-red)]/15 text-[var(--color-red)] font-body text-sm font-semibold hover:bg-[var(--color-red)]/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {COMPANY.phone1}
                </a>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-5 rounded-2xl border border-white/8 bg-white/[0.02]">
      <h2 className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </section>
  )
}

function AddressBlock({ label, adresse, ville, etage, ascenseur }: {
  label: string; adresse?: string; ville?: string; etage?: string; ascenseur?: boolean
}) {
  return (
    <div>
      <p className="font-body text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
        <MapPin className="w-3 h-3 text-[var(--color-red)]" aria-hidden="true" />
        {label}
      </p>
      <p className="font-body text-sm text-[var(--color-text-light)]">{adresse ?? '—'}</p>
      {ville && <p className="font-body text-xs text-[var(--color-text-muted)]">{ville}</p>}
      {etage && <p className="font-body text-xs text-[var(--color-text-muted)]">Étage : {etage}{ascenseur ? ' · Ascenseur' : ''}</p>}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[var(--color-text-muted)] mt-0.5">{icon}</span>
      <div>
        <dt className="font-body text-xs text-[var(--color-text-muted)]">{label}</dt>
        <dd className="font-body text-sm text-[var(--color-text-light)]">{value}</dd>
      </div>
    </div>
  )
}
