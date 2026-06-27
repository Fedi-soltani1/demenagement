// URL ABSOLUE de l'espace agent (emails / WhatsApp) — jamais de lien relatif
// (un « /agent » nu serait un lien cassé dans un email).
export function resolveAgentAppUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_AGENT_APP_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').trim().replace(/\/+$/, '')
  return base ? `${base}/agent` : 'https://demenagement.tn/agent'
}
