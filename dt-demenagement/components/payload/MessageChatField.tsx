'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

interface Message {
  id:           string | number
  auteur:       'client' | 'admin'
  contenu:      string
  createdAt:    string
  lu:           boolean
  luParClient:  boolean
}

const TEMPLATES = [
  'Bonjour, votre dossier est en cours de traitement.',
  'Nous avons bien reçu votre demande et vous recontacterons très prochainement.',
  'Votre devis est prêt. Vous le trouverez en pièce jointe de l\'email que nous venons de vous envoyer.',
  'Pourriez-vous confirmer la date souhaitée pour votre déménagement ?',
  'N\'hésitez pas à nous appeler au +216 52 880 311 pour toute question.',
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDaySeparator(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (day.getTime() === today.getTime()) return 'Aujourd\'hui'
  if (day.getTime() === yesterday.getTime()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function MessageChatField() {
  const { id } = useDocumentInfo()

  const [messages,  setMessages]  = useState<Message[]>([])
  const [content,   setContent]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(true)
  const [isPending, startTransition] = useTransition()
  const listRef = useRef<HTMLDivElement>(null)

  const markAsRead = async (dossierId: number) => {
    await fetch('/api/admin/messages/read', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ dossierId }),
    }).catch(() => { /* silent */ })
  }

  const fetchMessages = async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/admin/messages?dossierId=${id}`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json() as { messages: Message[] }
      setMessages(data.messages)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMessages().then(() => {
      if (id) void markAsRead(Number(id))
    })
    const timer = setInterval(() => void fetchMessages(), 10_000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || isPending || !id) return
    setError('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/message', {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          credentials: 'include',
          body:        JSON.stringify({ dossierId: Number(id), contenu: trimmed }),
        })
        if (!res.ok) throw new Error()
        const data = await res.json() as { message: Message }
        setMessages((prev) => [...prev, data.message])
        setContent('')
      } catch {
        setError("Erreur lors de l'envoi. Réessayez.")
      }
    })
  }

  if (!id) {
    return (
      <div style={styles.empty}>
        Sauvegardez d'abord le dossier pour accéder à la messagerie.
      </div>
    )
  }

  const unreadClientCount = messages.filter(m => !m.lu && m.auteur === 'client').length

  // Group messages by day to insert date separators
  const rendered: React.ReactNode[] = []
  let lastDayKey = ''

  for (const msg of messages) {
    const dk = dayKey(msg.createdAt)
    if (dk !== lastDayKey) {
      lastDayKey = dk
      rendered.push(
        <div key={`sep-${dk}`} style={styles.dateSep}>
          <span style={styles.dateSepLine} />
          <span style={styles.dateSepLabel}>{formatDaySeparator(msg.createdAt)}</span>
          <span style={styles.dateSepLine} />
        </div>
      )
    }

    // System event: messages starting with 📤 or ℹ️ render as centered chips
    const isSystem = msg.contenu.startsWith('📤') || msg.contenu.startsWith('ℹ️') || msg.contenu.startsWith('✅')
    if (isSystem) {
      rendered.push(
        <div key={msg.id} style={styles.systemChipRow}>
          <div style={styles.systemChip}>
            <span>{msg.contenu}</span>
            <span style={styles.systemChipTime}>{formatTime(msg.createdAt)}</span>
          </div>
        </div>
      )
      continue
    }

    const isAdminMsg = msg.auteur === 'admin'
    rendered.push(
      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdminMsg ? 'flex-end' : 'flex-start' }}>
        <div style={{
          ...styles.bubble,
          backgroundColor:  isAdminMsg ? '#1a3a6b' : '#1f2937',
          borderRadius:     isAdminMsg ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          border:           isAdminMsg ? '1px solid #1d4ed8' : '1px solid #374151',
        }}>
          <div style={{ ...styles.bubbleAuthor, color: isAdminMsg ? '#93c5fd' : '#9ca3af' }}>
            {isAdminMsg ? '👤 Admin' : '🧑 Client'}
            {!isAdminMsg && !msg.lu && (
              <span style={styles.newDot}> ● Nouveau</span>
            )}
          </div>
          <div style={styles.bubbleText}>{msg.contenu}</div>
          <div style={styles.bubbleFooter}>
            <span style={styles.bubbleTime}>{formatTime(msg.createdAt)}</span>
            {isAdminMsg && (
              <span style={msg.luParClient ? styles.seenBadge : styles.unreadBadge}>
                {msg.luParClient ? '✓✓ Lu par le client' : '✓ Envoyé'}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>💬 Messagerie client</span>
        <span style={styles.headerMeta}>
          {unreadClientCount > 0 && (
            <span style={styles.unreadBadgeHeader}>
              {unreadClientCount} non lu{unreadClientCount > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ color: '#555', fontSize: '11px' }}>↻ 10s</span>
        </span>
      </div>

      {/* Messages */}
      <div ref={listRef} style={styles.messageList}>
        {loading ? (
          <div style={styles.empty}>Chargement…</div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>Aucun message pour ce dossier.</div>
        ) : (
          rendered
        )}
      </div>

      {/* Quick-reply templates */}
      <div style={styles.templatesRow}>
        <span style={styles.templatesLabel}>Réponses rapides :</span>
        {TEMPLATES.map((tpl, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setContent(tpl)}
            style={styles.templatePill}
          >
            {tpl.length > 44 ? tpl.slice(0, 44) + '…' : tpl}
          </button>
        ))}
      </div>

      {/* Reply */}
      <div style={styles.replyRow}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Répondre au client… (Entrée = envoyer, Maj+Entrée = nouvelle ligne)"
          rows={2}
          disabled={isPending}
          style={styles.textarea}
        />
        <button
          onClick={handleSend}
          disabled={isPending || !content.trim()}
          style={{
            ...styles.sendBtn,
            backgroundColor: isPending || !content.trim() ? '#374151' : '#1d4ed8',
            cursor:          isPending || !content.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? '…' : '→ Envoyer'}
        </button>
      </div>

      {error && <div style={styles.errorBar}>{error}</div>}
    </div>
  )
}

// ─── Inline styles (no Tailwind in Payload admin components) ──────────────────

const styles = {
  wrapper: {
    border:          '1px solid #2a2a2a',
    borderRadius:    '12px',
    overflow:        'hidden',
    backgroundColor: '#0f0f0f',
    marginTop:       '8px',
  } as React.CSSProperties,

  header: {
    padding:         '12px 16px',
    borderBottom:    '1px solid #2a2a2a',
    backgroundColor: '#161616',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
  } as React.CSSProperties,

  headerTitle: {
    fontSize:   '14px',
    fontWeight: 600,
    color:      '#f8f5f0',
  } as React.CSSProperties,

  headerMeta: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
  } as React.CSSProperties,

  unreadBadgeHeader: {
    fontSize:        '11px',
    backgroundColor: '#b52027',
    color:           '#fff',
    borderRadius:    '999px',
    padding:         '2px 8px',
    fontWeight:      700,
  } as React.CSSProperties,

  messageList: {
    height:        '380px',
    overflowY:     'auto',
    padding:       '16px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '8px',
  } as React.CSSProperties,

  empty: {
    color:      '#555',
    textAlign:  'center',
    marginTop:  '2rem',
    fontSize:   '13px',
  } as React.CSSProperties,

  // ── Date separator ──────────────────────────────────────────────────────────
  dateSep: {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    margin:     '6px 0',
  } as React.CSSProperties,

  dateSepLine: {
    flex:            1,
    height:          '1px',
    backgroundColor: '#2a2a2a',
  } as React.CSSProperties,

  dateSepLabel: {
    fontSize:     '10px',
    color:        '#555',
    whiteSpace:   'nowrap',
    padding:      '0 4px',
    letterSpacing: '0.04em',
  } as React.CSSProperties,

  // ── System event chip ────────────────────────────────────────────────────────
  systemChipRow: {
    display:        'flex',
    justifyContent: 'center',
    margin:         '2px 0',
  } as React.CSSProperties,

  systemChip: {
    display:         'inline-flex',
    alignItems:      'center',
    gap:             '8px',
    backgroundColor: '#1a1a1a',
    border:          '1px solid #2a2a2a',
    borderRadius:    '999px',
    padding:         '4px 14px',
    fontSize:        '11px',
    color:           '#6b7280',
    maxWidth:        '90%',
    textAlign:       'center' as const,
  } as React.CSSProperties,

  systemChipTime: {
    fontSize:  '10px',
    color:     '#444',
    flexShrink: 0,
  } as React.CSSProperties,

  // ── Chat bubble ──────────────────────────────────────────────────────────────
  bubble: {
    maxWidth:   '72%',
    padding:    '10px 14px',
    color:      '#f9fafb',
    fontSize:   '13px',
    lineHeight: 1.5,
  } as React.CSSProperties,

  bubbleAuthor: {
    fontSize:      '10px',
    fontWeight:    700,
    opacity:       0.7,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom:  '4px',
  } as React.CSSProperties,

  bubbleText: {
    whiteSpace: 'pre-wrap' as const,
    wordBreak:  'break-word' as const,
  } as React.CSSProperties,

  bubbleFooter: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'flex-end',
    gap:            '6px',
    marginTop:      '5px',
  } as React.CSSProperties,

  bubbleTime: {
    fontSize:  '10px',
    opacity:   0.4,
  } as React.CSSProperties,

  seenBadge: {
    fontSize:  '10px',
    color:     '#34d399',
    fontWeight: 600,
  } as React.CSSProperties,

  unreadBadge: {
    fontSize:  '10px',
    color:     '#6b7280',
  } as React.CSSProperties,

  newDot: {
    marginLeft: 6,
    color:      '#facc15',
    fontWeight: 700,
  } as React.CSSProperties,

  // ── Templates ────────────────────────────────────────────────────────────────
  templatesRow: {
    padding:         '8px 16px 6px',
    backgroundColor: '#111',
    display:         'flex',
    flexWrap:        'wrap' as const,
    gap:             '6px',
    alignItems:      'center',
    borderTop:       '1px solid #2a2a2a',
  } as React.CSSProperties,

  templatesLabel: {
    fontSize:   '10px',
    color:      '#444',
    flexShrink: 0,
    marginRight: '2px',
  } as React.CSSProperties,

  templatePill: {
    padding:         '4px 10px',
    borderRadius:    '999px',
    border:          '1px solid #333',
    backgroundColor: '#1a1a1a',
    color:           '#888',
    fontSize:        '11px',
    cursor:          'pointer',
    whiteSpace:      'nowrap' as const,
    transition:      'border-color 0.15s, color 0.15s',
  } as React.CSSProperties,

  // ── Reply row ────────────────────────────────────────────────────────────────
  replyRow: {
    padding:         '8px 16px 12px',
    backgroundColor: '#111',
    display:         'flex',
    gap:             '10px',
    alignItems:      'flex-end',
  } as React.CSSProperties,

  textarea: {
    flex:            1,
    padding:         '10px 14px',
    borderRadius:    '10px',
    border:          '1px solid #2a2a2a',
    backgroundColor: '#0f0f0f',
    color:           '#f9fafb',
    fontFamily:      'inherit',
    fontSize:        '13px',
    resize:          'none' as const,
    outline:         'none',
    lineHeight:      1.5,
  } as React.CSSProperties,

  sendBtn: {
    padding:      '10px 20px',
    borderRadius: '10px',
    color:        '#fff',
    border:       'none',
    fontWeight:   600,
    fontSize:     '13px',
    flexShrink:   0,
  } as React.CSSProperties,

  errorBar: {
    padding:         '8px 16px',
    backgroundColor: '#7f1d1d',
    color:           '#fca5a5',
    fontSize:        '12px',
  } as React.CSSProperties,
}
