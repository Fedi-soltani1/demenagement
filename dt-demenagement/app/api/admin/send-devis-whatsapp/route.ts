import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { z } from 'zod'
import { DevisPDF } from '@/components/pdf/DevisPDF'
import { env } from '@/lib/env'
import { generateMagicLink } from '@/lib/generate-magic-link'

const ligneSchema = z.object({
  designation:  z.string().nullish(),
  quantite:     z.number().nullish(),
  prixUnitaire: z.number().nullish(),
}).passthrough()

const overridesSchema = z.object({
  prixTotalTTC:       z.number().nullish(),
  devisValiditeJours: z.number().nullish(),
  devisNotes:         z.string().nullish(),
  lignesDevis:        z.array(ligneSchema).optional(),
})

const schema = z.object({
  dossierId: z.number(),
  overrides: overridesSchema.optional(),
})

type DossierFields = {
  numeroDossier?:      string
  nomComplet?:         string
  clientId?:           string
  telephone?:          string
  prixTotalTTC?:       number
  devisValiditeJours?: number
  devisNotes?:         string
}

function fmtPrix(n?: number): string {
  return n != null
    ? `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC`
    : 'à confirmer'
}

function buildWhatsappMessage(d: DossierFields, magicLink: string): string {
  return [
    `Bonjour ${d.nomComplet ?? ''},`,
    ``,
    `Voici votre devis ${d.numeroDossier ?? ''} — DT Déménagement Tunisie (en pièce jointe).`,
    ``,
    `💰 Montant total TTC : ${fmtPrix(d.prixTotalTTC)}`,
    `⏳ Validité : ${d.devisValiditeJours ?? 30} jours`,
    ``,
    `👉 Suivre / accepter votre devis : ${magicLink}`,
    ``,
    `Pour toute question : +216 52 880 311.`,
    `Merci de votre confiance,`,
    `DT Déménagement Tunisie`,
  ].join('\n')
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

  const raw = await payload.findByID({ collection: 'demenagements', id: parsed.data.dossierId })
  if (!raw) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = {
    ...raw,
    ...Object.fromEntries(
      Object.entries(parsed.data.overrides ?? {}).filter(([, v]) => v !== undefined && v !== null),
    ),
  } as unknown as DossierFields & Record<string, unknown>

  const telephone = typeof dossier.telephone === 'string' ? dossier.telephone.trim() : ''
  if (!telephone) {
    return Response.json({ error: 'Numéro de téléphone introuvable dans le dossier' }, { status: 422 })
  }

  const element   = createElement(DevisPDF, { dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const fileName  = `Devis-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

  const clientEmail = typeof dossier.clientId === 'string' ? dossier.clientId : ''
  let magicLink: string
  try {
    magicLink = await generateMagicLink(clientEmail, `/espace-client/${dossier.numeroDossier ?? ''}`)
  } catch {
    const base = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
    magicLink = `${base}/connexion?callbackUrl=${encodeURIComponent(`/espace-client/${dossier.numeroDossier ?? ''}`)}`
  }

  const message = buildWhatsappMessage(dossier, magicLink)

  let botRes: Response
  try {
    botRes = await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-devis`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
      body:    JSON.stringify({ telephone, fileName, pdfBase64: pdfBuffer.toString('base64'), message }),
    })
  } catch {
    return Response.json({ error: "Bot WhatsApp injoignable — vérifiez qu'il tourne" }, { status: 502 })
  }

  if (!botRes.ok) {
    const j: { error?: string } = await botRes.json().catch(() => ({}))
    return Response.json({ error: j.error ?? "Échec de l'envoi WhatsApp" }, { status: botRes.status })
  }

  await payload.update({
    collection: 'demenagements',
    id: parsed.data.dossierId,
    data: { devisStatut: 'envoye', devisEnvoyeLe: new Date().toISOString() },
  })

  // Message système dans le fil du dossier (non bloquant)
  await payload.create({
    collection: 'messages',
    data: {
      demenagement: parsed.data.dossierId,
      auteur:       'admin',
      clientId:     clientEmail,
      contenu:      `📤 Devis ${dossier.numeroDossier ?? ''} envoyé sur WhatsApp au ${telephone}.\nMontant : ${fmtPrix(dossier.prixTotalTTC)} — Validité : ${dossier.devisValiditeJours ?? 30} jours`,
      lu:           true,
    },
    overrideAccess: true,
  }).catch(() => { /* non bloquant — devis déjà envoyé */ })

  return Response.json({ success: true })
}
