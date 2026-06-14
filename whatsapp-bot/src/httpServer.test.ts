// Test simple (sans framework) : assertions via node:assert, lancé par tsx.
import assert from 'node:assert'
import { toJid, handleSendDevis, handleSendMessage, startHttpServer } from './httpServer.js'
import { config } from './config.js'

// --- toJid ---
assert.equal(toJid('+216 53 064 275'), '21653064275@s.whatsapp.net', 'toJid +216')
assert.equal(toJid('0021653064275'), '21653064275@s.whatsapp.net', 'toJid 00216')

// --- handleSendDevis : champs manquants -> 422 ---
{
  const fakeSock = {
    onWhatsApp: async () => [{ exists: true, jid: 'x' }],
    sendMessage: async () => ({}),
  }
  const r = await handleSendDevis({ telephone: '+21653064275' }, fakeSock as never)
  assert.equal(r.status, 422, 'champs manquants -> 422')
}

// --- handleSendDevis : numéro sans WhatsApp -> 422 ---
{
  const fakeSock = {
    onWhatsApp: async () => [],
    sendMessage: async () => ({}),
  }
  const r = await handleSendDevis(
    { telephone: '+21653064275', fileName: 'd.pdf', pdfBase64: 'AAA', message: 'hi' },
    fakeSock as never,
  )
  assert.equal(r.status, 422, 'pas de WhatsApp -> 422')
}

// --- handleSendDevis : OK -> 200 + sendMessage appelé avec un document ---
{
  const calls: { jid: string; content: Record<string, unknown> }[] = []
  const fakeSock = {
    onWhatsApp: async () => [{ exists: true, jid: 'x' }],
    sendMessage: async (jid: string, content: Record<string, unknown>) => { calls.push({ jid, content }); return {} },
  }
  const r = await handleSendDevis(
    { telephone: '+21653064275', fileName: 'Devis.pdf', pdfBase64: Buffer.from('hello').toString('base64'), message: 'Bonjour' },
    fakeSock as never,
  )
  assert.equal(r.status, 200, 'envoi OK -> 200')
  assert.equal(calls.length, 1, 'sendMessage doit être appelé une fois')
  const sent = calls[0]!
  assert.equal(sent.jid, '21653064275@s.whatsapp.net', 'jid correct')
  assert.equal((sent.content as { fileName?: string }).fileName, 'Devis.pdf', 'fileName propagé')
  assert.equal((sent.content as { mimetype?: string }).mimetype, 'application/pdf', 'mimetype PDF')
}

// --- handleSendMessage : texte OK -> 200 ---
{
  const calls: { jid: string; content: Record<string, unknown> }[] = []
  const fakeSock = {
    onWhatsApp: async () => [{ exists: true, jid: 'x' }],
    sendMessage: async (jid: string, content: Record<string, unknown>) => { calls.push({ jid, content }); return {} },
  }
  const r = await handleSendMessage({ telephone: '+21653064275', message: 'Bonjour' }, fakeSock as never)
  assert.equal(r.status, 200, 'message OK -> 200')
  assert.equal(calls.length, 1, 'sendMessage appelé')
  assert.equal((calls[0]!.content as { text?: string }).text, 'Bonjour', 'texte envoyé')
}

// --- handleSendMessage : champs manquants -> 422 ---
{
  const fakeSock = { onWhatsApp: async () => [{ exists: true, jid: 'x' }], sendMessage: async () => ({}) }
  const r = await handleSendMessage({ telephone: '+21653064275' }, fakeSock as never)
  assert.equal(r.status, 422, 'message manquant -> 422')
}

// --- startHttpServer : bot déconnecté (getSock -> null) -> 503, pas de faux « envoyé » ---
{
  const server = startHttpServer(() => null, 0) // port 0 = port libre aléatoire
  await new Promise<void>((r) => server.once('listening', () => r()))
  const addr = server.address()
  const port = typeof addr === 'object' && addr ? addr.port : 0
  const res = await fetch(`http://localhost:${port}/send-devis`, {
    method:  'POST',
    headers: { 'x-bot-secret': config.sendSecret, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ telephone: '+21653064275', fileName: 'd.pdf', pdfBase64: 'AAA', message: 'hi' }),
  })
  assert.equal(res.status, 503, 'bot déconnecté (sock null) -> 503')
  server.close()
}

console.log('✅ httpServer.test.ts — toutes les assertions passent')
