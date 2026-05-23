import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const revalidate = 3600

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

// ⚠️ Données fictives — à remplacer quand la clé Google Places API sera configurée
const DUMMY_REVIEWS: GoogleReviewsResponse = {
  note: 4.9,
  total: 127,
  placeUrl: null,
  reviews: [
    {
      id: '1',
      nomAuteur: 'Ahmed Ben Salem',
      photoUrl: null,
      note: 5,
      texte: 'Service impeccable ! L\'équipe est professionnelle, ponctuelle et très soigneuse avec les meubles. Je recommande vivement DT Déménagement.',
      dateOriginal: '2024-12-01',
      dateRelative: 'il y a 5 mois',
    },
    {
      id: '2',
      nomAuteur: 'Fatma Trabelsi',
      photoUrl: null,
      note: 5,
      texte: 'Déménagement parfait de Tunis à Sousse. Prix honnête, aucune mauvaise surprise. L\'équipe a pris soin de tout emballer correctement.',
      dateOriginal: '2025-01-15',
      dateRelative: 'il y a 4 mois',
    },
    {
      id: '3',
      nomAuteur: 'Mohamed Gharbi',
      photoUrl: null,
      note: 5,
      texte: 'Très satisfait ! Déménagement rapide et sans stress. Je ferai à nouveau appel à eux sans hésiter.',
      dateOriginal: '2025-02-20',
      dateRelative: 'il y a 3 mois',
    },
    {
      id: '4',
      nomAuteur: 'Sonia Mansour',
      photoUrl: null,
      note: 5,
      texte: 'Excellent rapport qualité/prix. L\'équipe est sympa et efficace. Rien n\'a été abîmé lors du transport. Merci !',
      dateOriginal: '2025-03-10',
      dateRelative: 'il y a 2 mois',
    },
    {
      id: '5',
      nomAuteur: 'Karim Bouzid',
      photoUrl: null,
      note: 5,
      texte: 'Devis gratuit en 24h comme promis. Équipe sérieuse et ponctuelle. Je recommande à toute personne qui cherche un déménagement fiable en Tunisie.',
      dateOriginal: '2025-04-05',
      dateRelative: 'il y a 1 mois',
    },
    {
      id: '6',
      nomAuteur: 'Leila Chaabane',
      photoUrl: null,
      note: 5,
      texte: 'Parfait du début à la fin. Communication claire, équipe professionnelle et camion spacieux. Très bonne expérience !',
      dateOriginal: '2025-04-20',
      dateRelative: 'il y a 3 semaines',
    },
  ],
}

export async function GET(): Promise<NextResponse<GoogleReviewsResponse>> {
  // ⚠️ TODO: Brancher l'API Google Places quand la clé sera configurée dans .env
  // const apiKey  = env.GOOGLE_PLACES_API_KEY
  // const placeId = env.GOOGLE_PLACE_ID
  // ...
  return NextResponse.json(DUMMY_REVIEWS)
}
