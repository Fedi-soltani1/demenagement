import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? '')

export type MailAttachment = { filename: string; content: Buffer | string }

export async function sendMail(opts: {
  to:           string
  subject:      string
  html:         string
  attachments?: MailAttachment[]
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? 'DT Déménagement <contact@demenagement.tn>'

  const { data, error } = await resend.emails.send({
    from,
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content:  a.content instanceof Buffer ? a.content : Buffer.from(a.content),
    })),
  })

  if (error) {
    console.error('[mailer] Resend error → to:', opts.to, 'error:', error)
    throw new Error(error.message)
  }

  console.log('[mailer] sent:', data?.id, '→', opts.to)
}

// Backward-compat export
export const mailer = null
