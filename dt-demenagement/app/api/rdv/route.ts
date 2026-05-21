import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

const TEL_RE = /^\+?[0-9\s\-()\s]{8,20}$/

const rdvSchema = z.object({
  website:    z.string().max(0, 'Bot').optional(),
  type:       z.enum(['client', 'entreprise']),
  nom:        z.string().min(2).max(100),
  prenom:     z.string().min(2).max(100),
  telephone:  z.string().regex(TEL_RE),
  whatsapp:   z.string().regex(TEL_RE),
  email:      z.string().optional(),
  adresse:    z.string().max(300).optional(),
  dateVisite: z.string().optional(),
  heure:      z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  if ((body as Record<string, unknown>).website) {
    return NextResponse.json({ error: 'Bot détecté' }, { status: 400 })
  }

  const result = rdvSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const d = result.data
  const payload = await getPayload({ config })

  const rdv = await payload.create({
    collection: 'rendez-vous',
    data: {
      statut:     'nouveau',
      type:       d.type,
      nom:        d.nom,
      prenom:     d.prenom,
      telephone:  d.telephone,
      whatsapp:   d.whatsapp,
      email:      d.email ?? '',
      adresse:    d.adresse ?? '',
      dateVisite: d.dateVisite ?? '',
      heure:      d.heure ?? '',
    },
    overrideAccess: true,
  })

  return NextResponse.json({ success: true, id: rdv.id }, { status: 201 })
}
