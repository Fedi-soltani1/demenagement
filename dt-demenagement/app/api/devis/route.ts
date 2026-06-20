import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { env } from '@/lib/env'
import { sendMail } from '@/lib/mailer'
import { sendDossierClientEmail } from '@/lib/emails/dossier-client'
import { resolvePartner, payloadPartnerFinder } from '@/lib/partner-attribution'
import { markLeadConverted } from '@/lib/leads'
import { upsertClient } from '@/lib/upsert-client'
import { escapeHtml } from '@/lib/escape-html'

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
  // Volume estimé en m³ — limite généreuse pour couvrir les gros déménagements
  // d'entreprise/entrepôt (500 était trop bas et bloquait l'envoi du devis en 422).
  volumeEstime:   z.number().min(0).max(5000).optional(),
  commentaire:    z.string().max(1000).optional(),

  // IDs Payload Media — uploadés via /api/devis/upload.
  // Payload renvoie des IDs NUMÉRIQUES → on accepte string OU number (la route les
  // convertit ensuite en nombre via .map(Number)). Sinon un upload de photo casse l'envoi (422).
  photosDepart:   z.array(z.union([z.string(), z.number()])).max(3).optional(),
  photosArrivee:  z.array(z.union([z.string(), z.number()])).max(3).optional(),
  photosMeubles:  z.array(z.union([z.string(), z.number()])).max(5).optional(),
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

  // Attribution partenaire (cookie dt_partenaire posé par la landing /partenaire/[slug])
  const partenaireSlug = (await cookies()).get('dt_partenaire')?.value
  const partenaire = await resolvePartner(partenaireSlug, payloadPartnerFinder(payload))

  // Créer le dossier dans Payload CMS
  try {
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
        sourcePartenaire:    partenaire ? partenaire.id : undefined,
        sourcePartenaireNom: partenaire ? partenaire.nom : undefined,
      },
      overrideAccess: true,
      // Le site envoie déjà l'email de confirmation ci-dessous → le hook afterChange
      // de la collection ne doit PAS le renvoyer (évite le doublon).
      context: { skipClientConfirmation: true },
    })
  } catch (payloadErr) {
    const msg = payloadErr instanceof Error ? payloadErr.message : 'Erreur création dossier'
    return NextResponse.json({ error: msg }, { status: 422 })
  }

  // Le prospect a TERMINÉ le process → son lead initial n'est plus un abandon.
  // On le marque « devis_soumis » pour qu'il quitte la liste des leads.
  await markLeadConverted(payload, d.telephone, 'devis_soumis')

  // Rattachement automatique d'une fiche client (par email ou téléphone) — non bloquant.
  await upsertClient(payload, { email: d.email, telephone: d.telephone, prenom: d.prenom, nom: d.nom })
    .catch((e: unknown) => { console.error('[devis] upsert client échoué :', e) })

  // Résoudre les URLs publiques des photos pour l'email
  const resolvePhotoUrls = async (ids: (string | number)[]): Promise<string[]> => {
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
        html:    buildInternalEmail(d, numeroDossier, photoUrls, partenaire?.nom),
      }),
    ]
    if (d.email) {
      // Confirmation + magic link vers l'espace client (helper partagé).
      emailPromises.push(
        sendDossierClientEmail({ email: d.email, prenom: d.prenom, numeroDossier })
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

function buildInternalEmail(
  d: z.infer<typeof devisSchema>,
  numeroDossier: string,
  photos: { depart: string[]; arrivee: string[]; meubles: string[] },
  partenaireNom?: string,
): string {
  const base      = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const adminUrl  = `${base}/admin/collections/demenagements`

  const row = (label: string, value: string) =>
    `<tr style="border-bottom:1px solid #2a2a2a;">
       <td style="padding:10px 0;color:#a0a0a0;font-size:12px;width:140px;">${label}</td>
       <td style="padding:10px 0;color:#f8f5f0;font-size:14px;">${value}</td>
     </tr>`

  const photoBlock = (urls: string[], label: string) => {
    if (!urls.length) return ''
    return `
      <p style="margin:16px 0 8px;font-size:12px;color:#a0a0a0;text-transform:uppercase;letter-spacing:1px;">${label}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${urls.map((u) => `<img src="${u}" alt="photo" style="width:120px;height:90px;object-fit:cover;border-radius:6px;" />`).join('')}
      </div>`
  }

  const hasPhotos = photos.meubles.length || photos.depart.length || photos.arrivee.length

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:600px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement — Nouveau devis reçu</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Dossier <strong style="color:#fff;">${numeroDossier}</strong></p>
        </td></tr>
        ${partenaireNom ? `<tr><td style="padding:12px 28px;background:#0e2e29;border-bottom:1px solid #2a2a2a;"><p style="margin:0;font-size:13px;color:#7fe0cd;">🤝 <strong>Source : ${escapeHtml(partenaireNom)}</strong> — partenaire affilié</p></td></tr>` : ''}
        <tr><td style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            ${row('TYPE', d.type === 'particulier' ? '🏠 Particulier' : '🏢 Entreprise')}
            ${row('NOM', `${escapeHtml(d.prenom)} ${escapeHtml(d.nom)}`)}
            ${d.email ? row('EMAIL', escapeHtml(d.email)) : ''}
            ${row('TÉLÉPHONE', escapeHtml(d.telephone))}
            ${row('DÉPART', `${escapeHtml(d.adresseDepart.adresse)}, ${escapeHtml(d.adresseDepart.ville)}${d.adresseDepart.etage ? ` — Étage ${d.adresseDepart.etage}` : ''}${d.adresseDepart.ascenseur ? ' (asc.)' : ''}`)}
            ${row('ARRIVÉE', `${escapeHtml(d.adresseArrivee.adresse)}, ${escapeHtml(d.adresseArrivee.ville)}${d.adresseArrivee.etage ? ` — Étage ${d.adresseArrivee.etage}` : ''}${d.adresseArrivee.ascenseur ? ' (asc.)' : ''}`)}
            ${row('SERVICES', escapeHtml(d.services.join(', ')))}
            ${d.dateSouhaitee ? `<tr style="border-bottom:1px solid #2a2a2a;"><td style="padding:10px 0;color:#a0a0a0;font-size:12px;width:140px;">DATE SOUHAITÉE</td><td style="padding:10px 0;color:#c9a84c;font-size:14px;font-weight:bold;">${escapeHtml(d.dateSouhaitee)}</td></tr>` : ''}
            ${d.volumeEstime  ? row('VOLUME ESTIMÉ', `${d.volumeEstime} m³`) : ''}
            ${d.commentaire   ? row('COMMENTAIRE', escapeHtml(d.commentaire)) : ''}
          </table>
          ${hasPhotos ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #2a2a2a;">
            ${photoBlock(photos.meubles, 'Photos meubles')}
            ${photoBlock(photos.depart, 'Photos accès départ')}
            ${photoBlock(photos.arrivee, 'Photos accès arrivée')}
          </div>` : ''}
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <a href="${adminUrl}" style="display:inline-block;background:#c9a84c;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            📋 Ouvrir dans l'admin →
          </a>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}
