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

  // Code de jumelage (pairing code) — alternative au QR, plus simple sur un serveur
  // headless où le QR ASCII est difficile à scanner. Si BOT_PAIRING_NUMBER est défini
  // et que la session n'est pas encore enregistrée, on demande un code à 8 caractères
  // à saisir dans WhatsApp (Appareils connectés → Lier un appareil →
  // « Lier avec le numéro de téléphone »). Le délai laisse la socket s'établir.
  const pairingNumber = process.env.BOT_PAIRING_NUMBER?.replace(/[^0-9]/g, '')
  if (pairingNumber && !sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(pairingNumber)
        console.log(`\n🔑 CODE DE JUMELAGE : ${code}`)
        console.log('   → WhatsApp → Appareils connectés → Lier un appareil → « Lier avec le numéro de téléphone » → entre ce code.\n')
      } catch (err) {
        console.log('⚠️ Impossible de générer le code de jumelage :', err)
      }
    }, 3000)
  }

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
