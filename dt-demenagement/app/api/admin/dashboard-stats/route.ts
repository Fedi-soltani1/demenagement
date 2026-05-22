import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function safeCount(p: Promise<{ totalDocs: number }>): Promise<number> {
  try { return (await p).totalDocs } catch { return 0 }
}
async function safeFind<T>(p: Promise<{ docs: T[]; totalDocs: number }>) {
  try { return await p } catch { return { docs: [] as T[], totalDocs: 0 } }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || (user as { collection?: string }).collection !== 'admins') {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const cutoff48h  = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    const cutoff24h  = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const todayStr   = new Date().toISOString().slice(0, 10)
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)

    // Build last-6-months date ranges
    const now = new Date()
    const monthRanges = Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      const label = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][d.getMonth()]
      return { start, end, label }
    })

    const [
      devis_recu, confirme, en_preparation, en_cours, livre, annule,
      rdvNouveaux, rdvConfirmes,
      messagesNonLus,
      recentDossiers,
      recentRDV,
      clientsTotal,
    ] = await Promise.all([
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'devis_recu'     } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'confirme'       } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'en_preparation' } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'en_cours'       } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'livre'          } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'annule'         } }, overrideAccess: true }),
      payload.count({ collection: 'rendez-vous',   where: { statut: { equals: 'nouveau'        } }, overrideAccess: true }),
      payload.count({ collection: 'rendez-vous',   where: { statut: { equals: 'confirme'       } }, overrideAccess: true }),
      payload.count({ collection: 'messages',      where: { and: [{ auteur: { equals: 'client' } }, { lu: { equals: false } }] }, overrideAccess: true }),
      payload.find({ collection: 'demenagements', sort: '-createdAt', limit: 8, overrideAccess: true }),
      payload.find({ collection: 'rendez-vous',   sort: '-createdAt', limit: 6, overrideAccess: true }),
      safeCount(payload.count({ collection: 'clients', overrideAccess: true })),
    ])

    const [urgentDossiers, urgentMessages, todayRDV, todayDemenagements, ...monthlyCounts] = await Promise.all([
      safeCount(payload.count({
        collection: 'demenagements',
        where: { and: [{ statut: { equals: 'devis_recu' } }, { createdAt: { less_than: cutoff48h } }] },
        overrideAccess: true,
      })),
      safeCount(payload.count({
        collection: 'messages',
        where: { and: [{ auteur: { equals: 'client' } }, { lu: { equals: false } }, { createdAt: { less_than: cutoff24h } }] },
        overrideAccess: true,
      })),
      safeFind(payload.find({
        collection: 'rendez-vous',
        where: { dateVisite: { equals: todayStr } },
        limit: 20,
        overrideAccess: true,
      })),
      safeCount(payload.count({
        collection: 'demenagements',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { and: [
          { statut: { in: ['devis_recu', 'confirme', 'en_preparation', 'en_cours'] } },
          { dateDemenagement: { greater_than_or_equal: todayStart.toISOString() } as any },
          { dateDemenagement: { less_than_or_equal:    todayEnd.toISOString()   } as any },
        ]},
        overrideAccess: true,
      })),
      ...monthRanges.map(({ start, end }) =>
        safeCount(payload.count({
          collection: 'demenagements',
          where: { and: [
            { createdAt: { greater_than_or_equal: start.toISOString() } },
            { createdAt: { less_than_or_equal:    end.toISOString()   } },
          ]},
          overrideAccess: true,
        }))
      ),
    ])

    const recentDossierDocs = recentDossiers.docs.map((d) => ({
      id:            d.id,
      numeroDossier: d.numeroDossier,
      nomComplet:    d.nomComplet,
      telephone:     d.telephone,
      statut:        d.statut,
      devisStatut:   d.devisStatut,
      createdAt:     d.createdAt,
    }))

    const recentRDVDocs = recentRDV.docs.map((r) => ({
      id:         r.id,
      nom:        r.nom,
      prenom:     r.prenom,
      telephone:  r.telephone,
      whatsapp:   r.whatsapp,
      dateVisite: r.dateVisite,
      heure:      r.heure,
      statut:     r.statut,
      type:       r.type,
      createdAt:  r.createdAt,
    }))

    const todayRDVDocs = todayRDV.docs.map((r) => ({
      id:        r.id,
      nom:       r.nom,
      prenom:    r.prenom,
      telephone: r.telephone,
      heure:     r.heure,
      statut:    r.statut,
    }))

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
      rdv:            { nouveaux: rdvNouveaux.totalDocs, confirmes: rdvConfirmes.totalDocs },
      messagesNonLus: messagesNonLus.totalDocs,
      clientsTotal,
      recentDossiers: recentDossierDocs,
      recentRDV:      recentRDVDocs,
      urgent:         { dossiers: urgentDossiers, messages: urgentMessages },
      aujourd_hui:    { rdv: todayRDV.totalDocs, rdvList: todayRDVDocs, demenagements: todayDemenagements },
      monthly: {
        labels:   monthRanges.map(m => m.label),
        dossiers: monthlyCounts,
      },
    })
  } catch (err) {
    console.error('[dashboard-stats]', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
