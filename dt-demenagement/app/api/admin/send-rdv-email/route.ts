import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { sendMail } from '@/lib/mailer'
import { clientConfirmEmail } from '@/lib/emails/rdv'

const schema = z.object({
  rdvId: z.union([z.string(), z.number()]),
  // Email saisi dans le formulaire admin (peut ne pas encore être enregistré en base).
  email: z.string().email().optional(),
})

type RdvDoc = {
  prenom?: string; nom?: string
  email?: string
  dateVisite?: string; heure?: string
}

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
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

  // Priorité à l'email saisi dans le formulaire (cas d'un RDV pas encore réenregistré),
  // sinon celui déjà en base.
  const email = (parsed.data.email ?? rdv.email ?? '').trim()
  if (!email) {
    return Response.json({ error: 'Aucun email renseigné dans ce rendez-vous' }, { status: 422 })
  }

  const prenom = (rdv.prenom ?? '').trim() || 'cher client'
  const html = clientConfirmEmail(prenom, rdv.dateVisite ?? '', rdv.heure ?? '')

  try {
    await sendMail({
      to:      email,
      subject: '✅ Votre rendez-vous est confirmé — DT Déménagement',
      html,
    })
  } catch (e) {
    console.error('[send-rdv-email] échec envoi:', e)
    return Response.json({ error: "Échec de l'envoi de l'email" }, { status: 502 })
  }

  // Confirmer le RDV + persister l'email utilisé (non bloquant — email déjà envoyé)
  await payload.update({
    collection: 'rendez-vous',
    id: parsed.data.rdvId,
    data: { statut: 'confirme', email },
    overrideAccess: true,
  }).catch(() => { /* non bloquant */ })

  return Response.json({ success: true })
}
