import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Lightweight DB ping — keeps Neon from going idle.
// Call this every 4 minutes from an uptime monitor (UptimeRobot free tier works).
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.find({ collection: 'admins', limit: 1, overrideAccess: true })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
