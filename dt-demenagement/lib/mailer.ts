import nodemailer from 'nodemailer'

const globalWithMailer = globalThis as typeof globalThis & {
  _mailer: nodemailer.Transporter | undefined
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
}

export const mailer = globalWithMailer._mailer!

export async function sendMail(opts: {
  to: string
  subject: string
  html: string
  attachments?: nodemailer.SendMailOptions['attachments']
}): Promise<void> {
  await mailer.sendMail({
    from:        process.env.EMAIL_FROM ?? 'DT Déménagement <contact@demenagement.tn>',
    to:          opts.to,
    subject:     opts.subject,
    html:        opts.html,
    attachments: opts.attachments,
  })
}
