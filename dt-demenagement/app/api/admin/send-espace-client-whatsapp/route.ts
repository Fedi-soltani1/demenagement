import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { resolveIdentity, sendLoginLink } from '@/lib/login-link'

const schema = z.object({ dossierId: z.union([z.string(), z.number()]) })

type DemDoc = { nomComplet?: string | null; telephone?: string | null; clientId?: string | null }

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!env.BOT_SEND_URL || !env.BOT_SEND_SECRET) {
    return Response.json({ error: 'Bot WhatsApp non configuré (BOT_SEND_URL/SECRET)' }, { status: 500 })
  }

  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Données invalides' }, { status: 422 })

  const doc = await payload
    .findByID({ collection: 'demenagements', id: parsed.data.dossierId, overrideAccess: true })
    .catch(() => null) as DemDoc | null
  if (!doc) return Response.json({ error: 'Dossier introuvable' }, { status: 404 })

  const telephone = (doc.telephone ?? '').trim()
  if (!telephone) {
    return Response.json({ error: 'Aucun numéro de téléphone dans ce dossier' }, { status: 422 })
  }

  const prenom   = (doc.nomComplet ?? '').trim().split(' ')[0] || undefined
  const identity = resolveIdentity({ email: doc.clientId, telephone })

  try {
    await sendLoginLink({ identity, channels: { whatsapp: true }, telephone, prenom })
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Échec de l'envoi" }, { status: 502 })
  }
  return Response.json({ success: true })
}
