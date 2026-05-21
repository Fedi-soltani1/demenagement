import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/auth'
import { z } from 'zod'

const schema = z.object({ dossierId: z.coerce.number().int().positive() })

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'dossierId invalide' }, { status: 422 })
  }

  const payload = await getPayload({ config })

  // Find admin messages not yet marked as read by client
  const result = await payload.find({
    collection: 'messages',
    where: {
      and: [
        { demenagement: { equals: parsed.data.dossierId } },
        { auteur: { equals: 'admin' } },
        { luParClient: { equals: false } },
      ],
    },
    limit: 100,
    overrideAccess: true,
  })

  if (result.docs.length > 0) {
    await Promise.all(
      result.docs.map((msg) =>
        payload.update({
          collection: 'messages',
          id: msg.id,
          data: { luParClient: true },
          overrideAccess: true,
        })
      )
    )
  }

  return Response.json({ updated: result.docs.length })
}
