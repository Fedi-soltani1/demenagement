import { createHmac } from 'crypto'

const secret = () => process.env.CRON_SECRET ?? 'fallback-dev-secret'

export function signEmailToken(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex').slice(0, 40)
}

export function verifyEmailToken(payload: string, token: string): boolean {
  return signEmailToken(payload) === token
}
