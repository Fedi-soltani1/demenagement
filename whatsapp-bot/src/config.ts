// Lecture + validation des variables d'environnement du bot.
import 'dotenv/config'

function required(name: string): string {
  const v = process.env[name]
  if (!v || v.trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${name}`)
  }
  return v.replace(/\/$/, '')
}

export const config = {
  apiBaseUrl: required('BOT_API_BASE_URL'),
  logLevel:   process.env.LOG_LEVEL ?? 'info',
} as const
