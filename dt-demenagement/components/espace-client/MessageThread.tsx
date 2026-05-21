'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'

interface Message {
  id: string | number
  auteur: 'client' | 'admin'
  contenu: string
  createdAt: string
  luParClient?: boolean
}

interface MessageThreadLabels {
  placeholder: string
  send: string
  sending: string
  fromAdmin: string
  fromClient: string
  emptyHint: string
}

interface MessageThreadProps {
  messages: Message[]
  dossierId: string
  clientEmail: string
  labels: MessageThreadLabels
}

export function MessageThread({ messages: initialMessages, dossierId, clientEmail, labels }: MessageThreadProps) {
  const [messages,  setMessages]  = useState(initialMessages)
  const [content,   setContent]   = useState('')
  const [error,     setError]     = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark admin messages as read by client on mount
  useEffect(() => {
    void fetch('/api/client/messages/mark-read', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ dossierId: Number(dossierId) }),
    }).catch(() => { /* non-blocking */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossierId])

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || isPending) return
    setError('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/client/message', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ dossierId, contenu: trimmed, clientEmail }),
        })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json() as { message: Message }
        setMessages((prev) => [...prev, data.message])
        setContent('')
      } catch {
        setError('Erreur lors de l\'envoi. Réessayez.')
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Messages */}
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pe-1" role="log" aria-live="polite" aria-label={labels.fromClient}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)]/30" aria-hidden="true" />
            <p className="font-body text-xs text-[var(--color-text-muted)]">{labels.emptyHint}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = msg.auteur === 'client'
            return (
              <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                  isClient
                    ? 'bg-[var(--color-red)] text-white rounded-br-sm'
                    : 'bg-white/[0.06] border border-white/8 text-[var(--color-text-light)] rounded-bl-sm'
                }`}>
                  <p className="text-[10px] opacity-60 mb-1 font-semibold uppercase tracking-wide">
                    {isClient ? labels.fromClient : labels.fromAdmin}
                  </p>
                  <p className="whitespace-pre-wrap break-words">{msg.contenu}</p>
                  <p className="text-[10px] opacity-50 mt-1 text-end">
                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Formulaire envoi */}
      <div className="flex gap-2 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.placeholder}
          disabled={isPending}
          rows={2}
          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent disabled:opacity-50 resize-none transition-all"
          aria-label={labels.placeholder}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !content.trim()}
          aria-label={isPending ? labels.sending : labels.send}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-red)] text-white flex items-center justify-center hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <Send className="w-4 h-4" aria-hidden="true" />
          }
        </button>
      </div>

      {error && (
        <p role="alert" className="font-body text-xs text-[var(--color-red)]">{error}</p>
      )}
    </div>
  )
}
