import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// ── Resend SDK (primary) ──────────────────────────────────────────────────────
// Uses REST API — no domain verification required for API key sending.
// Domain verification only needed to customise the FROM address (production).

const resendApiKey = process.env.RESEND_API_KEY ?? process.env.SMTP_PASS ?? ''
const useResend = resendApiKey.startsWith('re_')

let resendClient: Resend | null = null
if (useResend) {
  resendClient = new Resend(resendApiKey)
}

// ── Nodemailer fallback (SMTP) ────────────────────────────────────────────────
const globalWithMailer = globalThis as typeof globalThis & {
  _mailer:         nodemailer.Transporter | undefined
  _mailerVerified: boolean
}

if (!globalWithMailer._mailer && !useResend) {
  globalWithMailer._mailer = nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'smtp.hostinger.com',
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
    pool:              true,
    maxConnections:    3,
    maxMessages:       100,
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     30_000,
  })
  globalWithMailer._mailerVerified = false
}

if (!useResend && !globalWithMailer._mailerVerified && process.env.SMTP_USER) {
  globalWithMailer._mailerVerified = true
  globalWithMailer._mailer!.verify().then(() => {
    console.log('[mailer] SMTP connexion OK')
  }).catch((err: unknown) => {
    console.error('[mailer] SMTP connexion FAILED :', err)
  })
}

// ── FROM address ──────────────────────────────────────────────────────────────
// When demenagement.tn is verified in Resend → use contact@demenagement.tn
// Until then → use onboarding@resend.dev (Resend shared sender, works immediately)
function getFromAddress(): string {
  const configured = process.env.EMAIL_FROM
  if (configured && configured !== 'DT Déménagement <contact@demenagement.tn>') {
    return configured
  }
  // Resend shared domain for unverified accounts
  if (useResend) return 'DT Déménagement <onboarding@resend.dev>'
  return configured ?? 'DT Déménagement <contact@demenagement.tn>'
}

// ── Public sendMail ────────────────────────────────────────────────────────────
export async function sendMail(opts: {
  to: string
  subject: string
  html: string
  attachments?: nodemailer.SendMailOptions['attachments']
}): Promise<void> {
  const from = getFromAddress()

  if (resendClient) {
    const { error } = await resendClient.emails.send({
      from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
    })
    if (error) {
      console.error(`[mailer] Resend error pour "${opts.to}" :`, error)
      throw new Error(error.message)
    }
    return
  }

  try {
    await globalWithMailer._mailer!.sendMail({
      from,
      to:          opts.to,
      subject:     opts.subject,
      html:        opts.html,
      attachments: opts.attachments,
    })
  } catch (err) {
    console.error(`[mailer] SMTP échec pour "${opts.to}" :`, err)
    throw err
  }
}

// Kept for backward compatibility — callers that import mailer directly
export const mailer = globalWithMailer._mailer
