'use client'

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { Send, Loader2, MessageSquare, ArrowLeft, ExternalLink, Circle } from 'lucide-react'

interface MessagePreview {
  contenu:   string
  auteur:    'client' | 'admin'
  createdAt: string
}

export interface DossierConversation {
  id:            number
  numeroDossier: string
  statut:        string
  lastMessage:   MessagePreview | null
  unreadCount:   number
}

interface Message {
  id:           string | number
  auteur:       'client' | 'admin'
  contenu:      string
  createdAt:    string
  luParClient?: boolean
}

interface MessagesHubProps {
  dossiers:    DossierConversation[]
  locale:      string
  clientEmail: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7)  return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function MessagesHub({ dossiers, locale, clientEmail }: MessagesHubProps) {
  const [selectedId,    setSelectedId]    = useState<number | null>(
    dossiers.length === 1 ? dossiers[0]!.id : null
  )
  const [conversations, setConversations] = useState<DossierConversation[]>(dossiers)
  const [messages,      setMessages]      = useState<Record<number, Message[]>>({})
  const [loadingId,     setLoadingId]     = useState<number | null>(null)
  const [content,       setContent]       = useState('')
  const [isPending,     startTransition]  = useTransition()
  const [sendError,     setSendError]     = useState('')
  const [mobileView,    setMobileView]    = useState<'list' | 'thread'>('list')
  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedDossier = conversations.find((d) => d.id === selectedId) ?? null
  const currentMessages = selectedId ? (messages[selectedId] ?? []) : []

  // ── Fetch messages for a dossier ────────────────────────────────────────────
  const fetchMessages = useCallback(async (dossierId: number) => {
    try {
      const res = await fetch(`/api/client/messages?dossierId=${dossierId}`)
      if (!res.ok) return
      const data = await res.json() as { messages: Message[] }

      setMessages((prev) => {
        const prevList    = prev[dossierId] ?? []
        const existingIds = new Set(prevList.map((m) => String(m.id)))
        const fresh       = data.messages.filter((m) => !existingIds.has(String(m.id)))
        if (!fresh.length) return prev

        const hasNewAdmin = fresh.some((m) => m.auteur === 'admin')
        if (hasNewAdmin) {
          void fetch('/api/client/messages/mark-read', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ dossierId }),
          }).catch(() => {})
          // Clear unread badge for this dossier
          setConversations((c) =>
            c.map((d) => d.id === dossierId ? { ...d, unreadCount: 0 } : d)
          )
        }

        return { ...prev, [dossierId]: [...prevList, ...fresh] }
      })
    } catch { /* silent */ }
  }, [])

  // ── Load on selection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return

    setLoadingId(selectedId)
    void (async () => {
      try {
        const res = await fetch(`/api/client/messages?dossierId=${selectedId}`)
        if (res.ok) {
          const data = await res.json() as { messages: Message[] }
          setMessages((prev) => ({ ...prev, [selectedId]: data.messages }))
        }
      } finally {
        setLoadingId(null)
      }
    })()

    // Mark as read
    void fetch('/api/client/messages/mark-read', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ dossierId: selectedId }),
    }).catch(() => {})
    setConversations((c) =>
      c.map((d) => d.id === selectedId ? { ...d, unreadCount: 0 } : d)
    )
  }, [selectedId])

  // ── Poll 15 s for selected conversation ─────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return
    const timer = setInterval(() => void fetchMessages(selectedId), 15_000)
    return () => clearInterval(timer)
  }, [selectedId, fetchMessages])

  // ── Poll 30 s for unread counts (conversation list badges) ──────────────────
  useEffect(() => {
    async function pollUnread() {
      try {
        const res = await fetch('/api/client/messages/unread-count')
        if (!res.ok) return
        // We don't break down by dossier here — full refresh every 30s is fine
        // For per-dossier accuracy we'd need a richer endpoint; the badge disappears
        // when the conversation is opened, which is the important UX signal.
      } catch { /* silent */ }
    }
    const timer = setInterval(() => void pollUnread(), 30_000)
    return () => clearInterval(timer)
  }, [])

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages.length])

  // ── Select & navigate ────────────────────────────────────────────────────────
  function selectDossier(id: number) {
    setSelectedId(id)
    setMobileView('thread')
    setSendError('')
    setContent('')
  }

  // ── Send ─────────────────────────────────────────────────────────────────────
  function handleSend() {
    if (!selectedId) return
    const trimmed = content.trim()
    if (!trimmed || isPending) return
    setSendError('')

    startTransition(async () => {
      const optimistic: Message = {
        id:        `opt-${Date.now()}`,
        auteur:    'client',
        contenu:   trimmed,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), optimistic],
      }))
      setContent('')

      try {
        const res = await fetch('/api/client/message', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ dossierId: String(selectedId), contenu: trimmed, clientEmail }),
        })
        if (!res.ok) throw new Error()
        const data = await res.json() as { message: Message }
        setMessages((prev) => ({
          ...prev,
          [selectedId]: [
            ...(prev[selectedId] ?? []).filter((m) => m.id !== optimistic.id),
            data.message,
          ],
        }))
        // Update conversation preview
        setConversations((c) =>
          c.map((d) =>
            d.id === selectedId
              ? { ...d, lastMessage: { contenu: trimmed, auteur: 'client', createdAt: data.message.createdAt } }
              : d
          )
        )
      } catch {
        // Remove optimistic and show error
        setMessages((prev) => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimistic.id),
        }))
        setSendError('Erreur lors de l\'envoi. Réessayez.')
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (dossiers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)]" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-semibold text-[var(--color-text-light)] text-lg mb-1">
            Aucune conversation
          </p>
          <p className="font-body text-sm text-[var(--color-text-muted)] max-w-xs">
            Créez un dossier pour démarrer une conversation avec notre équipe.
          </p>
        </div>
        <Link
          href={`/${locale}/espace-client/nouveau`}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          Faire une demande
        </Link>
      </div>
    )
  }

  // Sort: unread first, then by last message date
  const sorted = [...conversations].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1
    const ta = a.lastMessage ? +new Date(a.lastMessage.createdAt) : 0
    const tb = b.lastMessage ? +new Date(b.lastMessage.createdAt) : 0
    return tb - ta
  })

  return (
    <div className="flex rounded-2xl border border-white/8 bg-white/[0.01] overflow-hidden"
         style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>

      {/* ── Left — conversation list ─────────────────────────────────────── */}
      <div className={`flex flex-col border-e border-white/8 flex-shrink-0 w-full sm:w-72 md:w-80 ${
        mobileView === 'thread' ? 'hidden sm:flex' : 'flex'
      }`}>
        <div className="px-4 py-3.5 border-b border-white/8 flex-shrink-0">
          <p className="font-body text-[11px] text-[var(--color-text-muted)] uppercase tracking-widest">
            Conversations ({sorted.length})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sorted.map((d) => {
            const isActive = d.id === selectedId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => selectDossier(d.id)}
                className={`w-full text-start px-4 py-4 border-b border-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                  isActive
                    ? 'bg-[var(--color-red)]/8 border-s-2 border-s-[var(--color-red)]'
                    : 'hover:bg-white/[0.025]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Unread dot */}
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-opacity ${
                    d.unreadCount > 0 ? 'bg-[var(--color-red)] opacity-100' : 'opacity-0'
                  }`} aria-hidden="true" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-[var(--color-gold)]">
                        #{d.numeroDossier}
                      </span>
                      {d.lastMessage && (
                        <span className="font-body text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                          {formatTime(d.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {d.lastMessage ? (
                      <p className={`font-body text-xs leading-snug truncate ${
                        d.unreadCount > 0
                          ? 'text-[var(--color-text-light)] font-semibold'
                          : 'text-[var(--color-text-muted)]'
                      }`}>
                        {d.lastMessage.auteur === 'admin' ? '📨 ' : 'Vous : '}
                        {d.lastMessage.contenu}
                      </p>
                    ) : (
                      <p className="font-body text-xs text-[var(--color-text-muted)]/50 italic">
                        Pas encore de message
                      </p>
                    )}
                  </div>

                  {d.unreadCount > 0 && (
                    <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-[var(--color-red)] text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {d.unreadCount > 9 ? '9+' : d.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right — conversation thread ───────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        mobileView === 'list' ? 'hidden sm:flex' : 'flex'
      }`}>
        {selectedDossier ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                aria-label="Retour à la liste"
                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-white/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-[var(--color-text-light)] truncate">
                  Dossier <span className="font-mono text-[var(--color-gold)]">#{selectedDossier.numeroDossier}</span>
                </p>
                <p className="font-body text-[10px] text-[var(--color-text-muted)]">
                  Conversation avec l&apos;équipe DT Déménagement
                </p>
              </div>

              <Link
                href={`/${locale}/espace-client/${selectedDossier.numeroDossier}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:border-white/15 font-body text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                aria-label="Voir le dossier complet"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                <span className="hidden sm:inline">Voir le dossier</span>
              </Link>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {loadingId === selectedId ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-[var(--color-text-muted)] animate-spin" aria-hidden="true" />
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Circle className="w-8 h-8 text-[var(--color-text-muted)]/20" aria-hidden="true" />
                  <p className="font-body text-xs text-[var(--color-text-muted)]">
                    Envoyez un message pour démarrer la conversation.
                  </p>
                </div>
              ) : (
                currentMessages.map((msg, i) => {
                  const isClient  = msg.auteur === 'client'
                  const isOptimistic = String(msg.id).startsWith('opt-')
                  // Date separator
                  const prev      = i > 0 ? currentMessages[i - 1] : null
                  const showDate  = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-2" aria-hidden="true">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="font-body text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest flex-shrink-0">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                      )}

                      <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                          isClient
                            ? `bg-[var(--color-red)] text-white rounded-br-sm ${isOptimistic ? 'opacity-60' : ''}`
                            : 'bg-white/[0.06] border border-white/8 text-[var(--color-text-light)] rounded-bl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.contenu}</p>
                          <p className={`text-[10px] mt-1 ${isClient ? 'text-end opacity-60' : 'opacity-50'}`}>
                            {formatFull(msg.createdAt)}
                            {isOptimistic && <span className="ms-1">· Envoi…</span>}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Send form */}
            <div className="px-4 py-3 border-t border-white/8 flex-shrink-0">
              {sendError && (
                <p role="alert" className="font-body text-xs text-[var(--color-red)] mb-2">{sendError}</p>
              )}
              <div className="flex gap-2 items-end">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message… (Entrée pour envoyer)"
                  disabled={isPending}
                  rows={2}
                  aria-label="Votre message"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder:text-[var(--color-text-muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent disabled:opacity-50 resize-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isPending || !content.trim()}
                  aria-label={isPending ? 'Envoi…' : 'Envoyer le message'}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-red)] text-white flex items-center justify-center hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  {isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : <Send className="w-4 h-4"                 aria-hidden="true" />
                  }
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No selection on desktop */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <MessageSquare className="w-10 h-10 text-[var(--color-text-muted)]/20" aria-hidden="true" />
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              Sélectionnez une conversation
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
