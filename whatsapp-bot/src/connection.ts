// Connexion WhatsApp via Baileys : QR au 1er lancement, reconnexion auto.
import makeWASocket, {
  useMultiFileAuthState,
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
): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({ auth: state, logger })

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
      const code = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode
      const loggedOut = code === DisconnectReason.loggedOut
      console.log(`⚠️ Connexion fermée (code ${code}).`, loggedOut ? 'Déconnecté — rescanner le QR.' : 'Reconnexion…')
      if (!loggedOut) void startSocket(onReady)
    }
  })
}
