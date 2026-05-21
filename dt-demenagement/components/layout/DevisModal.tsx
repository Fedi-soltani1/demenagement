'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight, ArrowLeft, X, ClipboardList, Calendar, CheckCircle } from 'lucide-react'

// ─── Context ──────────────────────────────────────────────────────────────────

interface DevisModalContextValue {
  open: () => void
  close: () => void
}

const DevisModalContext = createContext<DevisModalContextValue | null>(null)

export function useDevisModal(): DevisModalContextValue {
  const ctx = useContext(DevisModalContext)
  if (!ctx) throw new Error('useDevisModal must be used inside DevisModalProvider')
  return ctx
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'contact' | 'choice' | 'rdv' | 'success'

interface ContactData {
  nomPrenom:  string
  telephone:  string
  email:      string
}

interface RdvData {
  type:       'client' | 'entreprise'
  nom:        string
  prenom:     string
  telephone:  string
  whatsapp:   string
  adresse:    string
  dateVisite: string
  heure:      string
}

interface FieldErrors {
  nomPrenom?:    string
  telephone?:    string
  rdvNom?:       string
  rdvPrenom?:    string
  rdvTelephone?: string
  rdvWhatsapp?:  string
  submit?:       string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEL_RE = /^\+?[0-9\s\-()\s]{8,20}$/

const CONTACT_INIT: ContactData = { nomPrenom: '', telephone: '', email: '' }

const RDV_INIT: RdvData = {
  type: 'client', nom: '', prenom: '',
  telephone: '', whatsapp: '',
  adresse: '', dateVisite: '', heure: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitNomPrenom(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { prenom: parts[0] ?? '', nom: '' }
  return { prenom: parts[0] ?? '', nom: parts.slice(1).join(' ') }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-[var(--color-text-light)]">
        {label}
        {required && (
          <span className="text-[var(--color-red)] ms-0.5" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs text-[var(--color-red)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (error?: string) =>
  `w-full rounded-xl border bg-transparent px-4 py-2.5 font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] focus:outline-none transition-colors ${
    error
      ? 'border-[var(--color-red)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-red)]/60'
  }`

function TelInput({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const raw = value.startsWith('+216') ? value.replace(/^\+216\s?/, '') : value
  return (
    <div
      className={`flex rounded-xl border overflow-hidden transition-colors ${
        error
          ? 'border-[var(--color-red)]'
          : 'border-[var(--color-border)] focus-within:border-[var(--color-red)]/60'
      }`}
    >
      <span className="flex items-center px-3 py-2.5 bg-white/[0.04] border-e border-[var(--color-border)] font-mono text-sm text-[var(--color-text-muted)] select-none shrink-0">
        +216
      </span>
      <input
        type="tel"
        value={raw}
        onChange={(e) => onChange('+216 ' + e.target.value)}
        placeholder="52 880 311"
        aria-invalid={!!error}
        className="flex-1 bg-transparent px-3 py-2.5 font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
      />
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DevisModalProvider({ children }: { children: ReactNode }) {
  const t          = useTranslations('DevisModal')
  const router     = useRouter()
  const pathname   = usePathname()
  const dialogRef  = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const [isOpen,    setIsOpen]    = useState(false)
  const [screen,    setScreen]    = useState<Screen>('contact')
  const [contact,   setContact]   = useState<ContactData>(CONTACT_INIT)
  const [rdv,       setRdv]       = useState<RdvData>(RDV_INIT)
  const [errors,    setErrors]    = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  const open = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement
    setScreen('contact')
    setContact(CONTACT_INIT)
    setRdv(RDV_INIT)
    setErrors({})
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => triggerRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  // ── Screen 1 → 2 ────────────────────────────────────────────────────────────

  function handleContactContinue() {
    const errs: FieldErrors = {}
    if (!contact.nomPrenom.trim())       errs.nomPrenom = t('errorRequired')
    if (!TEL_RE.test(contact.telephone)) errs.telephone = t('errorTelephone')
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setScreen('choice')
  }

  // ── Screen 2 → /devis ───────────────────────────────────────────────────────

  function handleChoiceDevis() {
    const { prenom, nom } = splitNomPrenom(contact.nomPrenom)
    const params = new URLSearchParams({ prenom, nom, telephone: contact.telephone })
    if (contact.email) params.set('email', contact.email)
    const locale = pathname.split('/')[1] ?? 'fr'
    close()
    router.push(`/${locale}/devis?${params.toString()}`)
  }

  // ── Screen 2 → 3 ────────────────────────────────────────────────────────────

  function handleChoiceRdv() {
    const { prenom, nom } = splitNomPrenom(contact.nomPrenom)
    setRdv((prev) => ({
      ...prev,
      nom,
      prenom,
      telephone: contact.telephone,
      whatsapp:  contact.telephone,
    }))
    setErrors({})
    setScreen('rdv')
  }

  // ── Screen 3 submit ──────────────────────────────────────────────────────────

  function handleRdvSubmit() {
    const errs: FieldErrors = {}
    if (!rdv.nom.trim())             errs.rdvNom       = t('errorRequired')
    if (!rdv.prenom.trim())          errs.rdvPrenom    = t('errorRequired')
    if (!TEL_RE.test(rdv.telephone)) errs.rdvTelephone = t('errorTelephone')
    if (!TEL_RE.test(rdv.whatsapp))  errs.rdvWhatsapp  = t('errorTelephone')
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    startTransition(async () => {
      try {
        const res = await fetch('/api/rdv', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type:       rdv.type,
            nom:        rdv.nom,
            prenom:     rdv.prenom,
            telephone:  rdv.telephone,
            whatsapp:   rdv.whatsapp,
            email:      contact.email,
            adresse:    rdv.adresse,
            dateVisite: rdv.dateVisite,
            heure:      rdv.heure,
          }),
        })
        if (!res.ok) throw new Error('server')
        setScreen('success')
      } catch {
        setErrors({ submit: t('errorSubmit') })
      }
    })
  }

  // ── Header title per screen ──────────────────────────────────────────────────

  const titles: Record<Screen, string> = {
    contact: t('step1Title'),
    choice:  t('choiceTitle'),
    rdv:     t('rdvTitle'),
    success: t('successTitle'),
  }

  const maxW = screen === 'rdv' ? 'sm:max-w-xl' : 'sm:max-w-lg'

  return (
    <DevisModalContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9980] bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="devis-modal-title"
            tabIndex={-1}
            className={`fixed inset-x-4 top-1/2 -translate-y-1/2 z-[9981] sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2 sm:w-full ${maxW} focus-visible:outline-none`}
          >
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--color-border)] shrink-0">
                {(screen === 'choice' || screen === 'rdv') && (
                  <button
                    type="button"
                    onClick={() => setScreen(screen === 'rdv' ? 'choice' : 'contact')}
                    aria-label={t('back')}
                    className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                <h2
                  id="devis-modal-title"
                  className="flex-1 font-heading text-lg font-semibold text-[var(--color-text-light)]"
                >
                  {titles[screen]}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t('close')}
                  className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  <X className="w-[18px] h-[18px]" aria-hidden="true" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence mode="wait" initial={false}>

                  {/* Screen 1: Contact */}
                  {screen === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="px-6 py-6 flex flex-col gap-5"
                    >
                      <p className="font-body text-sm text-[var(--color-text-muted)]">
                        {t('step1Subtitle')}
                      </p>

                      <FieldWrapper label={t('labelNomPrenom')} required error={errors.nomPrenom}>
                        <input
                          type="text"
                          value={contact.nomPrenom}
                          onChange={(e) => setContact((p) => ({ ...p, nomPrenom: e.target.value }))}
                          onBlur={() => {
                            if (!contact.nomPrenom.trim())
                              setErrors((p) => ({ ...p, nomPrenom: t('errorRequired') }))
                            else
                              setErrors((p) => ({ ...p, nomPrenom: undefined }))
                          }}
                          placeholder={t('placeholderNomPrenom')}
                          aria-required="true"
                          aria-invalid={!!errors.nomPrenom}
                          className={inputCls(errors.nomPrenom)}
                        />
                      </FieldWrapper>

                      <FieldWrapper label={t('labelTelephone')} required error={errors.telephone}>
                        <input
                          type="tel"
                          value={contact.telephone}
                          onChange={(e) => setContact((p) => ({ ...p, telephone: e.target.value }))}
                          onBlur={() => {
                            if (!TEL_RE.test(contact.telephone))
                              setErrors((p) => ({ ...p, telephone: t('errorTelephone') }))
                            else
                              setErrors((p) => ({ ...p, telephone: undefined }))
                          }}
                          placeholder={t('placeholderTelephone')}
                          aria-required="true"
                          aria-invalid={!!errors.telephone}
                          className={inputCls(errors.telephone)}
                        />
                      </FieldWrapper>

                      <FieldWrapper label={t('labelEmail')}>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                          placeholder={t('placeholderEmail')}
                          className={inputCls()}
                        />
                      </FieldWrapper>

                      <button
                        type="button"
                        onClick={handleContactContinue}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
                      >
                        {t('continue')}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </motion.div>
                  )}

                  {/* Screen 2: Choice */}
                  {screen === 'choice' && (
                    <motion.div
                      key="choice"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="px-6 py-6 flex flex-col gap-4"
                    >
                      {(
                        [
                          {
                            icon: <ClipboardList className="w-6 h-6 text-[var(--color-red)] shrink-0 mt-0.5" aria-hidden="true" />,
                            label: t('choiceDevisLabel'),
                            desc:  t('choiceDevisDesc'),
                            onClick: handleChoiceDevis,
                          },
                          {
                            icon: <Calendar className="w-6 h-6 text-[var(--color-red)] shrink-0 mt-0.5" aria-hidden="true" />,
                            label: t('choiceRdvLabel'),
                            desc:  t('choiceRdvDesc'),
                            onClick: handleChoiceRdv,
                          },
                        ] as const
                      ).map(({ icon, label, desc, onClick }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={onClick}
                          className="group flex items-start gap-4 p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-red)] hover:bg-[var(--color-red)]/5 transition-all duration-200 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                        >
                          {icon}
                          <div className="flex-1 min-w-0">
                            <p className="font-body font-semibold text-sm text-[var(--color-text-light)] mb-1 leading-snug">
                              {label}
                            </p>
                            <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
                              {desc}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-red)] shrink-0 mt-1 transition-colors" aria-hidden="true" />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Screen 3: RDV Form */}
                  {screen === 'rdv' && (
                    <motion.div
                      key="rdv"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="px-6 py-6 flex flex-col gap-4"
                    >
                      <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {t('rdvSubtitle')}
                      </p>
                      <p className="font-body text-xs text-[var(--color-gold)] border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 rounded-lg px-3 py-2">
                        {t('rdvContact')}
                      </p>

                      <FieldWrapper label={t('labelType')} required>
                        <select
                          value={rdv.type}
                          onChange={(e) => setRdv((p) => ({ ...p, type: e.target.value as RdvData['type'] }))}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2.5 font-body text-sm text-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-red)]/60 transition-colors"
                        >
                          <option value="client">{t('typeClient')}</option>
                          <option value="entreprise">{t('typeEntreprise')}</option>
                        </select>
                      </FieldWrapper>

                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label={t('labelNom')} required error={errors.rdvNom}>
                          <input
                            type="text"
                            value={rdv.nom}
                            onChange={(e) => setRdv((p) => ({ ...p, nom: e.target.value }))}
                            placeholder="Ben Ali"
                            aria-required="true"
                            aria-invalid={!!errors.rdvNom}
                            className={inputCls(errors.rdvNom)}
                          />
                        </FieldWrapper>
                        <FieldWrapper label={t('labelPrenom')} required error={errors.rdvPrenom}>
                          <input
                            type="text"
                            value={rdv.prenom}
                            onChange={(e) => setRdv((p) => ({ ...p, prenom: e.target.value }))}
                            placeholder="Ahmed"
                            aria-required="true"
                            aria-invalid={!!errors.rdvPrenom}
                            className={inputCls(errors.rdvPrenom)}
                          />
                        </FieldWrapper>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label={t('labelTelRdv')} required error={errors.rdvTelephone}>
                          <TelInput
                            value={rdv.telephone}
                            onChange={(v) => setRdv((p) => ({ ...p, telephone: v }))}
                            error={errors.rdvTelephone}
                          />
                        </FieldWrapper>
                        <FieldWrapper label={t('labelWhatsapp')} required error={errors.rdvWhatsapp}>
                          <TelInput
                            value={rdv.whatsapp}
                            onChange={(v) => setRdv((p) => ({ ...p, whatsapp: v }))}
                            error={errors.rdvWhatsapp}
                          />
                        </FieldWrapper>
                      </div>

                      <FieldWrapper label={t('labelAdresse')}>
                        <input
                          type="text"
                          value={rdv.adresse}
                          onChange={(e) => setRdv((p) => ({ ...p, adresse: e.target.value }))}
                          placeholder={t('placeholderAdresse')}
                          className={inputCls()}
                        />
                      </FieldWrapper>

                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label={t('labelDate')}>
                          <input
                            type="date"
                            value={rdv.dateVisite}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setRdv((p) => ({ ...p, dateVisite: e.target.value }))}
                            className={inputCls()}
                          />
                        </FieldWrapper>
                        <FieldWrapper label={t('labelHeure')}>
                          <input
                            type="time"
                            value={rdv.heure}
                            min="08:00"
                            max="18:00"
                            step="1800"
                            onChange={(e) => setRdv((p) => ({ ...p, heure: e.target.value }))}
                            className={inputCls()}
                          />
                        </FieldWrapper>
                      </div>

                      {errors.submit && (
                        <p className="font-body text-xs text-[var(--color-red)] text-center" role="alert">
                          {errors.submit}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleRdvSubmit}
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)] mt-1"
                      >
                        {isPending ? t('submitting') : t('submit')}
                      </button>
                    </motion.div>
                  )}

                  {/* Screen 4: Success */}
                  {screen === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      className="px-6 py-12 flex flex-col items-center gap-5 text-center"
                    >
                      <CheckCircle className="w-14 h-14 text-emerald-500" aria-hidden="true" />
                      <div>
                        <h3 className="font-heading text-xl font-bold text-[var(--color-text-light)] mb-2">
                          {t('successTitle')}
                        </h3>
                        <p className="font-body text-sm text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
                          {t('successMessage')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={close}
                        className="px-8 py-3 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                      >
                        {t('successClose')}
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </>
      )}
    </DevisModalContext.Provider>
  )
}
