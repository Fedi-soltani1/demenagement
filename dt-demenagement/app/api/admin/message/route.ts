import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

const schema = z.object({
  dossierId: z.number(),
  contenu:   z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { dossierId, contenu } = result.data

  const message = await payload.create({
    collection: 'messages',
    data: {
      demenagement: dossierId,
      auteur:       'admin',
      contenu,
      lu:           true,
    },
    overrideAccess: true,
  })

  // Marquer tous les messages client non lus de ce dossier comme lus
  const unread = await payload.find({
    collection: 'messages',
    where: {
      and: [
        { demenagement: { equals: dossierId } },
        { auteur:        { equals: 'client' } },
        { lu:            { equals: false } },
      ],
    },
    limit: 100,
    overrideAccess: true,
  })

  await Promise.all(
    unread.docs.map((msg) =>
      payload.update({
        collection: 'messages',
        id:         msg.id,
        data:       { lu: true },
        overrideAccess: true,
      })
    )
  )

  return NextResponse.json({ message }, { status: 201 })
}
