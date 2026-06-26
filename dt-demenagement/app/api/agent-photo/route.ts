import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { rateLimit, clientIp } from '@/lib/ratelimit'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 Mo

// Upload de la photo de profil par l'agent lui-même.
// La collection `media` n'autorise pas la création par les agents : on passe donc
// par cette route serveur qui vérifie la session agent puis crée le média en
// overrideAccess et rattache la photo à l'enregistrement de l'agent connecté.
export async function POST(request: Request) {
  if (!(await rateLimit(`agent-photo:${clientIp(request)}`, 10, 60_000))) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
  }

  const payload = await getPayload({ config })

  // Authentification : doit être un agent connecté (cookie de session Payload).
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'agents') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
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
    return NextResponse.json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const media = await payload.create({
    collection: 'media',
    data: { alt: `Photo agent ${String(user.id)}` },
    file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
    overrideAccess: true,
  })

  await payload.update({
    collection: 'agents',
    id: user.id,
    data: { photo: media.id },
    overrideAccess: true,
  })

  const url: string = typeof media.url === 'string'
    ? media.url
    : `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/media/${String(media.filename)}`

  return NextResponse.json({ id: String(media.id), url }, { status: 201 })
}
