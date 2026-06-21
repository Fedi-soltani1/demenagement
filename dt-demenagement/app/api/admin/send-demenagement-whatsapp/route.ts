import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { COMPANY } from '@/lib/constants'

const schema = z.object({ dossierId: z.union([z.string(), z.number()]) })

type DemDoc = {
  nomComplet?: string
  telephone?:  string
}

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
  if (!parsed.success) {
    return Response.json({ error: 'Données invalides' }, { status: 422 })
  }

  const doc = await payload
    .findByID({ collection: 'demenagements', id: parsed.data.dossierId, overrideAccess: true })
    .catch(() => null) as DemDoc | null

  if (!doc) return Response.json({ error: 'Dossier introuvable' }, { status: 404 })

  const telephone = (doc.telephone ?? '').trim()
  if (!telephone) {
    return Response.json({ error: 'Aucun numéro de téléphone dans ce dossier' }, { status: 422 })
  }

  const nom = (doc.nomComplet ?? '').trim() || 'cher client'
  const message =
    `Bonjour ${nom},\n\n` +
    `Votre dossier de déménagement a bien été créé chez DT Déménagement Tunisie.\n\n` +
    `Afin de vous établir un devis précis, merci de nous envoyer quelques photos de :\n` +
    `📦 L'accès au départ (escalier, couloir, parking)\n` +
    `🏠 L'accès à l'arrivée (escalier, couloir, parking)\n` +
    `🛋️ Vos meubles et objets à déménager\n\n` +
    `Envoyez-les directement dans cette conversation. Merci et à très vite !\n\n` +
    `Pour toute question : ${COMPANY.phone1}\n\n` +
    `DT Déménagement Tunisie`

  let botRes: Response
  try {
    botRes = await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-message`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
      body:    JSON.stringify({ telephone, message }),
    })
  } catch {
    return Response.json({ error: "Bot WhatsApp injoignable — vérifiez qu'il tourne" }, { status: 502 })
  }

  if (!botRes.ok) {
    const j: { error?: string } = await botRes.json().catch(() => ({}))
    return Response.json({ error: j.error ?? "Échec de l'envoi WhatsApp" }, { status: botRes.status })
  }

  return Response.json({ success: true })
}
