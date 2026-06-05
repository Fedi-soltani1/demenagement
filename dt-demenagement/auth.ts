import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import Nodemailer from 'next-auth/providers/nodemailer'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import { authConfig } from './auth.config'
import { sendMail } from '@/lib/mailer'
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from '@/lib/auth-schema'

// Augmentation du type Session pour inclure l'id utilisateur
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
  }
}

// Singleton PostgreSQL — connexion séparée de Payload CMS
// Évite la multiplication des pools lors du hot-reload en développement
const globalWithAuthPg = globalThis as typeof globalThis & {
  _authPgClient: ReturnType<typeof postgres> | undefined
}

if (!globalWithAuthPg._authPgClient) {
  globalWithAuthPg._authPgClient = postgres(env.DATABASE_URL, {
    max: 2,
    idle_timeout: 20,
    ssl: 'require',
  })
}

const authDb = drizzle(globalWithAuthPg._authPgClient)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(authDb, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),
  providers: [
    Nodemailer({
      server: {
        host:   env.SMTP_HOST,
        port:   env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      },
      from: env.EMAIL_FROM,
      sendVerificationRequest: async ({ url, identifier }) => {
        await sendMail({
          to:      identifier,
          subject: 'Votre lien de connexion — DT Déménagement',
          html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <!-- Header -->
        <tr>
          <td style="background:#b52027;padding:24px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
              DT Déménagement Tunisie
            </p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">
              Votre lien de connexion sécurisé
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:14px;color:#a0a0a0;">Bonjour,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Cliquez sur le bouton ci-dessous pour accéder à votre espace client DT Déménagement.
              Ce lien est valable <strong style="color:#c9a84c;">24 heures</strong> et ne peut être utilisé qu'une seule fois.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td align="center" style="background:#b52027;border-radius:8px;">
                  <a href="${url}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                    Accéder à mon espace →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:#a0a0a0;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:
            </p>
            <p style="margin:0;font-size:11px;color:#666;word-break:break-all;">${url}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;line-height:1.5;">
              Si vous n'avez pas demandé ce lien, ignorez cet email — votre compte reste sécurisé.<br>
              © ${new Date().getFullYear()} DT Déménagement Tunisie
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        })
      },
    }),
  ],
})
