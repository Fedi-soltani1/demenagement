import { downloadMediaMessage, type WASocket, type proto } from '@whiskeysockets/baileys'
import pino from 'pino'
import { handleMessage } from './conversation.js'
import { getSession, saveSession, type Session } from './sessions.js'
import { createDevis, createRdv, uploadMedia } from './payloadClient.js'
import { startSocket } from './connection.js'
import { startHttpServer } from './httpServer.js'
import { DEVIS_STEPS } from './flows.js'

// Garde-fous globaux : Baileys lève parfois des erreurs internes transitoires
// (ex : "Timed Out" 408 sur sendPassiveIq) non rattrapées qui crasheraient le
// process. On les logue sans tuer le bot — la connexion reste ouverte.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason instanceof Error ? reason.message : reason)
})
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err instanceof Error ? err.message : err)
})

/** Extrait le numéro E.164 (+216…) depuis un JID WhatsApp (ex : 21652880311@s.whatsapp.net). */
function numeroFromJid(jid: string): string {
  return '+' + jid.split('@')[0]!.split(':')[0]!
}

/** Texte d'un message (conversation simple ou extendedText). */
function textOf(msg: proto.IWebMessageInfo): string | undefined {
  return msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? undefined
}

/** Vrai si la session devis est à l'étape "photos". */
function isPhotosStep(session: Session): boolean {
  return session.flux === 'devis' && DEVIS_STEPS[session.stepIndex]?.kind === 'photos'
}

const mediaLogger = pino({ level: 'silent' })

async function send(sock: WASocket, jid: string, text: string): Promise<void> {
  await sock.sendMessage(jid, { text })
}

async function onMessage(sock: WASocket, msg: proto.IWebMessageInfo): Promise<void> {
  const jid = msg.key.remoteJid
  if (!jid || msg.key.fromMe || jid.endsWith('@g.us')) return  // ignore soi-même + groupes
  const numero = numeroFromJid(jid)
  const session = getSession(numero)

  // 1) Image reçue pendant l'étape photos -> télécharger + uploader
  const image = msg.message?.imageMessage
  if (image && isPhotosStep(session)) {
    if (session.mediaIds.length >= 5) {
      await send(sock, jid, 'Vous avez déjà 5 photos (le maximum). Tapez OK pour continuer.')
      return
    }
    try {
      const buffer = (await downloadMediaMessage(
        msg,
        'buffer',
        {},
        { logger: mediaLogger, reuploadRequest: sock.updateMediaMessage },
      )) as Buffer
      const id = await uploadMedia(buffer, image.mimetype ?? 'image/jpeg')
      session.mediaIds.push(id)
      saveSession(session)
      await send(sock, jid, `Photo reçue ✅ (${session.mediaIds.length}). Envoyez-en d'autres ou tapez OK.`)
    } catch (e) {
      console.error('[photo]', e instanceof Error ? e.message : e)
      await send(sock, jid, "Désolé, je n'ai pas pu enregistrer cette photo. Réessayez ou tapez OK.")
    }
    return
  }

  // 2) Message texte -> moteur
  const text = textOf(msg)
  if (!text) return
  const result = handleMessage(text, session)
  saveSession(result.session)

  for (const reply of result.replies) await send(sock, jid, reply)

  // 3) Soumission éventuelle
  if (result.action) {
    try {
      if (result.action.type === 'submit-devis') {
        const numeroDossier = await createDevis(result.session)
        await send(sock, jid, `✅ Demande envoyée ! Votre dossier est le ${numeroDossier}. Notre équipe vous recontacte vite.`)
      } else {
        await createRdv(result.session)
        await send(sock, jid, '✅ Demande de visite enregistrée ! Notre équipe vous recontacte pour confirmer.')
      }
    } catch (e) {
      await send(sock, jid, "Une erreur est survenue lors de l'envoi. Réessayez plus tard ou appelez le +216 52 880 311.")
      console.error('[submit]', e)
    } finally {
      // repartir au menu après soumission
      const reset = getSession(numero)
      reset.flux = 'menu'; reset.stepIndex = 0; reset.data = {}; reset.mediaIds = []
      saveSession(reset)
    }
  }
}

// Socket courante, mise à jour à chaque (re)connexion (startSocket rappelle onReady
// à chaque 'connection open'). Le serveur HTTP lit toujours la dernière via ce getter.
let currentSock: WASocket | null = null
let httpStarted = false

startSocket((sock) => {
  currentSock = sock

  // Traitement SÉQUENTIEL : si plusieurs photos arrivent en rafale, on les traite
  // une par une (sinon course sur la session -> photos perdues).
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) await onMessage(sock, msg)
  })

  // Le serveur HTTP ne doit démarrer qu'UNE fois (sinon EADDRINUSE à la reconnexion).
  if (!httpStarted) {
    startHttpServer(() => currentSock)
    httpStarted = true
  }
})
