'use client'

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { Send, Loader2, MessageSquare, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import type { ConversationStat } from '@/app/api/client/conversations/route'

interface Message {
  id:           string | number
  auteur:       'client' | 'admin'
  contenu:      string
  createdAt:    string
  luParClient?: boolean
  _status?:     'sending' | 'error'
}

interface MessagesHubProps {
  dossiers:    ConversationStat[]
  locale:      string
  clientEmail: string
}

function formatTime(iso: string) {
  const d       = new Date(iso)
  const now     = new Date()
  const diffMs  = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffDay = Math.floor(diffMs / 86_400_000)
  if (diffMin < 1)  return 'À l\'instant'
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffDay === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diffDay === 1) return 'Hier'
  if (diffDay < 7)  return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function MessagesHub({ dossiers: initialDossiers, locale, clientEmail }: MessagesHubProps) {
  const [conversations, setConversations] = useState<ConversationStat[]>(initialDossiers)
  const [selectedId,    setSelectedId]    = useState<number | null>(
    initialDossiers.length === 1 ? initialDossiers[0]!.dossierId : null
  )
  const [messages,   setMessages]   = useState<Record<number, Message[]>>({})
  const [loadingId,  setLoadingId]  = useState<number | null>(null)
  const [content,    setContent]    = useState('')
  const [isPending,  startTransition] = useTransition()
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list')
  const bottomRef     = useRef<HTMLDivElement>(null)
  const scrollRef     = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const prevMsgCount  = useRef(0)

  const selectedConv = conversations.find((d) => d.dossierId === selectedId) ?? null
  const currentMsgs  = selectedId ? (messages[selectedId] ?? []) : []

  // ── Poll ALL conversations every 15 s (drives left-panel badges + previews) ─
  const pollConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/client/conversations')
      if (!res.ok) return
      const data = await res.json() as { conversations: ConversationStat[] }

      setConversations((prev) => {
        // Merge: keep local unreadCount=0 for the currently open conversation
        // (user is actively reading it), update everything else from server
        return data.conversations.map((fresh) => {
          if (fresh.dossierId === selectedId) {
            // User is looking at this one — keep unread cleared locally
            return { ...fresh, unreadCount: 0 }
          }
          return fresh
        })
      })
    } catch { /* silent */ }
  }, [selectedId])

  useEffect(() => {
    // Initial poll on mount, then every 15 s
    void pollConversations()
    const timer = setInterval(() => void pollConversations(), 15_000)
    return () => clearInterval(timer)
  }, [pollConversations])

  // ── Poll selected conversation messages every 10 s ────────────────────────
  const pollMessages = useCallback(async (dossierId: number) => {
    try {
      const res = await fetch(`/api/client/messages?dossierId=${dossierId}`)
      if (!res.ok) return
      const data = await res.json() as { messages: Message[] }
      if (!data.messages?.length) return

      setMessages((prev) => {
        const prevList    = prev[dossierId] ?? []
        const existingIds = new Set(prevList.map((m) => String(m.id)))
        const fresh       = data.messages.filter((m) => !existingIds.has(String(m.id)))
        if (!fresh.length) return prev

        // Auto mark-read for new admin messages that just appeared
        const hasNewAdmin = fresh.some((m) => m.auteur === 'admin')
        if (hasNewAdmin) {
          void fetch('/api/client/messages/mark-read', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ dossierId }),
          }).catch(() => {})
        }

        return { ...prev, [dossierId]: data.messages }
      })
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const timer = setInterval(() => void pollMessages(selectedId), 10_000)
    return () => clearInterval(timer)
  }, [selectedId, pollMessages])

  // ── Load messages on first selection ─────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return
    if (messages[selectedId]) return  // already loaded

    setLoadingId(selectedId)
    void fetch(`/api/client/messages?dossierId=${selectedId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { messages: Message[] } | null) => {
        if (data?.messages) {
          setMessages((prev) => ({ ...prev, [selectedId]: data.messages }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingId(null))
  }, [selectedId, messages])

  // ── Mark as read when a conversation is opened ───────────────────────────
  useEffect(() => {
    if (!selectedId) return
    void fetch('/api/client/messages/mark-read', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ dossierId: selectedId }),
    }).catch(() => {})
    // Optimistically clear badge in UI
    setConversations((c) =>
      c.map((d) => d.dossierId === selectedId ? { ...d, unreadCount: 0 } : d)
    )
  }, [selectedId])

  // ── Smart scroll: only if new messages arrived while user was at bottom ─
  const handleThreadScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }, [])

  useEffect(() => {
    if (currentMsgs.length > prevMsgCount.current && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMsgCount.current = currentMsgs.length
  }, [currentMsgs.length])

  // ── Select conversation ─────────────────────────────────────────────────
  function selectConv(dossierId: number) {
    setSelectedId(dossierId)
    setMobileView('thread')
    setContent('')
  }

  // ── Send message ────────────────────────────────────────────────────────
  function handleSend() {
    if (!selectedId) return
    const trimmed = content.trim()
    if (!trimmed || isPending) return

    startTransition(async () => {
      const optimisticId = `opt-${Date.now()}`
      const optimistic: Message = {
        id:        optimisticId,
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

        // Replace optimistic with confirmed message
        setMessages((prev) => ({
          ...prev,
          [selectedId]: [
            ...(prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
            data.message,
          ],
        }))

        // Update conversation preview in left panel
        setConversations((c) =>
          c.map((d) =>
            d.dossierId === selectedId
              ? { ...d, lastMessage: { contenu: trimmed, auteur: 'client', createdAt: data.message.createdAt } }
              : d
          )
        )
      } catch {
        // Mark optimistic message as failed — user can retry from the badge
        setMessages((prev) => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).map((m) =>
            m.id === optimisticId ? { ...m, _status: 'error' as const } : m
          ),
        }))
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Retry a failed optimistic message ───────────────────────────────────
  function retryMessage(failedMsg: Message) {
    if (!selectedId) return
    const trimmed = failedMsg.contenu.trim()
    if (!trimmed) return

    // Remove the failed message first, then re-send
    setMessages((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== failedMsg.id),
    }))

    startTransition(async () => {
      const optimisticId = `opt-${Date.now()}`
      const optimistic: Message = {
        id:        optimisticId,
        auteur:    'client',
        contenu:   trimmed,
        createdAt: new Date().toISOString(),
        _status:   'sending',
      }
      setMessages((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), optimistic],
      }))
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
            ...(prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
            data.message,
          ],
        }))
      } catch {
        setMessages((prev) => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).map((m) =>
            m.id === optimisticId ? { ...m, _status: 'error' as const } : m
          ),
        }))
      }
    })
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (initialDossiers.length === 0) {
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

  const totalUnread = conversations.reduce((n, d) => n + d.unreadCount, 0)

  return (
    <div
      className="flex rounded-2xl border border-white/8 bg-white/[0.01] overflow-hidden"
      style={{ height: 'calc(100vh - 220px)', minHeight: '520px' }}
    >
      {/* ── Left — conversation list ─────────────────────────────────── */}
      <div className={`flex flex-col border-e border-white/8 flex-shrink-0 w-full sm:w-72 md:w-80 ${
        mobileView === 'thread' ? 'hidden sm:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/8 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-body text-[11px] text-[var(--color-text-muted)] uppercase tracking-widest">
              Conversations
            </p>
            {totalUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-red)] text-white font-body text-[10px] font-bold flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => void pollConversations()}
            aria-label="Actualiser"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded-md p-1"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const isActive = conv.dossierId === selectedId
            return (
              <button
                key={conv.dossierId}
                type="button"
                onClick={() => selectConv(conv.dossierId)}
                className={`w-full text-start px-4 py-4 border-b border-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                  isActive
                    ? 'bg-[var(--color-red)]/8 border-s-2 border-s-[var(--color-red)]'
                    : 'hover:bg-white/[0.025]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Unread dot */}
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                      conv.unreadCount > 0 ? 'bg-[var(--color-red)] scale-100' : 'scale-0'
                    }`}
                    aria-hidden="true"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-[var(--color-gold)]">
                        #{conv.numeroDossier}
                      </span>
                      {conv.lastMessage && (
                        <span className="font-body text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {conv.lastMessage ? (
                      <p className={`font-body text-xs leading-snug truncate ${
                        conv.unreadCount > 0
                          ? 'text-[var(--color-text-light)] font-semibold'
                          : 'text-[var(--color-text-muted)]'
                      }`}>
                        {conv.lastMessage.auteur === 'admin' ? '📨 ' : 'Vous : '}
                        {conv.lastMessage.contenu}
                      </p>
                    ) : (
                      <p className="font-body text-xs text-[var(--color-text-muted)]/50 italic">
                        Pas encore de message
                      </p>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-[var(--color-red)] text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right — conversation thread ───────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        mobileView === 'list' ? 'hidden sm:flex' : 'flex'
      }`}>
        {selectedConv ? (
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
                <p className="font-body text-sm font-semibold text-[var(--color-text-light)]">
                  Dossier{' '}
                  <span className="font-mono text-[var(--color-gold)]">
                    #{selectedConv.numeroDossier}
                  </span>
                </p>
                <p className="font-body text-[10px] text-[var(--color-text-muted)]">
                  Actualisation automatique toutes les 10 s
                </p>
              </div>

              <Link
                href={`/${locale}/espace-client/${selectedConv.numeroDossier}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:border-white/15 font-body text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                aria-label="Voir le dossier complet"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                <span className="hidden sm:inline">Voir dossier</span>
              </Link>
            </div>

            {/* Messages list */}
            <div
              ref={scrollRef}
              onScroll={handleThreadScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {loadingId === selectedId ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-[var(--color-text-muted)] animate-spin" aria-hidden="true" />
                </div>
              ) : currentMsgs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)]/20" aria-hidden="true" />
                  <p className="font-body text-xs text-[var(--color-text-muted)]">
                    Envoyez un message pour démarrer la conversation.
                  </p>
                </div>
              ) : (
                currentMsgs.map((msg, i) => {
                  const isClient     = msg.auteur === 'client'
                  const isSending    = msg._status === 'sending'
                  const isFailed     = msg._status === 'error'
                  const prev         = i > 0 ? currentMsgs[i - 1] : null
                  const showDate     =
                    !prev ||
                    new Date(msg.createdAt).toDateString() !==
                    new Date(prev.createdAt).toDateString()

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-2" aria-hidden="true">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="font-body text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest flex-shrink-0">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long',
                            })}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                      )}

                      <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[75%]">
                          <div
                            className={`px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                              isClient
                                ? `bg-[var(--color-red)] text-white rounded-br-sm ${isSending ? 'opacity-60' : ''} ${isFailed ? 'opacity-50 border border-red-400/50' : ''}`
                                : 'bg-white/[0.06] border border-white/8 text-[var(--color-text-light)] rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.contenu}</p>
                            <p className={`text-[10px] mt-1 ${isClient ? 'text-end opacity-60' : 'opacity-50'}`}>
                              {isSending ? 'Envoi…' : formatFull(msg.createdAt)}
                            </p>
                          </div>
                          {isFailed && (
                            <button
                              type="button"
                              onClick={() => retryMessage(msg)}
                              className="mt-1 flex items-center gap-1 font-body text-[10px] text-red-400 hover:text-red-300 transition-colors float-end"
                            >
                              ❌ Échec — Réessayer
                            </button>
                          )}
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
                  aria-label={isPending ? 'Envoi…' : 'Envoyer'}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-red)] text-white flex items-center justify-center hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  {isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : <Send    className="w-4 h-4"               aria-hidden="true" />
                  }
                </button>
              </div>
            </div>
          </>
        ) : (
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
