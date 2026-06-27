import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPayloadSafe } from '@/lib/payload-safe'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json() as Record<string, unknown>

  const type          = body.type === 'livraison' ? 'livraison' : 'demenagement'
  const adresseDepart  = body.adresseDepart  as { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean } | undefined
  const adresseArrivee = body.adresseArrivee as { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean } | undefined
  const dateSouhaitee  = typeof body.dateSouhaitee === 'string' ? body.dateSouhaitee : ''
  const services       = Array.isArray(body.services) ? (body.services as string[]) : []
  const commentaire    = typeof body.commentaire === 'string' ? body.commentaire.trim() : ''

  if (!adresseDepart?.adresse?.trim() || !adresseDepart?.ville?.trim()) {
    return NextResponse.json({ error: 'Adresse de départ incomplète' }, { status: 400 })
  }
  if (!adresseArrivee?.adresse?.trim() || !adresseArrivee?.ville?.trim()) {
    return NextResponse.json({ error: 'Adresse d\'arrivée incomplète' }, { status: 400 })
  }

  // Generate unique numeroDossier
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand     = Math.random().toString(36).slice(2, 6).toUpperCase()
  const numeroDossier = `${type === 'livraison' ? 'LIV' : 'DEM'}-${datePart}-${rand}`

  const payload = await getPayloadSafe()
  if (!payload) return NextResponse.json({ error: 'Service temporairement indisponible' }, { status: 503 })

  const nomComplet = session.user.name
    ?? session.user.email.split('@')[0]?.replace(/[._-]+/g, ' ')
    ?? session.user.email

  const notePrefix = type === 'livraison' ? '[LIVRAISON]' : '[DÉMÉNAGEMENT]'
  const noteSource = 'Demande soumise depuis l\'espace client.'
  const fullNote   = [notePrefix, noteSource, commentaire].filter(Boolean).join(' — ')

  try {
    await payload.create({
      collection: 'demenagements',
      data: {
        numeroDossier,
        clientId:   session.user.email,
        nomComplet,
        statut:     'devis_recu',
        adresseDepart: {
          adresse:   adresseDepart.adresse!.trim(),
          ville:     adresseDepart.ville!.trim(),
          etage:     adresseDepart.etage?.trim() ?? '',
          ascenseur: adresseDepart.ascenseur ?? false,
        },
        adresseArrivee: {
          adresse:   adresseArrivee.adresse!.trim(),
          ville:     adresseArrivee.ville!.trim(),
          etage:     adresseArrivee.etage?.trim() ?? '',
          ascenseur: adresseArrivee.ascenseur ?? false,
        },
        ...(dateSouhaitee ? { dateDemenagement: dateSouhaitee } : {}),
        ...(services.length > 0 ? { servicesInclus: services } : {}),
        commentaire: fullNote,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, numeroDossier }, { status: 201 })
  } catch (err) {
    console.error('[nouvelle-demande] Erreur création dossier :', err)
    return NextResponse.json({ error: 'Erreur lors de la création du dossier' }, { status: 500 })
  }
}
