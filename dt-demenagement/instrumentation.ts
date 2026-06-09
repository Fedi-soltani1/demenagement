export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Neon serverless Postgres resets idle connections — Payload's pool leaks
    // an unhandledRejection with `undefined` or an ECONNRESET message when this
    // happens. The outer try/catch in each server component already handles the
    // error gracefully; we just need to prevent the process from crashing.
    process.on('unhandledRejection', (reason) => {
      if (reason == null) return
      const msg = reason instanceof Error ? reason.message : String(reason)
      if (
        msg.includes('ECONNRESET') ||
        msg.includes('cannot connect to Postgres') ||
        msg.includes('Connection terminated')
      ) {
        return
      }
      console.error('[unhandledRejection]', reason)
    })
  }
}
