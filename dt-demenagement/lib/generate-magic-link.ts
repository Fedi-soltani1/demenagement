import { createHash, randomBytes } from 'crypto'
import postgres from 'postgres'
import { env } from '@/lib/env'

// NextAuth v5 token format:
// - raw token   → sent in the email URL
// - SHA-256(rawToken + AUTH_SECRET) → stored in auth_verification_tokens
// Source: @auth/core/lib/actions/signin/send-token.js
export async function generateMagicLink(email: string, callbackPath: string): Promise<string> {
  const rawToken = randomBytes(32).toString('hex') // 64 hex chars

  const hashedToken = createHash('sha256')
    .update(`${rawToken}${env.AUTH_SECRET}`)
    .digest('hex')

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 h

  const sql = postgres(env.DATABASE_URL, { max: 1, ssl: { rejectUnauthorized: false } })
  try {
    await sql`
      INSERT INTO auth_verification_tokens (identifier, token, expires)
      VALUES (${email}, ${hashedToken}, ${expires})
      ON CONFLICT DO NOTHING
    `
  } finally {
    await sql.end()
  }

  const base = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
  const callbackUrl = encodeURIComponent(callbackPath)
  return `${base}/api/auth/callback/nodemailer?callbackUrl=${callbackUrl}&token=${rawToken}&email=${encodeURIComponent(email)}`
}
