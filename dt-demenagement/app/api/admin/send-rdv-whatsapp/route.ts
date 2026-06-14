import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { COMPANY } from '@/lib/constants'

const schema = z.object({ rdvId: z.union([z.string(), z.number()]) })

type RdvDoc = {
  nom?: string; prenom?: string
  whatsapp?: string; telephone?: string
  dateVisite?: string; heure?: string
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

  const rdv = await payload.findByID({ collection: 'rendez-vous', id: parsed.data.rdvId }).catch(() => null) as RdvDoc | null
  if (!rdv) {
    return Response.json({ error: 'Rendez-vous introuvable' }, { status: 404 })
  }

  const telephone = (rdv.whatsapp || rdv.telephone || '').trim()
  if (!telephone) {
    return Response.json({ error: 'Aucun numéro WhatsApp/téléphone dans ce rendez-vous' }, { status: 422 })
  }

  const nom   = [rdv.prenom, rdv.nom].filter(Boolean).join(' ').trim() || 'cher client'
  const quand = rdv.dateVisite ? `\n📅 Date : ${rdv.dateVisite}${rdv.heure ? ` à ${rdv.heure}` : ''}` : ''
  const message =
    `Bonjour ${nom},\n\n` +
    `Nous confirmons votre rendez-vous de visite avec DT Déménagement Tunisie.${quand}\n\n` +
    `Pour toute question : ${COMPANY.phone1}\n\n` +
    `Cordialement,\nDT Déménagement Tunisie`

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

  // Confirmer le RDV (non bloquant)
  await payload.update({
    collection: 'rendez-vous',
    id: parsed.data.rdvId,
    data: { statut: 'confirme' },
    overrideAccess: true,
  }).catch(() => { /* non bloquant — message déjà envoyé */ })

  return Response.json({ success: true })
}
