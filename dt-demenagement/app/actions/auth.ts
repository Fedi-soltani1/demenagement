'use server'

import { signIn } from '@/auth'
export async function sendMagicLink(email: string, callbackUrl: string): Promise<{ error?: string }> {
  try {
    // Provider NextAuth « nodemailer » (envoie le lien via Hostinger SMTP, cf. auth.ts).
    // ⚠️ Doit correspondre à l'id du provider configuré dans auth.ts (Nodemailer → 'nodemailer').
    await signIn('nodemailer', { email, redirectTo: callbackUrl })
    return {}
  } catch (err) {
    // Next.js redirect errors (NEXT_REDIRECT) must propagate — they're not real errors
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err
    return { error: 'errorDefault' }
  }
}
