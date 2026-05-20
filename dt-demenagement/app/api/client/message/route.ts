import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'

const schema = z.object({
  dossierId:   z.string().min(1),
  contenu:     z.string().min(1).max(2000),
  clientEmail: z.string().email(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
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

  const { dossierId, contenu, clientEmail } = result.data

  if (clientEmail !== session.user.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const dossierCheck = await payload.find({
    collection: 'demenagements',
    where:      { id: { equals: Number(dossierId) }, clientId: { equals: session.user.email } },
    limit:      1,
    overrideAccess: true,
  })
  if (dossierCheck.totalDocs === 0) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const message = await payload.create({
    collection: 'messages',
    data: {
      demenagement: Number(dossierId),
      auteur:       'client',
      contenu,
      lu:           false,
      clientId:     session.user.email,
    },
    overrideAccess: true,
  })

  return NextResponse.json({ message }, { status: 201 })
}
