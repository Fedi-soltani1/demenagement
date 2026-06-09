import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { env } from '@/lib/env'
import { sendMail } from '@/lib/mailer'
import { generateMagicLink } from '@/lib/generate-magic-link'

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

  // Emails de confirmation via Hostinger SMTP — non bloquants
  try {
    const emailPromises: Promise<void>[] = [
      sendMail({
        to:      env.EMAIL_DEVIS_TO,
        subject: `Nouveau devis ${numeroDossier} — ${d.type} — ${d.prenom} ${d.nom}`,
        html:    buildInternalEmail(d, numeroDossier, photoUrls),
      }),
    ]
    if (d.email) {
      // Générer un magic link vers l'espace client pour que le client puisse suivre son dossier
      const magicLink = await generateMagicLink(d.email, `/espace-client/${numeroDossier}`)
        .catch(() => {
          const base = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
          return `${base}/connexion?callbackUrl=${encodeURIComponent(`/espace-client/${numeroDossier}`)}`
        })
      emailPromises.push(
        sendMail({
          to:      d.email,
          subject: `Votre demande de devis DT Déménagement — ${numeroDossier}`,
          html:    buildClientEmail(d.prenom, numeroDossier, magicLink),
        })
      )
    }
    await Promise.all(emailPromises)
  } catch (mailErr) {
    // Email NON bloquant — le dossier est créé dans tous les cas. MAIS on logue
    // l'échec : sinon un problème SMTP (identifiants manquants, From rejeté par
    // Hostinger…) passe totalement inaperçu et « le mail de confirmation n'arrive pas ».
    payload.logger.error(
      `[devis ${numeroDossier}] Échec envoi email de confirmation (SMTP) : ` +
      (mailErr instanceof Error ? mailErr.message : String(mailErr)),
    )
  }

  return NextResponse.json({ success: true, numeroDossier }, { status: 201 })
}

function buildClientEmail(prenom: string, numeroDossier: string, magicLink: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr>
          <td style="background:#b52027;padding:20px 28px;">
            <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Demande de devis reçue</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Bonjour <strong>${prenom}</strong>,<br><br>
              Votre demande de devis a bien été reçue. Notre équipe vous contactera dans les <strong style="color:#c9a84c;">24 heures</strong>.
            </p>
            <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">Numéro de dossier</p>
              <p style="margin:0;font-family:monospace;font-size:22px;color:#c9a84c;font-weight:bold;">${numeroDossier}</p>
            </div>
            <p style="margin:0 0 16px;font-size:14px;color:#a0a0a0;line-height:1.6;">
              Suivez l'avancement de votre dossier depuis votre espace client :
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="background:#b52027;border-radius:8px;">
                  <a href="${magicLink}"
                     style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:bold;color:#fff;text-decoration:none;">
                    Accéder à mon espace client →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:#555;">Ce lien est personnel et valable 24 heures.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;">+216 52 880 311 — contact@demenagement.tn — © ${new Date().getFullYear()} DT Déménagement Tunisie</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
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
