// Rate limiting partagé par les endpoints publics.
// - Si UPSTASH_REDIS_REST_URL/TOKEN sont configurés → quota DISTRIBUÉ via Upstash
//   (robuste sur Vercel serverless multi-instances), sans dépendance npm (REST + fetch).
// - Sinon → repli en mémoire (fenêtre fixe), best-effort par instance. Le dev sans
//   Upstash fonctionne exactement comme avant (aucun affaiblissement).
// En cas d'erreur Upstash, on retombe sur le compteur mémoire (résilient).

const memStore = new Map<string, { count: number; resetAt: number }>()

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

/** Adresse IP de l'appelant (en-têtes proxy), ou 'anonymous' si indéterminable. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'anonymous'
}

async function upstash(command: string[]): Promise<number> {
  const res = await fetch(`${UPSTASH_URL}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const json = (await res.json()) as { result?: unknown }
  return Number(json.result ?? 0)
}

function memRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = memStore.get(key)
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}

/**
 * Fenêtre fixe : autorise `limit` requêtes par `windowMs` pour une `key` donnée.
 * @returns true si la requête est AUTORISÉE, false si la limite est dépassée.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const count = await upstash(['INCR', key])
      if (count === 1) await upstash(['EXPIRE', key, String(Math.ceil(windowMs / 1000))])
      return count <= limit
    } catch {
      // Upstash injoignable → repli mémoire (ne jamais bloquer le service pour autant).
      return memRateLimit(key, limit, windowMs)
    }
  }
  return memRateLimit(key, limit, windowMs)
}
