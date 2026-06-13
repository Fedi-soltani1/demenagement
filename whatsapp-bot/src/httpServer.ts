// Serveur HTTP minimal du bot : reçoit un PDF de devis et le relaie sur WhatsApp.
// Module `http` natif (zéro dépendance). Démarré une seule fois depuis index.ts.
import { createServer, type Server } from 'node:http'
import type { WASocket } from '@whiskeysockets/baileys'
import { config } from './config.js'

const MAX_BODY = 10 * 1024 * 1024 // 10 Mo

export interface SendDevisBody {
  telephone: string
  fileName:  string
  pdfBase64: string
  message:   string
}

export interface SendResult { status: number; body: Record<string, unknown> }

/** Normalise un téléphone (+216…, 00216…, espaces) en JID WhatsApp. */
export function toJid(telephone: string): string {
  const digits = telephone.replace(/[^0-9]/g, '').replace(/^00/, '')
  return `${digits}@s.whatsapp.net`
}

type MinimalSock = Pick<WASocket, 'onWhatsApp' | 'sendMessage'>

/** Logique d'envoi isolée (socket injectée) — testable sans vraie connexion. */
export async function handleSendDevis(
  body: Partial<SendDevisBody>,
  sock: MinimalSock,
): Promise<SendResult> {
  const { telephone, fileName, pdfBase64, message } = body
  if (!telephone || !fileName || !pdfBase64 || !message) {
    return { status: 422, body: { error: 'Champs manquants' } }
  }
  const jid = toJid(telephone)
  const found = (await sock.onWhatsApp(jid)) ?? []
  if (!found[0]?.exists) {
    return { status: 422, body: { error: "Ce numéro n'a pas de compte WhatsApp" } }
  }
  await sock.sendMessage(jid, {
    document: Buffer.from(pdfBase64, 'base64'),
    fileName,
    mimetype: 'application/pdf',
    caption: message,
  })
  return { status: 200, body: { success: true } }
}

/** Démarre le serveur HTTP (une seule fois). `getSock` renvoie la socket courante (ou null).
 *  Si le bot est déconnecté de WhatsApp, `getSock()` renvoie null → l'endpoint répond 503
 *  (pas de faux « envoyé »). `port` est paramétrable pour les tests (0 = port libre aléatoire). */
export function startHttpServer(getSock: () => WASocket | null, port: number = config.httpPort): Server {
  const server = createServer((req, res) => {
    const json = (status: number, obj: Record<string, unknown>): void => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(obj))
    }

    if (req.method !== 'POST' || req.url !== '/send-devis') {
      json(404, { error: 'Not found' }); return
    }
    if (req.headers['x-bot-secret'] !== config.sendSecret) {
      json(401, { error: 'Non autorisé' }); return
    }

    let raw = ''
    let tooBig = false
    req.on('data', (chunk: Buffer) => {
      raw += chunk
      if (raw.length > MAX_BODY) { tooBig = true; req.destroy() }
    })
    req.on('end', () => {
      void (async () => {
        if (tooBig) { json(413, { error: 'Body trop volumineux' }); return }
        const sock = getSock()
        if (!sock) { json(503, { error: 'Bot non connecté à WhatsApp' }); return }
        try {
          const parsed = JSON.parse(raw) as Partial<SendDevisBody>
          const result = await handleSendDevis(parsed, sock)
          json(result.status, result.body)
        } catch (e) {
          console.error('[send-devis]', e instanceof Error ? e.message : e)
          json(500, { error: e instanceof Error ? e.message : 'Erreur interne' })
        }
      })()
    })
  })
  server.listen(port, () => {
    const actual = (server.address() as { port: number } | null)?.port ?? port
    console.log(`🌐 Serveur HTTP du bot prêt sur le port ${actual} (POST /send-devis)`)
  })
  return server
}
