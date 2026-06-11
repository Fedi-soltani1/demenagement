import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'

type MessageDoc = {
  id:           string | number
  auteur:       'client' | 'admin'
  contenu:      string
  createdAt:    string
  luParClient:  boolean
  demenagement: number | { id: number } | null
}

type DossierDoc = {
  id:            number
  numeroDossier: string
  statut:        string
}

export interface ConversationStat {
  dossierId:     number
  numeroDossier: string
  statut:        string
  unreadCount:   number
  lastMessage: {
    contenu:   string
    auteur:    'client' | 'admin'
    createdAt: string
  } | null
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ conversations: [] })

  let payload
  try { payload = await getPayload({ config }) } catch {
    return NextResponse.json({ conversations: [] })
  }

  // All client dossiers
  const dossiersResult = await payload.find({
    collection: 'demenagements',
    where: { clientId: { equals: session.user.email } },
    sort:  '-createdAt',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  const dossiers = dossiersResult.docs as DossierDoc[]
  if (dossiers.length === 0) return NextResponse.json({ conversations: [] })

  const ids = dossiers.map((d) => d.id)

  // All messages for those dossiers — use `or` to avoid any `in` operator edge cases
  // on relationship fields in Payload v3
  const orConditions = ids.map((id) => ({ demenagement: { equals: id } }))

  const msgResult = await payload.find({
    collection: 'messages',
    where: { or: orConditions },
    sort:  '-createdAt',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const allMessages = msgResult.docs as MessageDoc[]

  // Group by dossier — messages already desc sorted, so first seen = latest per dossier
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

  const conversations: ConversationStat[] = dossiers.map((d) => {
    const lm = latestMsg.get(d.id)
    return {
      dossierId:    d.id,
      numeroDossier: d.numeroDossier,
      statut:        d.statut,
      unreadCount:   unreadMap.get(d.id) ?? 0,
      lastMessage: lm
        ? { contenu: lm.contenu, auteur: lm.auteur, createdAt: lm.createdAt }
        : null,
    }
  })

  // Sort: unread first, then by last message recency
  conversations.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1
    const ta = a.lastMessage ? +new Date(a.lastMessage.createdAt) : 0
    const tb = b.lastMessage ? +new Date(b.lastMessage.createdAt) : 0
    return tb - ta
  })

  return NextResponse.json({ conversations })
}
