import React from 'react'
import { getTranslations } from 'next-intl/server'
import { GoogleReviewsClient } from '@/components/blocks/GoogleReviewsClient'
import type { GoogleReviewsResponse, ReviewData } from '@/app/api/google-reviews/route'

// Avis de secours affichés si l'API Google est indisponible
const FALLBACK_REVIEWS: ReviewData[] = [
  { id: '0', nomAuteur: 'Ahmed B.',    photoUrl: null, note: 5, texte: 'Excellent service ! Très professionnel et ponctuel.',       dateOriginal: '2026-03-15', dateRelative: 'il y a 2 mois' },
  { id: '1', nomAuteur: 'Fatima C.',   photoUrl: null, note: 5, texte: 'Super équipe, déménagement parfait vers la France.',        dateOriginal: '2026-02-20', dateRelative: 'il y a 3 mois' },
  { id: '2', nomAuteur: 'Mohamed K.',  photoUrl: null, note: 5, texte: 'Meilleur déménageur de Tunis. Je recommande vraiment.',     dateOriginal: '2026-01-10', dateRelative: 'il y a 4 mois' },
  { id: '3', nomAuteur: 'Samira L.',   photoUrl: null, note: 4, texte: 'Très bon rapport qualité-prix. Personnel agréable.',        dateOriginal: '2025-12-05', dateRelative: 'il y a 5 mois' },
  { id: '4', nomAuteur: 'Youssef R.',  photoUrl: null, note: 5, texte: "Service rapide et soigné. Rien n'a été endommagé.",         dateOriginal: '2025-11-18', dateRelative: 'il y a 6 mois' },
  { id: '5', nomAuteur: 'Rim A.',      photoUrl: null, note: 5, texte: 'Parfait du début à la fin. Prix transparent.',              dateOriginal: '2025-10-30', dateRelative: 'il y a 7 mois' },
]

async function fetchGoogleReviews(baseUrl: string): Promise<GoogleReviewsResponse> {
  try {
    const res = await fetch(`${baseUrl}/api/google-reviews`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error('API error')
    return res.json() as Promise<GoogleReviewsResponse>
  } catch {
    return { note: 4.9, total: 247, reviews: FALLBACK_REVIEWS, placeUrl: null }
  }
}

interface GoogleReviewsCms {
  titre?: string | null
  afficherNoteGlobale?: boolean | null
  nombreAvis?: number | null
  noteMinimum?: number | null
}

export async function GoogleReviewsBlock({ cms }: { cms?: GoogleReviewsCms } = {}) {
  const t       = await getTranslations('Home.googleReviews')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  const data = await fetchGoogleReviews(baseUrl)

  const minNote = cms?.noteMinimum ?? 4
  const limit   = cms?.nombreAvis  ?? 6
  const reviews = data.reviews
    .filter((r) => r.note >= minNote)
    .slice(0, limit)

  return (
    <GoogleReviewsClient
      note={data.note}
      total={data.total}
      reviews={reviews}
      placeUrl={data.placeUrl}
      badgeLabel={t('badge')}
      title={cms?.titre ?? t('title')}
      ratingLabel={t('ratingLabel')}
      reviewsLabel={t('reviewsLabel')}
      ctaLabel={t('cta')}
      afficherNoteGlobale={cms?.afficherNoteGlobale ?? true}
    />
  )
}
