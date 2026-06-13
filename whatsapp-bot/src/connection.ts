// Connexion WhatsApp via Baileys : QR au 1er lancement, reconnexion auto.
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  type WASocket,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import { config } from './config.js'

const logger = pino({ level: config.logLevel })

/**
 * Démarre la socket Baileys. `onReady` reçoit la socket une fois connectée.
 * Reconnecte automatiquement sauf si la session a été déconnectée volontairement (loggedOut).
 */
export async function startSocket(
  onReady: (sock: WASocket) => void,
  onClose?: () => void,
): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  // Récupère la dernière version de WhatsApp Web (évite l'erreur 405 "Connection Failure"
  // due à une version périmée codée en dur dans Baileys).
  const { version } = await fetchLatestBaileysVersion()
  console.log(`ℹ️  Version WhatsApp Web utilisée : ${version.join('.')}`)

  const sock = makeWASocket({ version, auth: state, logger })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log('\n📱 Scannez ce QR avec WhatsApp (Appareils connectés) :\n')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      console.log('✅ Bot connecté à WhatsApp.')
      onReady(sock)
    }
    if (connection === 'close') {
      // Connexion perdue : prévenir l'appelant pour qu'il invalide la socket courante
      // (sinon l'endpoint /send-devis croit toujours pouvoir envoyer → faux « envoyé »).
      onClose?.()
      const code = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode

      if (code === DisconnectReason.loggedOut) {
        console.log('⛔ Déconnecté (loggedOut). Supprimez le dossier auth/ et rescannez le QR.')
        return
      }
      if (code === DisconnectReason.connectionReplaced) {
        console.log('⛔ Session reprise par une AUTRE instance du bot. Une seule instance peut tourner à la fois — arrêt.')
        process.exit(0)
      }
      // Reconnexion avec un petit délai pour éviter les boucles serrées.
      console.log(`⚠️ Connexion fermée (code ${code}). Reconnexion dans 2 s…`)
      setTimeout(() => void startSocket(onReady, onClose), 2000)
    }
  })
}
