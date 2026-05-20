'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

interface Message {
  id:        string | number
  auteur:    'client' | 'admin'
  contenu:   string
  createdAt: string
  lu:        boolean
}

export default function MessageChatField() {
  const { id } = useDocumentInfo()

  const [messages,  setMessages]  = useState<Message[]>([])
  const [content,   setContent]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(true)
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

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
    void fetchMessages()
    const timer = setInterval(() => void fetchMessages(), 10_000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  return (
    <div style={styles.wrapper}>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>💬 Messagerie client</span>
        <span style={styles.headerMeta}>
          {messages.filter(m => !m.lu && m.auteur === 'client').length > 0 && (
            <span style={styles.unreadBadge}>
              {messages.filter(m => !m.lu && m.auteur === 'client').length} non lu(s)
            </span>
          )}
          <span style={{ color: '#555', fontSize: '11px' }}>auto-refresh 10s</span>
        </span>
      </div>

      {/* Messages */}
      <div style={styles.messageList}>
        {loading ? (
          <div style={styles.empty}>Chargement...</div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>Aucun message pour ce dossier.</div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.auteur === 'admin'
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  ...styles.bubble,
                  backgroundColor:  isAdmin ? '#1d4ed8' : '#1f2937',
                  borderRadius:     isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}>
                  <div style={{ ...styles.bubbleAuthor, color: isAdmin ? '#93c5fd' : '#9ca3af' }}>
                    {isAdmin ? '👤 Admin' : '🧑 Client'}
                    {!isAdmin && !msg.lu && <span style={styles.unreadDot}> ● Non lu</span>}
                  </div>
                  <div style={styles.bubbleText}>{msg.contenu}</div>
                  <div style={styles.bubbleTime}>
                    {new Date(msg.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
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

// ─── Inline styles (pas de Tailwind dans les composants Payload admin) ────────

const styles = {
  wrapper: {
    border:        '1px solid #2a2a2a',
    borderRadius:  '12px',
    overflow:      'hidden',
    backgroundColor: '#0f0f0f',
    marginTop:     '8px',
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

  unreadBadge: {
    fontSize:        '11px',
    backgroundColor: '#b52027',
    color:           '#fff',
    borderRadius:    '999px',
    padding:         '2px 8px',
    fontWeight:      700,
  } as React.CSSProperties,

  messageList: {
    height:         '340px',
    overflowY:      'auto',
    padding:        '16px',
    display:        'flex',
    flexDirection:  'column',
    gap:            '10px',
  } as React.CSSProperties,

  empty: {
    color:      '#555',
    textAlign:  'center',
    marginTop:  '2rem',
    fontSize:   '13px',
  } as React.CSSProperties,

  bubble: {
    maxWidth:   '70%',
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
    whiteSpace:  'pre-wrap' as const,
    wordBreak:   'break-word' as const,
  } as React.CSSProperties,

  bubbleTime: {
    fontSize:  '10px',
    opacity:   0.45,
    marginTop: '4px',
    textAlign: 'right' as const,
  } as React.CSSProperties,

  unreadDot: {
    marginLeft: 6,
    color:      '#22c55e',
  } as React.CSSProperties,

  replyRow: {
    padding:         '12px 16px',
    borderTop:       '1px solid #2a2a2a',
    backgroundColor: '#161616',
    display:         'flex',
    gap:             '10px',
    alignItems:      'flex-end',
  } as React.CSSProperties,

  textarea: {
    flex:            1,
    padding:         '10px 14px',
    borderRadius:    '10px',
    border:          '1px solid #2a2a2a',
    backgroundColor: '#111',
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
    transition:   'background-color 0.15s',
  } as React.CSSProperties,

  errorBar: {
    padding:         '8px 16px',
    backgroundColor: '#7f1d1d',
    color:           '#fca5a5',
    fontSize:        '12px',
  } as React.CSSProperties,
}
