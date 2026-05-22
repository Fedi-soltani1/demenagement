import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [
    devis_recu, confirme, en_preparation, en_cours, livre, annule,
    rdvNouveaux, rdvConfirmes,
    messagesNonLus,
    recentDossiers,
    recentRDV,
  ] = await Promise.all([
    payload.count({ collection: 'demenagements', where: { statut: { equals: 'devis_recu'       } }, overrideAccess: true }),
    payload.count({ collection: 'demenagements', where: { statut: { equals: 'confirme'         } }, overrideAccess: true }),
    payload.count({ collection: 'demenagements', where: { statut: { equals: 'en_preparation'   } }, overrideAccess: true }),
    payload.count({ collection: 'demenagements', where: { statut: { equals: 'en_cours'         } }, overrideAccess: true }),
    payload.count({ collection: 'demenagements', where: { statut: { equals: 'livre'            } }, overrideAccess: true }),
    payload.count({ collection: 'demenagements', where: { statut: { equals: 'annule'           } }, overrideAccess: true }),
    payload.count({ collection: 'rendez-vous',   where: { statut: { equals: 'nouveau'          } }, overrideAccess: true }),
    payload.count({ collection: 'rendez-vous',   where: { statut: { equals: 'confirme'         } }, overrideAccess: true }),
    payload.count({ collection: 'messages',      where: { and: [{ auteur: { equals: 'client' } }, { lu: { equals: false } }] }, overrideAccess: true }),
    payload.find({
      collection: 'demenagements',
      sort: '-createdAt',
      limit: 8,
      select: { numeroDossier: true, nomComplet: true, telephone: true, statut: true, devisStatut: true, createdAt: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'rendez-vous',
      sort: '-createdAt',
      limit: 6,
      select: { nom: true, prenom: true, telephone: true, whatsapp: true, dateVisite: true, heure: true, statut: true, type: true, createdAt: true },
      overrideAccess: true,
    }),
  ])

  return Response.json({
    dossiers: {
      devis_recu:     devis_recu.totalDocs,
      confirme:       confirme.totalDocs,
      en_preparation: en_preparation.totalDocs,
      en_cours:       en_cours.totalDocs,
      livre:          livre.totalDocs,
      annule:         annule.totalDocs,
      total:          devis_recu.totalDocs + confirme.totalDocs + en_preparation.totalDocs + en_cours.totalDocs + livre.totalDocs + annule.totalDocs,
    },
    rdv: {
      nouveaux:  rdvNouveaux.totalDocs,
      confirmes: rdvConfirmes.totalDocs,
    },
    messagesNonLus: messagesNonLus.totalDocs,
    recentDossiers: recentDossiers.docs,
    recentRDV:      recentRDV.docs,
  })
}
