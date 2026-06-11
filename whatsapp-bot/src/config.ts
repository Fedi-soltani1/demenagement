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
  httpPort:   Number(process.env.BOT_HTTP_PORT ?? '3100'),
  sendSecret: required('BOT_SEND_SECRET'),
} as const
