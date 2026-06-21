import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { upsertClient } from '@/lib/upsert-client'
import { resolveIdentity, sendLoginLink } from '@/lib/login-link'

const schema = z.object({
  name:      z.string().min(1).max(100),
  email:     z.string().email().optional(),
  telephone: z.string().regex(/^\+?[0-9\s\-().]{8,20}$/).optional(),
  channels:  z.object({ email: z.boolean().optional(), whatsapp: z.boolean().optional() }),
})

function splitName(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  return { prenom: parts[0] ?? '', nom: parts.slice(1).join(' ') }
}

export async function POST(request: NextRequest): Promise<Response> {
  const body: unknown = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Données invalides' }, { status: 422 })

  const { name, email, telephone, channels } = parsed.data
  const { prenom, nom } = splitName(name)

  try {
    const payload = await getPayload({ config })
    // Une seule fiche client (dédup email réel sinon téléphone).
    await upsertClient(payload, { email, telephone, prenom, nom })
    // Une seule identité, livrée sur les canaux choisis (le même lien).
    const identity = resolveIdentity({ email, telephone })
    await sendLoginLink({ identity, channels, telephone, prenom })
  } catch { /* silencieux — ne bloque pas l'utilisateur */ }

  return Response.json({ success: true })
}
