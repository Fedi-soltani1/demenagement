import { downloadMediaMessage, type WASocket, type proto } from '@whiskeysockets/baileys'
import { handleMessage } from './conversation.js'
import { getSession, saveSession, type Session } from './sessions.js'
import { createDevis, createRdv, uploadMedia } from './payloadClient.js'
import { startSocket } from './connection.js'
import { DEVIS_STEPS } from './flows.js'

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
    try {
      const buffer = (await downloadMediaMessage(msg, 'buffer', {})) as Buffer
      const id = await uploadMedia(buffer, image.mimetype ?? 'image/jpeg')
      session.mediaIds.push(id)
      saveSession(session)
      await send(sock, jid, `Photo reçue ✅ (${session.mediaIds.length}). Envoyez-en d'autres ou tapez OK.`)
    } catch {
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

startSocket((sock) => {
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) void onMessage(sock, msg)
  })
})
