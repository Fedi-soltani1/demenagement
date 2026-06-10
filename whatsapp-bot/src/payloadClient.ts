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
  // Nom de fichier UNIQUE : Payload refuse les doublons de filename (sinon 500
  // "filename invalid" dès la 2e photo, qui s'appelaient toutes "photo.jpg").
  const ext = (mimetype.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg')
  const name = `wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  form.append('file', new Blob([new Uint8Array(buffer)], { type: mimetype }), name)
  const res = await fetch(`${config.apiBaseUrl}/api/devis/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`upload -> ${res.status}`)
  const json = (await res.json()) as { id: string }
  return json.id
}

/**
 * Convertit une date saisie au format libre en chaîne ISO.
 * Gère JJ/MM/AAAA (et JJ-MM-AAAA, JJ.MM.AAAA) + tout ce que `new Date` sait lire.
 * Renvoie null si non interprétable.
 */
function toIsoDate(input: string): string | null {
  const t = input.trim()
  const m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    return isNaN(d.getTime()) ? null : d.toISOString()
  }
  const d = new Date(t)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

/** Crée un dossier devis. Renvoie le numéro de dossier. */
export async function createDevis(session: Session): Promise<string> {
  const d = session.data
  const volume = typeof d.volumeEstime === 'string'
    ? Number(String(d.volumeEstime).replace(',', '.'))
    : undefined

  // Le site fait new Date(dateSouhaitee).toISOString() : on doit envoyer une date
  // parseable. Si la saisie est illisible, on la bascule dans le commentaire.
  let dateSouhaitee: string | undefined
  let commentaire = typeof d.commentaire === 'string' ? d.commentaire : undefined
  if (typeof d.dateSouhaitee === 'string' && d.dateSouhaitee.trim()) {
    const iso = toIsoDate(d.dateSouhaitee)
    if (iso) dateSouhaitee = iso
    else commentaire = [commentaire, `Date souhaitée : ${d.dateSouhaitee}`].filter(Boolean).join(' — ')
  }

  const body = {
    type:       d.type,
    prenom:     d.prenom,
    nom:        d.nom,
    email:      d.email,                 // peut être undefined
    telephone:  session.numero,          // numéro WhatsApp
    adresseDepart:  { adresse: d.adresseDepart,  ville: d.villeDepart },
    adresseArrivee: { adresse: d.adresseArrivee, ville: d.villeArrivee },
    services:       d.services,
    dateSouhaitee,
    volumeEstime:   typeof volume === 'number' && Number.isFinite(volume) ? volume : undefined,
    commentaire,
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
