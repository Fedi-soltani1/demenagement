// Appels HTTP vers les endpoints publics existants du site.
import { config } from './config.js'
import { type Session } from './sessions.js'

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`POST ${path} -> ${res.status} ${txt}`)
  }
  return res.json() as Promise<T>
}

/** Upload d'une photo (buffer) -> renvoie l'id media Payload. */
export async function uploadMedia(buffer: Buffer, mimetype: string): Promise<string> {
  const form = new FormData()
  const ext = mimetype.split('/')[1] ?? 'jpg'
  form.append('file', new Blob([new Uint8Array(buffer)], { type: mimetype }), `photo.${ext}`)
  const res = await fetch(`${config.apiBaseUrl}/api/devis/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`upload -> ${res.status}`)
  const json = (await res.json()) as { id: string }
  return json.id
}

/** Crée un dossier devis. Renvoie le numéro de dossier. */
export async function createDevis(session: Session): Promise<string> {
  const d = session.data
  const volume = typeof d.volumeEstime === 'string'
    ? Number(String(d.volumeEstime).replace(',', '.'))
    : undefined
  const body = {
    type:       d.type,
    prenom:     d.prenom,
    nom:        d.nom,
    email:      d.email,                 // peut être undefined
    telephone:  session.numero,          // numéro WhatsApp
    adresseDepart:  { adresse: d.adresseDepart,  ville: d.villeDepart },
    adresseArrivee: { adresse: d.adresseArrivee, ville: d.villeArrivee },
    services:       d.services,
    dateSouhaitee:  d.dateSouhaitee,
    volumeEstime:   typeof volume === 'number' && Number.isFinite(volume) ? volume : undefined,
    commentaire:    d.commentaire,
    photosMeubles:  session.mediaIds,
  }
  const json = await postJson<{ numeroDossier: string }>('/api/devis', body)
  return json.numeroDossier
}

/** Crée une demande de rendez-vous. */
export async function createRdv(session: Session): Promise<void> {
  const d = session.data
  await postJson<{ success: boolean }>('/api/rdv', {
    type:       d.type,
    nom:        d.nom,
    prenom:     d.prenom,
    telephone:  session.numero,
    whatsapp:   session.numero,
    email:      d.email,
    adresse:    d.adresse,
    dateVisite: d.dateVisite,
    heure:      d.heure,
  })
}
