import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Count unread client messages across all dossiers — used by admin nav badge
export async function GET(request: Request) {
  let payload
  try { payload = await getPayload({ config }) } catch {
    return NextResponse.json({ count: 0 })
  }

  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return NextResponse.json({ count: 0 })
  }

  // Simple query: all messages with auteur=client and lu=false
  // No relationship filter needed — works across all dossiers
  const result = await payload.find({
    collection: 'messages',
    where: {
      and: [
        { auteur: { equals: 'client' } },
        { lu:     { equals: false } },
      ],
    },
    limit: 0,
    overrideAccess: true,
  })

  return NextResponse.json({ count: result.totalDocs })
}
