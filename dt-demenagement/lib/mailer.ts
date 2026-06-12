import nodemailer from 'nodemailer'

function createTransport(): nodemailer.Transporter {
  const transport = nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'smtp.resend.com',
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
    connectionTimeout: 15_000,
    greetingTimeout:   15_000,
    socketTimeout:     30_000,
  })
  // Prevent unhandled 'error' events from crashing the process
  transport.on('error', (err) => {
    console.error('[mailer] transport error:', err)
  })
  return transport
}

export type MailAttachment = { filename: string; content: Buffer | string }

export async function sendMail(opts: {
  to:           string
  subject:      string
  html:         string
  attachments?: MailAttachment[]
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? 'DT Déménagement <contact@demenagement.tn>'
  const transport = createTransport()
  try {
    const info = await transport.sendMail({
      from,
      to:          opts.to,
      subject:     opts.subject,
      html:        opts.html,
      attachments: opts.attachments,
    })
    console.log('[mailer] email sent:', info.messageId, '→', opts.to)
  } catch (err) {
    console.error('[mailer] sendMail failed — host:', process.env.SMTP_HOST, 'user:', process.env.SMTP_USER, 'error:', err)
    throw err
  } finally {
    transport.close()
  }
}

// Backward-compat export
export const mailer = null
