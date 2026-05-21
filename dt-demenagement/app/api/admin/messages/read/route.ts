import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

const schema = z.object({ dossierId: z.number() })

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'dossierId requis' }, { status: 422 })
  }

  // Find all unread client messages for this dossier
  const unread = await payload.find({
    collection: 'messages',
    where: {
      and: [
        { demenagement: { equals: parsed.data.dossierId } },
        { auteur:       { equals: 'client' } },
        { lu:           { equals: false } },
      ],
    },
    limit: 200,
    overrideAccess: true,
  })

  // Mark each one as read
  await Promise.all(
    unread.docs.map((msg) =>
      payload.update({
        collection: 'messages',
        id: msg.id,
        data: { lu: true },
        overrideAccess: true,
      })
    )
  )

  return NextResponse.json({ updated: unread.docs.length })
}
