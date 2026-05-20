import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dossierId = searchParams.get('dossierId')
  if (!dossierId) {
    return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
  }

  const result = await payload.find({
    collection: 'messages',
    where:      { demenagement: { equals: Number(dossierId) } },
    sort:       'createdAt',
    limit:      200,
    overrideAccess: true,
  })

  return NextResponse.json({ messages: result.docs })
}
