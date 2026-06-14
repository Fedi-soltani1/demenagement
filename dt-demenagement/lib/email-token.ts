import { createHmac } from 'crypto'

const secret = () => {
  const s = process.env.CRON_SECRET
  if (!s) throw new Error('CRON_SECRET env variable is not set')
  return s
}

export function signEmailToken(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex').slice(0, 40)
}

export function verifyEmailToken(payload: string, token: string): boolean {
  return signEmailToken(payload) === token
}
