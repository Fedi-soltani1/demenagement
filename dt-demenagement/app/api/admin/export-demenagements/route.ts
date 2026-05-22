import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function esc(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user as { collection?: string }).collection !== 'admins') {
    return new Response('Non autorisé', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statutFilter = searchParams.get('statut')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}
  if (statutFilter) where.statut = { equals: statutFilter }

  const result = await payload.find({
    collection:     'demenagements',
    where,
    limit:          1000,
    sort:           '-createdAt',
    overrideAccess: true,
  })

  const HEADERS = [
    'Numéro dossier', 'Client', 'Email', 'Téléphone', 'Type client',
    'Statut dossier', 'Statut devis', 'Prix TTC (DT)',
    'Date déménagement', 'Ville départ', 'Ville arrivée',
    'Services', 'Notes rapides', 'Créé le',
  ]

  const rows = result.docs.map((d) => [
    d.numeroDossier ?? '',
    d.nomComplet ?? '',
    d.clientId ?? '',
    d.telephone ?? '',
    d.typeClient ?? '',
    d.statut ?? '',
    d.devisStatut ?? '',
    d.prixTotalTTC ?? '',
    d.dateDemenagement
      ? new Date(d.dateDemenagement as string).toLocaleDateString('fr-FR')
      : '',
    (d.adresseDepart as { ville?: string } | undefined)?.ville ?? '',
    (d.adresseArrivee as { ville?: string } | undefined)?.ville ?? '',
    Array.isArray(d.servicesInclus)
      ? (d.servicesInclus as string[]).join(' | ')
      : '',
    (d as Record<string, unknown>).notesRapides ?? '',
    new Date(d.createdAt).toLocaleDateString('fr-FR'),
  ])

  const csv = [
    HEADERS.map(esc).join(','),
    ...rows.map((r) => r.map(esc).join(',')),
  ].join('\r\n')

  const date = new Date().toISOString().slice(0, 10)

  return new Response('﻿' + csv, { // BOM for Excel UTF-8
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="demenagements-${date}.csv"`,
    },
  })
}
