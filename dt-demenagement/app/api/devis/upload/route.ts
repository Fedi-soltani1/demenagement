import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { rateLimit, clientIp } from '@/lib/ratelimit'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  // Rate limiting AVANT tout traitement (20 uploads / minute / IP — plusieurs photos par devis)
  if (!rateLimit(`upload:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Corps invalide — multipart/form-data attendu' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Champ "file" manquant' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Format non supporté. Utilisez JPEG, PNG, WebP ou HEIC.' }, { status: 415 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Fichier trop volumineux. Maximum 5 Mo par photo.' }, { status: 413 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const payload = await getPayload({ config })

  const media = await payload.create({
    collection: 'media',
    data: { alt: file.name },
    file: {
      data:     buffer,
      mimetype: file.type,
      name:     file.name,
      size:     file.size,
    },
    overrideAccess: true,
  })

  const url: string = typeof media.url === 'string' ? media.url : `${process.env.NEXT_PUBLIC_SERVER_URL}/media/${media.filename as string}`

  return NextResponse.json({ id: String(media.id), url }, { status: 201 })
}
