import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { env } from '@/lib/env'

// Honeypot + rate limiting ultra-simple (sans Redis pour l'instant)
// ⚠️ TODO: Brancher Upstash Redis quand UPSTASH_REDIS_REST_URL est configuré

const adresseSchema = z.object({
  adresse:    z.string().min(1).max(200),
  ville:      z.string().min(1).max(100),
  etage:      z.enum(['RDC', '1', '2', '3', '4', '5+']).optional(),
  ascenseur:  z.boolean().optional(),
})

const devisSchema = z.object({
  // Honeypot anti-bot
  website:    z.string().max(0, 'Bot détecté').optional(),

  type:       z.enum(['particulier', 'entreprise']),
  prenom:     z.string().min(2).max(50),
  nom:        z.string().min(2).max(50),
  email:      z.string().optional(),
  telephone:  z.string().regex(/^\+?[0-9\s\-()]{8,20}$/),

  adresseDepart:  adresseSchema,
  adresseArrivee: adresseSchema,

  services:       z.array(z.string()).min(1).max(6),
  dateSouhaitee:  z.string().optional(),
  volumeEstime:   z.number().min(0).max(500).optional(),
  commentaire:    z.string().max(1000).optional(),

  // IDs Payload Media — uploadés via /api/devis/upload
  photosDepart:   z.array(z.string()).max(3).optional(),
  photosArrivee:  z.array(z.string()).max(3).optional(),
  photosMeubles:  z.array(z.string()).max(5).optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  // Honeypot
  if ((body as Record<string, unknown>).website) {
    return NextResponse.json({ error: 'Bot détecté' }, { status: 400 })
  }

  const result = devisSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const d = result.data

  // Générer un numéro de dossier unique
  const year    = new Date().getFullYear()
  const suffix  = Math.floor(1000 + Math.random() * 9000)
  const numeroDossier = `DT-${year}-${suffix}`

  const payload = await getPayload({ config })

  // Créer le dossier dans Payload CMS
  await payload.create({
    collection: 'demenagements',
    data: {
      numeroDossier,
      clientId:    d.email,
      nomComplet:  `${d.prenom} ${d.nom}`,
      telephone:   d.telephone,
      typeClient:  d.type,
      commentaire: d.commentaire,
      statut:      'devis_recu',
      adresseDepart: {
        adresse:   d.adresseDepart.adresse,
        ville:     d.adresseDepart.ville,
        etage:     d.adresseDepart.etage ?? 'RDC',
        ascenseur: d.adresseDepart.ascenseur ?? false,
      },
      adresseArrivee: {
        adresse:   d.adresseArrivee.adresse,
        ville:     d.adresseArrivee.ville,
        etage:     d.adresseArrivee.etage ?? 'RDC',
        ascenseur: d.adresseArrivee.ascenseur ?? false,
      },
      servicesInclus:   d.services,
      volumeM3:         d.volumeEstime,
      dateDemenagement: d.dateSouhaitee ? new Date(d.dateSouhaitee).toISOString() : undefined,
      photosDepart:     (d.photosDepart  ?? []).map(Number).filter(Boolean),
      photosArrivee:    (d.photosArrivee ?? []).map(Number).filter(Boolean),
      photosMeubles:    (d.photosMeubles ?? []).map(Number).filter(Boolean),
    },
    overrideAccess: true,
  })

  // Upsert fiche client — uniquement si l'email est fourni
  if (d.email) {
    const existingClient = await payload.find({
      collection: 'clients',
      where: { email: { equals: d.email } },
      limit: 1,
      overrideAccess: true,
    })
    if (existingClient.totalDocs === 0) {
      await payload.create({
        collection: 'clients',
        data: {
          email:     d.email,
          prenom:    d.prenom,
          nom:       d.nom,
          telephone: d.telephone,
        },
        overrideAccess: true,
      })
    } else {
      await payload.update({
        collection: 'clients',
        id: existingClient.docs[0]!.id,
        data: {
          prenom:    d.prenom,
          nom:       d.nom,
          telephone: d.telephone,
        },
        overrideAccess: true,
      })
    }
  }

  // Résoudre les URLs publiques des photos pour l'email
  const resolvePhotoUrls = async (ids: string[]): Promise<string[]> => {
    if (!ids.length) return []
    const results = await Promise.allSettled(
      ids.map((id) => payload.findByID({ collection: 'media', id, overrideAccess: true }))
    )
    return results.flatMap((r) =>
      r.status === 'fulfilled' && typeof r.value.url === 'string' ? [r.value.url] : []
    )
  }
  const photoUrls = {
    depart:  await resolvePhotoUrls(d.photosDepart  ?? []),
    arrivee: await resolvePhotoUrls(d.photosArrivee ?? []),
    meubles: await resolvePhotoUrls(d.photosMeubles ?? []),
  }

  // Email de confirmation via fetch API Resend (sans dépendance SDK)
  // ⚠️ Configuré quand RESEND_API_KEY est disponible
  try {
    const sendEmail = async (to: string, subject: string, html: string) => {
      await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
      })
    }
    const emailPromises = [
      sendEmail(env.EMAIL_DEVIS_TO, `Nouveau devis ${numeroDossier} — ${d.type} — ${d.prenom} ${d.nom}`, buildInternalEmail(d, numeroDossier, photoUrls)),
    ]
    if (d.email) {
      emailPromises.push(
        sendEmail(d.email, `Votre demande de devis DT Déménagement — ${numeroDossier}`, buildClientEmail(d.prenom, numeroDossier))
      )
    }
    await Promise.all(emailPromises)
  } catch {
    // Email non bloquant — le dossier est créé dans tous les cas
  }

  return NextResponse.json({ success: true, numeroDossier }, { status: 201 })
}

