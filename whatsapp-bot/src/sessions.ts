// Store des sessions en mémoire. Module PUR (pas d'I/O réseau).

export type Flux = 'menu' | 'devis' | 'rdv'

export interface Session {
  numero:    string                   // numéro WhatsApp de l'expéditeur (E.164 +216…)
  flux:      Flux
  stepIndex: number
  data:      Record<string, unknown>
  mediaIds:  string[]
  updatedAt: number
}

const TTL_MS = 24 * 60 * 60 * 1000    // 24 h d'inactivité
const store = new Map<string, Session>()

function fresh(numero: string): Session {
  return { numero, flux: 'menu', stepIndex: 0, data: {}, mediaIds: [], updatedAt: Date.now() }
}

/** Récupère la session, en créant une neuve si absente ou expirée. */
export function getSession(numero: string): Session {
  const existing = store.get(numero)
  if (!existing || Date.now() - existing.updatedAt > TTL_MS) {
    const s = fresh(numero)
    store.set(numero, s)
    return s
  }
  return existing
}

/** Sauvegarde la session (met à jour updatedAt). */
export function saveSession(session: Session): void {
  session.updatedAt = Date.now()
  store.set(session.numero, session)
}

/** Réinitialise la session au menu d'accueil. */
export function resetSession(numero: string): Session {
  const s = fresh(numero)
  store.set(numero, s)
  return s
}
