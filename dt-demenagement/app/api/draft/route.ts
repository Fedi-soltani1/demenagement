import { draftMode } from 'next/headers'
import { redirect }   from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret     = searchParams.get('secret')
  const slug       = searchParams.get('slug') ?? ''
  const collection = searchParams.get('collection') ?? 'pages'
  const locale     = searchParams.get('locale') ?? 'fr'

  if (!secret || secret !== process.env.PAYLOAD_SECRET) {
    return new Response('Token invalide', { status: 401 })
  }

  ;(await draftMode()).enable()

  let path = `/${locale}`
  if (collection === 'services' && slug)    path = `/${locale}/services/${slug}`
  else if (collection === 'blog' && slug)   path = `/${locale}/blog/${slug}`
  else if (collection === 'villes' && slug) path = `/${locale}/villes/${slug}`
  else if (slug && slug !== 'accueil')      path = `/${locale}/${slug}`

  redirect(path)
}
