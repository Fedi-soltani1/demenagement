import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dossierId = searchParams.get('dossierId')
  if (!dossierId) {
    return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
  }

  let payload
  try { payload = await getPayload({ config }) } catch {
    return NextResponse.json({ messages: [] })
  }

  // Ownership check — client can only read their own dossiers
  const check = await payload.find({
    collection: 'demenagements',
    where: {
      and: [
        { id:       { equals: Number(dossierId) } },
        { clientId: { equals: session.user.email } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (check.totalDocs === 0) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const result = await payload.find({
    collection: 'messages',
    where: { demenagement: { equals: Number(dossierId) } },
    sort: 'createdAt',
    limit: 100,
    overrideAccess: true,
  })

  return NextResponse.json({ messages: result.docs })
}
