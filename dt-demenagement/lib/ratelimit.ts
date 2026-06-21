// Rate limiting en mémoire (fenêtre fixe), partagé par les endpoints publics.
// ⚠️ Sur un hébergement serverless multi-instances (ex. Vercel), le compteur est
// PAR INSTANCE → protection best-effort contre les floods d'une même source.
// Pour un quota distribué robuste, brancher Upstash/Vercel KV (remplacer `store`
// par un store partagé) — voir docs/DEPLOIEMENT-VERCEL.md.

const store = new Map<string, { count: number; resetAt: number }>()

/** Adresse IP de l'appelant (en-têtes proxy), ou 'anonymous' si indéterminable. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'anonymous'
}

/**
 * Fenêtre fixe : autorise `limit` requêtes par `windowMs` pour une `key` donnée.
 * @returns true si la requête est AUTORISÉE, false si la limite est dépassée.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}
