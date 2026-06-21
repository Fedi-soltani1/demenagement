import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { generateMagicLink } from '@/lib/generate-magic-link'

const schema = z.object({
  telephone: z.string().regex(/^\+?[0-9\s\-().]{8,20}$/),
})

function phoneToVirtualEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `wa.${digits}@dt-demenagement.tn`
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!env.BOT_SEND_URL || !env.BOT_SEND_SECRET) {
    return Response.json({ error: 'Service WhatsApp non disponible' }, { status: 503 })
  }

  const body: unknown = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Numéro invalide' }, { status: 422 })

  const payload = await getPayload({ config })
  const vEmail  = phoneToVirtualEmail(parsed.data.telephone)

  // Only send if a client account exists for this phone — don't reveal existence
  const result = await payload.find({
    collection: 'clients',
    where: { email: { equals: vEmail } },
    limit: 1,
    overrideAccess: true,
  }).catch(() => ({ docs: [] as unknown[] }))

  // Always respond OK (don't reveal whether account exists)
  if (result.docs.length === 0) {
    return Response.json({ success: true })
  }

  const magicLink = await generateMagicLink(vEmail, '/espace-client')

  const message =
    `Votre lien de connexion — DT Déménagement :\n\n` +
    `🔗 ${magicLink}\n\n` +
    `⏱ Valable 24 heures — usage unique.\n\n` +
    `Si vous n'avez pas demandé ce lien, ignorez ce message.`

  try {
    await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-message`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
      body:    JSON.stringify({ telephone: parsed.data.telephone, message }),
    })
  } catch { /* silent */ }

  return Response.json({ success: true })
}
