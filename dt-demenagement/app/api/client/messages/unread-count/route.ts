import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ count: 0 })

  let payload
  try { payload = await getPayload({ config }) } catch {
    return NextResponse.json({ count: 0 })
  }

  // Get all client's dossier IDs in one shot
  const dossiersResult = await payload.find({
    collection: 'demenagements',
    where: { clientId: { equals: session.user.email } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const ids = dossiersResult.docs.map((d) => d.id as number)
  if (ids.length === 0) return NextResponse.json({ count: 0 })

  // Count admin messages not yet read by client
  const result = await payload.find({
    collection: 'messages',
    where: {
      and: [
        { demenagement: { in: ids } },
        { auteur:        { equals: 'admin' } },
        { luParClient:   { equals: false } },
      ],
    },
    limit: 0,
    overrideAccess: true,
  })

  return NextResponse.json({ count: result.totalDocs })
}
