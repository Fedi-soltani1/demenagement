import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const revalidate = 3600 // 1 heure

type GoogleReview = {
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url?: string
  relative_time_description?: string
}

type PlacesDetailsResponse = {
  result?: {
    rating?: number
    user_ratings_total?: number
    reviews?: GoogleReview[]
    url?: string
  }
  status: string
  error_message?: string
}

export type ReviewData = {
  id: string
  nomAuteur: string
  photoUrl: string | null
  note: 1 | 2 | 3 | 4 | 5
  texte: string
  dateOriginal: string
  dateRelative: string
}

export type GoogleReviewsResponse = {
  note: number
  total: number
  reviews: ReviewData[]
  placeUrl: string | null
}

export async function GET(): Promise<NextResponse<GoogleReviewsResponse | { error: string }>> {
  const apiKey  = env.GOOGLE_PLACES_API_KEY
  const placeId = env.GOOGLE_PLACE_ID

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields',   'rating,user_ratings_total,reviews,url')
  url.searchParams.set('language', 'fr')
  url.searchParams.set('reviews_sort', 'most_relevant')
  url.searchParams.set('key', apiKey)

  let data: PlacesDetailsResponse

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Google API unavailable' }, { status: 502 })
    }
    data = await res.json() as PlacesDetailsResponse
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }

  if (data.status !== 'OK' || !data.result) {
    return NextResponse.json({ error: data.error_message ?? data.status }, { status: 502 })
  }

  const { rating = 0, user_ratings_total = 0, reviews = [], url: placeUrl = null } = data.result

  const reviewData: ReviewData[] = reviews
    .filter((r) => r.rating >= 4) // Only 4-5 stars
    .slice(0, 6)
    .map((r, i) => ({
      id:           String(i),
      nomAuteur:    r.author_name,
      photoUrl:     r.profile_photo_url ?? null,
      note:         Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5,
      texte:        r.text,
      dateOriginal: new Date(r.time * 1000).toISOString().split('T')[0] ?? '',
      dateRelative: r.relative_time_description ?? '',
    }))

  return NextResponse.json({
    note:     Math.round(rating * 10) / 10,
    total:    user_ratings_total,
    reviews:  reviewData,
    placeUrl: placeUrl ?? null,
  })
}
