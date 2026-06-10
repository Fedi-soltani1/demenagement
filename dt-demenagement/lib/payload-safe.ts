import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

// getPayload wraps Payload.init() which connects to Postgres on first call.
// Neon (serverless Postgres) resets idle connections — the first attempt after
// inactivity throws ECONNRESET with payloadInitError: true. This helper catches
// that and returns null so callers can fall back gracefully instead of 500ing.
export async function getPayloadSafe(): Promise<Payload | null> {
  try {
    return await getPayload({ config })
  } catch {
    return null
  }
}
