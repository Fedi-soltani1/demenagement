'use client'

import React, { useState, memo } from 'react'
import { SectionWrapper } from '@/components/blocks/SectionWrapper'
import type { SectionOptions } from '@/lib/sectionOptions'

interface FormulaireBlockProps {
  titre?:          string | null
  sousTitre?:      string | null
  texteBouton?:    string | null
  sectionOptions?: SectionOptions | null
}

type Statut = 'idle' | 'loading' | 'success' | 'error'

const inputBase =
  'w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-4 py-3 ' +
  'font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] ' +
  'focus:outline-none focus:border-[var(--color-red)] focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ' +
  'transition-colors duration-200'

const labelBase = 'block mb-2 font-body text-sm font-medium text-[var(--color-text-light)] text-start'

export const FormulaireBlock = memo(function FormulaireBlock({
  titre,
  sousTitre,
  texteBouton,
  sectionOptions,
}: FormulaireBlockProps) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [statut, setStatut] = useState<Statut>('idle')

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (statut === 'loading') return
    setStatut('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, telephone, email, message, website }),
      })
      if (res.ok) {
        setStatut('success')
        setNom('')
        setTelephone('')
        setEmail('')
        setMessage('')
      } else {
        setStatut('error')
      }
    } catch {
      setStatut('error')
    }
  }

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="normal" defaultLargeur="etroit">
      {(titre || sousTitre) && (
        <header className="mb-8 text-center">
          {titre && (
            <h2 className="font-heading font-bold text-[var(--color-text-light)] text-3xl md:text-4xl mb-3">
              {titre}
            </h2>
          )}
          {sousTitre && (
            <p className="font-body text-[var(--color-text-muted)] leading-relaxed">
              {sousTitre}
            </p>
          )}
        </header>
      )}

      {statut === 'success' ? (
        <p
          role="status"
          className="font-body text-center rounded-lg px-4 py-4 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.4)] text-[#22c55e]"
        >
          Merci ! Nous vous recontactons sous 24h.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Honeypot — invisible pour les humains, piège à bots */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute w-px h-px -m-px overflow-hidden p-0 border-0"
            style={{ clip: 'rect(0 0 0 0)' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div>
            <label htmlFor="contact-nom" className={labelBase}>
              Nom <span className="text-[var(--color-red)]" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              autoComplete="name"
              aria-required="true"
              className={inputBase}
            />
          </div>

          <div>
            <label htmlFor="contact-tel" className={labelBase}>
              Téléphone <span className="text-[var(--color-red)]" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-tel"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
              autoComplete="tel"
              aria-required="true"
              className={inputBase}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className={labelBase}>
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputBase}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className={labelBase}>
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`${inputBase} resize-y`}
            />
          </div>

          {statut === 'error' && (
            <p
              role="alert"
              className="font-body text-sm rounded-lg px-4 py-3 bg-[rgba(185,32,39,0.12)] border border-[rgba(185,32,39,0.4)] text-[var(--color-red-light)]"
            >
              Une erreur est survenue, réessayez.
            </p>
          )}

          <button
            type="submit"
            disabled={statut === 'loading'}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-[var(--color-red-dark)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]"
          >
            {statut === 'loading' ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                Envoi…
              </>
            ) : (
              texteBouton ?? 'Envoyer'
            )}
          </button>
        </form>
      )}
    </SectionWrapper>
  )
})
