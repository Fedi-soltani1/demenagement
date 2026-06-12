// Test simple (sans framework) : assertions via node:assert, lancé par tsx.
import assert from 'node:assert'
import { toJid, handleSendDevis } from './httpServer.js'

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

console.log('✅ httpServer.test.ts — toutes les assertions passent')
