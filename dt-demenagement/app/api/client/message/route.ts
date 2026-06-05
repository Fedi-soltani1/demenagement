import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { env } from '@/lib/env'
import { sendMail } from '@/lib/mailer'

const schema = z.object({
  dossierId:   z.string().min(1),
  contenu:     z.string().min(1).max(2000),
  clientEmail: z.string().email(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { dossierId, contenu, clientEmail } = result.data

  if (clientEmail !== session.user.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const dossierCheck = await payload.find({
    collection: 'demenagements',
    where:      { id: { equals: Number(dossierId) }, clientId: { equals: session.user.email } },
    limit:      1,
    overrideAccess: true,
  })
  if (dossierCheck.totalDocs === 0) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const message = await payload.create({
    collection: 'messages',
    data: {
      demenagement: Number(dossierId),
      auteur:       'client',
      contenu,
      lu:           false,
      clientId:     session.user.email,
    },
    overrideAccess: true,
  })

  // Email de notification admin — non-bloquant
  if (env.EMAIL_DEVIS_TO) {
    const dossier  = dossierCheck.docs[0]
    const adminUrl = `${env.NEXT_PUBLIC_SERVER_URL}/admin/collections/demenagements/${dossierId}`
    sendMail({
      to:      env.EMAIL_DEVIS_TO,
      subject: `💬 Nouveau message client — Dossier ${(dossier as Record<string, unknown>).numeroDossier ?? dossierId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#0f0f0f;padding:16px 24px;">
            <h2 style="color:#fff;margin:0;font-size:16px;">DT Déménagement — Nouveau message client</h2>
          </div>
          <div style="padding:20px 24px;background:#f9f9f9;border-left:4px solid #b52027;">
            <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Message de</p>
            <p style="margin:0 0 16px;font-size:15px;color:#111;font-weight:bold;">${clientEmail}</p>
            <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Contenu</p>
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:6px;padding:14px;font-size:14px;color:#333;white-space:pre-wrap;">${contenu.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          <div style="padding:16px 24px;background:#fff;">
            <a href="${adminUrl}" style="display:inline-block;background:#b52027;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">
              Ouvrir le dossier dans l'admin →
            </a>
          </div>
        </div>
      `,
    }).catch(() => { /* non-blocking */ })
  }

  return NextResponse.json({ message }, { status: 201 })
}
