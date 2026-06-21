import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/auth'
import { getPayloadSafe } from '@/lib/payload-safe'
import { COMPANY } from '@/lib/constants'
import { dossierOwnershipWhere, matchesIdentity } from '@/lib/espace-client-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MessagesHub } from '@/components/espace-client/MessagesHub'
import type { ConversationStat } from '@/app/api/client/conversations/route'

export const dynamic = 'force-dynamic'

interface PageProps { params: Promise<{ locale: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:  `Messages — ${COMPANY.name}`,
    robots: { index: false, follow: false },
  }
}

type MessageDoc = {
  id:           string | number
  auteur:       'client' | 'admin'
  contenu:      string
  createdAt:    string
  luParClient:  boolean
  demenagement: number | { id: number } | null
}

type DossierDoc = { id: number; numeroDossier: string; statut: string; clientId?: string | null; telephone?: string | null }

export default async function MessagesPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  if (!session?.user?.email) redirect(`/${locale}/connexion`)

  const payload = await getPayloadSafe()
  let conversations: ConversationStat[] = []

  if (payload) {
    // session.user.email est garanti non-null par le redirect ci-dessus
    const identity = session.user.email!
    const dossiersResult = await payload.find({
      collection: 'demenagements',
      where:      dossierOwnershipWhere(identity),
      sort:       '-createdAt',
      limit:      50,
      depth:      0,
      overrideAccess: true,
    })

    const docs = (dossiersResult.docs as DossierDoc[]).filter((d) => matchesIdentity(identity, d))
    const ids  = docs.map((d) => d.id)

    let allMessages: MessageDoc[] = []
    if (ids.length > 0) {
      const msgResult = await payload.find({
        collection: 'messages',
        where:      { or: ids.map((id) => ({ demenagement: { equals: id } })) },
        sort:       '-createdAt',
        limit:      1000,
        depth:      0,
        overrideAccess: true,
      })
      allMessages = msgResult.docs as MessageDoc[]
    }

    const latestMsg = new Map<number, MessageDoc>()
    const unreadMap = new Map<number, number>()

    for (const msg of allMessages) {
      const did =
        typeof msg.demenagement === 'number'
          ? msg.demenagement
          : (msg.demenagement as { id: number } | null)?.id ?? -1
      if (!latestMsg.has(did)) latestMsg.set(did, msg)
      if (msg.auteur === 'admin' && !msg.luParClient) {
        unreadMap.set(did, (unreadMap.get(did) ?? 0) + 1)
      }
    }

    conversations = docs.map((d) => {
      const lm = latestMsg.get(d.id)
      return {
        dossierId:     d.id,
        numeroDossier: d.numeroDossier,
        statut:        d.statut,
        unreadCount:   unreadMap.get(d.id) ?? 0,
        lastMessage: lm
          ? { contenu: lm.contenu, auteur: lm.auteur, createdAt: lm.createdAt }
          : null,
      }
    })
  }

  const totalUnread = conversations.reduce((n, c) => n + c.unreadCount, 0)

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Accueil',    href: `/${locale}` },
          { label: 'Mon espace', href: `/${locale}/espace-client` },
          { label: 'Messages' },
        ]}
      />

      <main className="min-h-screen bg-[var(--color-bg-dark)] py-10 px-container">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center gap-4 mb-8">
            <Link
              href={`/${locale}/espace-client`}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
              aria-label="Retour au tableau de bord"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-bold text-[var(--color-text-light)] text-xl">
                Messages
              </h1>
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--color-red)] text-white font-body text-xs font-bold">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
          </div>

          <MessagesHub
            dossiers={conversations}
            locale={locale}
            clientEmail={session.user.email!}
          />
        </div>
      </main>
    </>
  )
}
