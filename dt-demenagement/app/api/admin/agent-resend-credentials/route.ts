import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { randomPassword } from '@/lib/random-password'
import { buildAgentCredentialsEmail } from '@/lib/agent-credentials-email'
import { resolveAgentAppUrl } from '@/lib/agent-app-url'
import { sendMail } from '@/lib/mailer'

const schema = z.object({ agentId: z.union([z.string(), z.number()]) })

// Ré-envoie par email les identifiants d'un agent : génère un NOUVEAU mot de passe
// (l'ancien n'est pas récupérable), le persiste, puis envoie l'email avec le lien
// absolu vers l'espace agent. Réservé au super-admin.
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: request.headers })
    if (
      !user ||
      (user as { collection?: string }).collection !== 'admins' ||
      (user as { role?: string }).role !== 'super-admin'
    ) {
      return Response.json({ error: 'Non autorisé — action réservée au super-admin.' }, { status: 401 })
    }

    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return Response.json({ error: 'Identifiant agent manquant ou invalide.' }, { status: 422 })
    }

    const agent = (await payload
      .findByID({ collection: 'agents', id: parsed.data.agentId, overrideAccess: true })
      .catch(() => null)) as { id: string | number; email?: string; prenom?: string } | null
    if (!agent) {
      return Response.json({ error: 'Agent introuvable.' }, { status: 404 })
    }

    const email = String(agent.email ?? '').trim()
    if (!email) {
      return Response.json({ error: "Cet agent n'a pas d'adresse email." }, { status: 422 })
    }

    const tempPassword = randomPassword()
    await payload.update({
      collection: 'agents',
      id: agent.id,
      data: { password: tempPassword },
      overrideAccess: true,
    })

    const { subject, html } = buildAgentCredentialsEmail({
      prenom: String(agent.prenom ?? ''),
      email,
      tempPassword,
      appUrl: resolveAgentAppUrl(),
    })
    await sendMail({ to: email, subject, html })
    payload.logger.info(`[agents] identifiants ré-envoyés par email à ${email}`)

    return Response.json({ success: true, email })
  } catch (err) {
    console.error('[agent-resend-credentials] erreur:', err)
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: `Échec de l'envoi : ${message}` }, { status: 500 })
  }
}
