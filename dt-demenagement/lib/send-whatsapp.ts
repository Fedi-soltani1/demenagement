// lib/send-whatsapp.ts
// Envoi d'un message via le bot WhatsApp interne (numéro auto-hébergé).
// Même contrat que app/api/admin/send-rdv-whatsapp.
import { env } from '@/lib/env'

export async function sendWhatsAppMessage(telephone: string, message: string): Promise<void> {
  if (!env.BOT_SEND_URL || !env.BOT_SEND_SECRET) {
    throw new Error('Bot WhatsApp non configuré (BOT_SEND_URL/SECRET)')
  }
  const res = await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-message`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
    body:    JSON.stringify({ telephone, message }),
  })
  if (!res.ok) {
    const j: { error?: string } = await res.json().catch(() => ({}))
    throw new Error(j.error ?? `Échec envoi WhatsApp (${res.status})`)
  }
}