function buildClientEmail(prenom: string, numeroDossier: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#111;color:#f8f5f0">
      <div style="background:#b52027;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <h1 style="margin:0;color:#fff;font-size:22px">DT Déménagement Tunisie</h1>
      </div>
      <h2 style="color:#f8f5f0">Bonjour ${prenom},</h2>
      <p>Votre demande de devis a bien été reçue. Votre numéro de dossier est :</p>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;text-align:center;margin:20px 0">
        <span style="font-family:monospace;font-size:20px;color:#c9a84c;font-weight:bold">${numeroDossier}</span>
      </div>
      <p>Notre équipe commerciale vous contactera dans les <strong>24 heures</strong> pour confirmer votre devis.</p>
      <p style="color:#a0a0a0;font-size:12px;margin-top:32px">DT Déménagement Tunisie — contact@demenagement.tn</p>
    </div>
  `
}

function buildInternalEmail(
  d: z.infer<typeof devisSchema>,
  numeroDossier: string,
  photos: { depart: string[]; arrivee: string[]; meubles: string[] },
): string {
  const photoGrid = (urls: string[], label: string) => {
    if (!urls.length) return ''
    return `
      <tr>
        <td style="padding:6px;font-weight:bold;vertical-align:top">${label}</td>
        <td style="padding:6px">
          ${urls.map((u) => `<img src="${u}" alt="photo" style="width:120px;height:90px;object-fit:cover;border-radius:6px;margin:2px;" />`).join('')}
        </td>
      </tr>`
  }

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <h2>Nouveau devis — ${numeroDossier}</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px;font-weight:bold">Type</td><td>${d.type}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Nom</td><td>${d.prenom} ${d.nom}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Email</td><td>${d.email}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Téléphone</td><td>${d.telephone}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Départ</td><td>${d.adresseDepart.adresse}, ${d.adresseDepart.ville}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Arrivée</td><td>${d.adresseArrivee.adresse}, ${d.adresseArrivee.ville}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Services</td><td>${d.services.join(', ')}</td></tr>
        ${d.dateSouhaitee ? `<tr><td style="padding:6px;font-weight:bold">Date</td><td>${d.dateSouhaitee}</td></tr>` : ''}
        ${d.volumeEstime  ? `<tr><td style="padding:6px;font-weight:bold">Volume</td><td>${d.volumeEstime} m³</td></tr>` : ''}
        ${d.commentaire   ? `<tr><td style="padding:6px;font-weight:bold">Commentaire</td><td>${d.commentaire}</td></tr>` : ''}
        ${photoGrid(photos.meubles, 'Photos meubles')}
        ${photoGrid(photos.depart,  'Photos accès départ')}
        ${photoGrid(photos.arrivee, 'Photos accès arrivée')}
      </table>
    </div>
  `
}
