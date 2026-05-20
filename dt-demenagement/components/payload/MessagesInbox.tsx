'use client'

import React, { useEffect, useState, useRef, useTransition } from 'react'

interface MessageDoc {
  id:        number
  auteur:    'client' | 'admin'
  contenu:   string
  createdAt: string
  lu:        boolean
  demenagement: {
    id:            number
    numeroDossier: string
    nomComplet:    string
    statut:        string
    clientId:      string
  } | null
}

interface Conversation {
  dossierId:     number
  numeroDossier: string
  nomComplet:    string
  messages:      MessageDoc[]
  unreadCount:   number
  lastMessage:   MessageDoc
}

export default function MessagesInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected,      setSelected]      = useState<number | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [replyContent,  setReplyContent]  = useState('')
  const [isPending,     startTransition]  = useTransition()
  const [error,         setError]         = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchAll = async () => {
    try {
      const res = await fetch(
        '/api/messages?sort=-createdAt&limit=500&depth=1',
        { credentials: 'include' }
      )
      if (!res.ok) return
      const data = await res.json() as { docs: MessageDoc[] }

      const map = new Map<number, MessageDoc[]>()
      for (const msg of data.docs) {
        if (!msg.demenagement?.id) continue
        const list = map.get(msg.demenagement.id) ?? []
        list.push(msg)
        map.set(msg.demenagement.id, list)
      }

      const convs: Conversation[] = []
      map.forEach((msgs, dossierId) => {
        const sorted  = [...msgs].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        const last    = sorted[sorted.length - 1]!
        const unread  = sorted.filter((m) => m.auteur === 'client' && !m.lu).length
        convs.push({
          dossierId,
          numeroDossier: msgs[0]!.demenagement?.numeroDossier ?? '',
          nomComplet:    msgs[0]!.demenagement?.nomComplet    ?? 'Client',
          messages:      sorted,
          unreadCount:   unread,
          lastMessage:   last,
        })
      })

      convs.sort((a, b) => +new Date(b.lastMessage.createdAt) - +new Date(a.lastMessage.createdAt))
      setConversations(convs)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAll()
    const timer = setInterval(() => void fetchAll(), 10_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected, conversations])

  function handleReply() {
    const trimmed = replyContent.trim()
    if (!trimmed || isPending || !selected) return
    setError('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/message', {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          credentials: 'include',
          body:        JSON.stringify({ dossierId: selected, contenu: trimmed }),
        })
        if (!res.ok) throw new Error()
        const { message } = await res.json() as { message: MessageDoc }
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.dossierId !== selected) return conv
            const newMsg = { ...message, demenagement: conv.messages[0]!.demenagement }
            return {
              ...conv,
              messages:    [...conv.messages, newMsg],
              lastMessage: newMsg,
              unreadCount: 0,
            }
          })
        )
        setReplyContent('')
      } catch {
        setError("Erreur lors de l'envoi. Réessayez.")
      }
    })
  }

  const selectedConv = conversations.find((c) => c.dossierId === selected)
  const totalUnread  = conversations.reduce((s, c) => s + c.unreadCount, 0)

  if (loading) {
    return <div style={s.centerMsg}>Chargement des conversations…</div>
  }

  return (
    <div style={s.root}>

      {/* ── Left panel ─── */}
      <div style={s.leftPanel}>
        <div style={s.leftHeader}>
          <span style={s.leftTitle}>💬 Messages</span>
          {totalUnread > 0 && (
            <span style={s.redBadge}>{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</span>
          )}
        </div>

        <div style={s.convList}>
          {conversations.length === 0 ? (
            <div style={s.emptyMsg}>Aucune conversation</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.dossierId}
                onClick={() => { setSelected(conv.dossierId); setError('') }}
                style={{
                  ...s.convRow,
                  backgroundColor: selected === conv.dossierId ? '#1a1a2e' : 'transparent',
                }}
              >
                <div style={{
                  ...s.avatar,
                  backgroundColor: conv.unreadCount > 0 ? '#b52027' : '#374151',
                }}>
                  {conv.nomComplet.charAt(0).toUpperCase()}
                </div>
                <div style={s.convInfo}>
                  <div style={s.convTop}>
                    <span style={s.convName}>{conv.nomComplet}</span>
                    <span style={s.convTime}>
                      {new Date(conv.lastMessage.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div style={s.convDossier}>#{conv.numeroDossier}</div>
                  <div style={s.convPreviewRow}>
                    <span style={{
                      ...s.convPreview,
                      color:      conv.unreadCount > 0 ? '#ccc' : '#555',
                      fontWeight: conv.unreadCount > 0 ? 600 : 400,
                    }}>
                      {conv.lastMessage.auteur === 'admin' ? '→ ' : ''}{conv.lastMessage.contenu}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={s.redBadgeSmall}>{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel ─── */}
      <div style={s.rightPanel}>
        {!selectedConv ? (
          <div style={s.centerMsg}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>💬</span>
            Sélectionnez une conversation
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={s.threadHeader}>
              <div style={{ ...s.avatar, backgroundColor: '#b52027', width: 36, height: 36, fontSize: '13px' }}>
                {selectedConv.nomComplet.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={s.threadName}>{selectedConv.nomComplet}</div>
                <div style={s.threadSub}>
                  #{selectedConv.numeroDossier}
                  <a
                    href={`/admin/collections/demenagements/${selectedConv.dossierId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={s.dossierLink}
                  >
                    Ouvrir le dossier →
                  </a>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={s.messageList}>
              {selectedConv.messages.map((msg) => {
                const isAdmin = msg.auteur === 'admin'
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      ...s.bubble,
                      backgroundColor: isAdmin ? '#1d4ed8' : '#1f2937',
                      borderRadius:    isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}>
                      <div style={{ ...s.bubbleAuthor, color: isAdmin ? '#93c5fd' : '#9ca3af' }}>
                        {isAdmin ? '👤 Admin' : '🧑 Client'}
                        {!isAdmin && !msg.lu && <span style={s.unreadDot}> ● Non lu</span>}
                      </div>
                      <div style={s.bubbleText}>{msg.contenu}</div>
                      <div style={s.bubbleTime}>
                        {new Date(msg.createdAt).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply */}
            <div style={s.replyRow}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply() }
                }}
                placeholder="Répondre… (Entrée = envoyer, Maj+Entrée = nouvelle ligne)"
                rows={2}
                disabled={isPending}
                style={s.textarea}
              />
              <button
                onClick={handleReply}
                disabled={isPending || !replyContent.trim()}
                style={{
                  ...s.sendBtn,
                  backgroundColor: isPending || !replyContent.trim() ? '#374151' : '#1d4ed8',
                  cursor:          isPending || !replyContent.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {isPending ? '…' : '→ Envoyer'}
              </button>
            </div>

            {error && <div style={s.errorBar}>{error}</div>}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  root: {
    display:         'flex',
    height:          'calc(100vh - 100px)',
    backgroundColor: '#0a0a0a',
    border:          '1px solid #1a1a1a',
    borderRadius:    '12px',
    overflow:        'hidden',
    margin:          '0.75rem',
    minHeight:       '500px',
  } as React.CSSProperties,

  leftPanel: {
    width:           '300px',
    flexShrink:      0,
    borderRight:     '1px solid #1a1a1a',
    display:         'flex',
    flexDirection:   'column',
    backgroundColor: '#0f0f0f',
  } as React.CSSProperties,

  leftHeader: {
    padding:         '14px 16px',
    borderBottom:    '1px solid #1a1a1a',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: '#111',
  } as React.CSSProperties,

  leftTitle: {
    fontSize:   '14px',
    fontWeight: 700,
    color:      '#f8f5f0',
  } as React.CSSProperties,

  convList: {
    flex:      1,
    overflowY: 'auto',
  } as React.CSSProperties,

  convRow: {
    width:          '100%',
    padding:        '12px 14px',
    textAlign:      'left',
    border:         'none',
    borderBottom:   '1px solid #141414',
    cursor:         'pointer',
    display:        'flex',
    gap:            '10px',
    alignItems:     'flex-start',
    transition:     'background-color 0.1s',
  } as React.CSSProperties,

  avatar: {
    width:          '38px',
    height:         '38px',
    borderRadius:   '50%',
    color:          '#fff',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '15px',
    fontWeight:     700,
    flexShrink:     0,
  } as React.CSSProperties,

  convInfo: {
    flex:     1,
    minWidth: 0,
  } as React.CSSProperties,

  convTop: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '2px',
  } as React.CSSProperties,

  convName: {
    fontSize:      '12px',
    fontWeight:    600,
    color:         '#e5e7eb',
    overflow:      'hidden',
    textOverflow:  'ellipsis',
    whiteSpace:    'nowrap',
    maxWidth:      '140px',
  } as React.CSSProperties,

  convTime: {
    fontSize:  '10px',
    color:     '#4b5563',
    flexShrink: 0,
    marginLeft: '4px',
  } as React.CSSProperties,

  convDossier: {
    fontSize: '10px',
    color:    '#4b5563',
    marginBottom: '3px',
  } as React.CSSProperties,

  convPreviewRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    gap:            '6px',
  } as React.CSSProperties,

  convPreview: {
    fontSize:     '11px',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    flex:          1,
  } as React.CSSProperties,

  rightPanel: {
    flex:           1,
    display:        'flex',
    flexDirection:  'column',
    backgroundColor: '#0d0d0d',
    minWidth:       0,
  } as React.CSSProperties,

  threadHeader: {
    padding:         '12px 18px',
    borderBottom:    '1px solid #1a1a1a',
    backgroundColor: '#0f0f0f',
    display:         'flex',
    alignItems:      'center',
    gap:             '12px',
  } as React.CSSProperties,

  threadName: {
    fontSize:   '13px',
    fontWeight: 700,
    color:      '#f8f5f0',
  } as React.CSSProperties,

  threadSub: {
    fontSize: '11px',
    color:    '#4b5563',
  } as React.CSSProperties,

  dossierLink: {
    color:          '#b52027',
    marginLeft:     '8px',
    textDecoration: 'none',
    fontWeight:     600,
  } as React.CSSProperties,

  messageList: {
    flex:          1,
    overflowY:     'auto',
    padding:       '14px 18px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '10px',
  } as React.CSSProperties,

  bubble: {
    maxWidth:   '65%',
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
    padding:         '10px 14px',
    borderTop:       '1px solid #1a1a1a',
    backgroundColor: '#0f0f0f',
    display:         'flex',
    gap:             '10px',
    alignItems:      'flex-end',
  } as React.CSSProperties,

  textarea: {
    flex:            1,
    padding:         '10px 14px',
    borderRadius:    '10px',
    border:          '1px solid #1f2937',
    backgroundColor: '#111',
    color:           '#f9fafb',
    fontFamily:      'inherit',
    fontSize:        '13px',
    resize:          'none' as const,
    outline:         'none',
    lineHeight:      1.5,
  } as React.CSSProperties,

  sendBtn: {
    padding:      '10px 18px',
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

  redBadge: {
    fontSize:        '11px',
    backgroundColor: '#b52027',
    color:           '#fff',
    borderRadius:    '999px',
    padding:         '2px 8px',
    fontWeight:      700,
  } as React.CSSProperties,

  redBadgeSmall: {
    backgroundColor: '#b52027',
    color:           '#fff',
    borderRadius:    '999px',
    padding:         '1px 6px',
    fontSize:        '10px',
    fontWeight:      700,
    flexShrink:      0,
  } as React.CSSProperties,

  centerMsg: {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          '#444',
    fontSize:       '13px',
    flexDirection:  'column',
    textAlign:      'center',
  } as React.CSSProperties,

  emptyMsg: {
    padding:   '2rem',
    textAlign: 'center',
    color:     '#444',
    fontSize:  '13px',
  } as React.CSSProperties,
}
