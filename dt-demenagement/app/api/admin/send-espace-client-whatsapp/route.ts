import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { COMPANY } from '@/lib/constants'

const schema = z.object({ dossierId: z.union([z.string(), z.number()]) })

type DemDoc = {
  nomComplet?: string
  telephone?:  string
  clientId?:   string
}

export function phoneToVirtualEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `wa.${digits}@dt-demenagement.tn`
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
  if (!parsed.success) return Response.json({ error: 'Données invalides' }, { status: 422 })

  const doc = await payload
    .findByID({ collection: 'demenagements', id: parsed.data.dossierId, overrideAccess: true })
    .catch(() => null) as DemDoc | null

  if (!doc) return Response.json({ error: 'Dossier introuvable' }, { status: 404 })

  const telephone = (doc.telephone ?? '').trim()
  if (!telephone) {
    return Response.json({ error: 'Aucun numéro de téléphone dans ce dossier' }, { status: 422 })
  }

  const nom    = (doc.nomComplet ?? '').trim() || 'cher client'
  const vEmail = phoneToVirtualEmail(telephone)

  // Set clientId on dossier so the espace client can find the dossiers
  if (!doc.clientId) {
    await payload.update({
      collection: 'demenagements',
      id: parsed.data.dossierId,
      data: { clientId: vEmail },
      overrideAccess: true,
    }).catch(() => null)
  }

  // Create Client record if it doesn't exist yet
  const existing = await payload.find({
    collection: 'clients',
    where: { email: { equals: vEmail } },
    limit: 1,
    overrideAccess: true,
  }).catch(() => ({ docs: [] as unknown[] }))

  if (existing.docs.length === 0) {
    const parts  = nom.split(' ')
    const prenom = parts[0] ?? nom
    const nomFam = parts.slice(1).join(' ') || prenom
    await payload.create({
      collection: 'clients',
      data: { email: vEmail, prenom, nom: nomFam, telephone },
      overrideAccess: true,
    }).catch(() => null)
  }

  // Generate a 24-hour magic link for the virtual email identifier
  const magicLink = await generateMagicLink(vEmail, '/espace-client')

  const message =
    `Bonjour ${nom} 👋\n\n` +
    `Votre espace client DT Déménagement est prêt !\n\n` +
    `Suivez l'avancement de votre déménagement en cliquant sur ce lien :\n\n` +
    `🔗 ${magicLink}\n\n` +
    `⏱ Ce lien est valable 24 heures — usage unique.\n\n` +
    `DT Déménagement Tunisie — ${COMPANY.phone1}`

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
    return Response.json({ error: j.error ?? "Échec de l'envoi" }, { status: botRes.status })
  }

  return Response.json({ success: true })
}
