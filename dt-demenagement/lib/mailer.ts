import nodemailer from 'nodemailer'

const globalWithMailer = globalThis as typeof globalThis & {
  _mailer:         nodemailer.Transporter | undefined
  _mailerVerified: boolean
}

if (!globalWithMailer._mailer) {
  globalWithMailer._mailer = nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'smtp.hostinger.com',
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
    // Persistent connection pool — avoids TCP+TLS handshake on every email
    pool:            true,
    maxConnections:  3,
    maxMessages:     100,
    // Timeouts — fail fast instead of hanging
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     30_000,
  })
  globalWithMailer._mailerVerified = false
}

// Verify SMTP credentials once at startup — surfaces config errors early instead of
// discovering them silently on the first real email sent in production.
if (!globalWithMailer._mailerVerified && process.env.SMTP_USER) {
  globalWithMailer._mailerVerified = true
  globalWithMailer._mailer!.verify().then(() => {
    console.log('[mailer] SMTP connexion OK — Hostinger SMTP prêt')
  }).catch((err: unknown) => {
    console.error('[mailer] SMTP connexion FAILED — les emails ne seront pas envoyés :', err)
  })
}

export const mailer = globalWithMailer._mailer!

export async function sendMail(opts: {
  to: string
  subject: string
  html: string
  attachments?: nodemailer.SendMailOptions['attachments']
}): Promise<void> {
  try {
    await mailer.sendMail({
      from:        process.env.EMAIL_FROM ?? 'DT Déménagement <contact@demenagement.tn>',
      to:          opts.to,
      subject:     opts.subject,
      html:        opts.html,
      attachments: opts.attachments,
    })
  } catch (err) {
    console.error(`[mailer] Échec envoi email à "${opts.to}" (sujet: "${opts.subject}") :`, err)
    throw err
  }
}
