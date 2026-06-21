'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight, ArrowLeft, X, ClipboardList, Calendar, CheckCircle, Mail } from 'lucide-react'

// ─── Context ──────────────────────────────────────────────────────────────────

interface DevisModalContextValue {
  open:  (opts?: { ville?: string; service?: string }) => void
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
  method?:       string
  telephone?:    string
  email?:        string
  rdvNom?:       string
  rdvPrenom?:    string
  rdvTelephone?: string
  rdvWhatsapp?:  string
  submit?:       string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEL_RE   = /^\+?[0-9\s\-()\s]{8,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

// Extrait le slug de service depuis une URL comme /services/transporteur-en-tunisie
function extractServiceSlug(path: string): string | undefined {
  const m = path.match(/\/services\/([^/?#]+)/)
  return m ? m[1] : undefined
}

// Extrait le nom de ville depuis une URL comme /villes/tunis
function extractVilleSlug(path: string): string | undefined {
  const m = path.match(/\/villes\/([^/?#]+)/)
  return m ? m[1] : undefined
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
  // Devient true dès que l'utilisateur choisit « Devis » ou « Rendez-vous ».
  // Sert à distinguer une vraie fermeture-abandon d'un passage à l'étape suivante.
  const proceededRef = useRef(false)
  // Verrou one-shot : un lead d'abandon n'est envoyé qu'UNE fois par session
  // d'ouverture, pour éviter un doublon close() + pagehide (ex. bfcache mobile).
  const leadSentRef = useRef(false)
  // Page source figée au moment où l'utilisateur atteint l'écran de choix, pour
  // que le lead garde la bonne origine même s'il navigue ensuite (bouton retour).
  const sourceRef = useRef('')
  // Dernier pathname connu — pour détecter une navigation interne (SPA) pendant
  // que le popup est ouvert à l'écran de choix.
  const prevPathRef = useRef('')

  const [isOpen,          setIsOpen]          = useState(false)
  const [screen,          setScreen]          = useState<Screen>('contact')
  const [contact,         setContact]         = useState<ContactData>(CONTACT_INIT)
  const [contactMethod,   setContactMethod]   = useState<{ phone: boolean; email: boolean }>({ phone: false, email: false })
  const [rdv,             setRdv]             = useState<RdvData>(RDV_INIT)
  const [errors,          setErrors]          = useState<FieldErrors>({})
  const [villeContext,    setVilleContext]     = useState<string | undefined>(undefined)
  const [serviceContext,  setServiceContext]   = useState<string | undefined>(undefined)
  const [isPending,       startTransition]    = useTransition()

  // Auto-détection du contexte depuis l'URL courante
  const autoService = useMemo(() => extractServiceSlug(pathname), [pathname])
  const autoVille   = useMemo(() => extractVilleSlug(pathname),   [pathname])

  const open = useCallback((opts?: { ville?: string; service?: string }) => {
    triggerRef.current = document.activeElement as HTMLElement
    proceededRef.current = false
    leadSentRef.current = false
    setScreen('contact')
    setContact(CONTACT_INIT)
    setContactMethod({ phone: false, email: false })
    setRdv(RDV_INIT)
    setErrors({})
    // opts priment sur l'auto-détection URL
    setVilleContext(opts?.ville   ?? autoVille)
    setServiceContext(opts?.service ?? autoService)
    setIsOpen(true)
  }, [autoVille, autoService])

  // Corps JSON du lead d'abandon (partagé entre close(), pagehide et la
  // capture sur navigation interne). `source` vient de sourceRef (page figée).
  const buildLeadBody = useCallback((): string => JSON.stringify({
    nomPrenom:  contact.nomPrenom.trim(),
    telephone:  contact.telephone.trim(),
    email:      contact.email.trim() || undefined,
    source:     sourceRef.current,
    service:    serviceContext,
    ville:      villeContext,
  }), [contact, serviceContext, villeContext])

  const close = useCallback(() => {
    // Capture du lead UNIQUEMENT en cas d'abandon : l'utilisateur a saisi ses
    // infos (écran « choice » atteint = contact validé) puis ferme le popup
    // SANS cliquer ni « Devis » ni « Rendez-vous ». S'il a choisi une option,
    // ce n'est pas un lead → on ne stocke rien. Le verrou leadSentRef évite un
    // doublon avec l'écouteur pagehide.
    if (screen === 'choice' && !proceededRef.current && !leadSentRef.current) {
      leadSentRef.current = true
      fetch('/api/lead-capture', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    buildLeadBody(),
      }).catch(() => { /* erreur silencieuse — ne pas bloquer l'utilisateur */ })
    }
    setIsOpen(false)
    setTimeout(() => triggerRef.current?.focus(), 50)
  }, [screen, buildLeadBody])

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

  // Capture d'abandon même si l'utilisateur ferme l'onglet / quitte le site
  // (et pas seulement le popup) alors qu'il est à l'écran de choix sans avoir
  // choisi. `pagehide` est fiable au déchargement réel (fermeture onglet,
  // navigation externe) et ne se déclenche PAS sur une navigation interne (SPA).
  // On utilise sendBeacon car un fetch classique est annulé au déchargement.
  useEffect(() => {
    if (!isOpen || screen !== 'choice') return
    const onPageHide = () => {
      if (proceededRef.current || leadSentRef.current) return
      leadSentRef.current = true
      navigator.sendBeacon('/api/lead-capture', new Blob([buildLeadBody()], { type: 'application/json' }))
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [isOpen, screen, buildLeadBody])

  // Capture d'abandon sur navigation interne (SPA) — typiquement le bouton
  // « retour » du navigateur — alors que le popup est ouvert à l'écran de choix
  // sans choix effectué. `pagehide` ne couvre pas ce cas (navigation douce).
  useEffect(() => {
    if (!prevPathRef.current) { prevPathRef.current = pathname; return }
    if (prevPathRef.current === pathname) return
    prevPathRef.current = pathname
    if (isOpen && screen === 'choice' && !proceededRef.current && !leadSentRef.current) {
      leadSentRef.current = true
      fetch('/api/lead-capture', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    buildLeadBody(),
      }).catch(() => { /* erreur silencieuse */ })
    }
  }, [pathname, isOpen, screen, buildLeadBody])

  // ── Screen 1 → 2 : validation + enregistrement lead ────────────────────────

  function handleContactContinue() {
    const errs: FieldErrors = {}
    if (!contact.nomPrenom.trim()) errs.nomPrenom = t('errorRequired')
    if (!contactMethod.phone && !contactMethod.email)
      errs.method = t('errorMethod')
    if (contactMethod.phone && !TEL_RE.test(contact.telephone))
      errs.telephone = t('errorTelephone')
    if (contactMethod.email && !EMAIL_RE.test(contact.email))
      errs.email = t('errorEmail')
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    // Fire-and-forget: create client account + send magic link for each chosen channel
    const name = contact.nomPrenom.trim()
    if (contactMethod.phone) void fetch('/api/auth/client-signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, telephone: contact.telephone.trim() }),
    })
    if (contactMethod.email) void fetch('/api/auth/client-signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email: contact.email.trim() }),
    })

    // Pas d'enregistrement de lead ici : le prospect n'est capturé comme lead
    // qu'en cas d'ABANDON à l'écran de choix (voir close()). S'il poursuit vers
    // un devis ou un RDV, ce n'est pas un lead.
    sourceRef.current = pathname   // origine figée pour un éventuel lead d'abandon
    setScreen('choice')
  }

  // ── Screen 2 → /devis ───────────────────────────────────────────────────────

  function handleChoiceDevis() {
    proceededRef.current = true   // choix effectué → pas un lead abandonné
    const { prenom, nom } = splitNomPrenom(contact.nomPrenom)
    const params = new URLSearchParams({ prenom, nom })
    if (contactMethod.phone && contact.telephone) params.set('telephone', contact.telephone)
    if (contactMethod.email && contact.email)     params.set('email',     contact.email)
    if (villeContext)    params.set('ville',    villeContext)
    if (serviceContext)  params.set('service',  serviceContext)
    close()
    router.push(`/devis?${params.toString()}`)
  }

  // ── Screen 2 → 3 ────────────────────────────────────────────────────────────

  function handleChoiceRdv() {
    proceededRef.current = true   // choix effectué → pas un lead abandonné
    const { prenom, nom } = splitNomPrenom(contact.nomPrenom)
    const tel = contactMethod.phone ? contact.telephone : ''
    setRdv((prev) => ({
      ...prev,
      nom,
      prenom,
      telephone: tel,
      whatsapp:  tel,
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
                      {/* Name */}
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

                      {/* Contact method */}
                      <div className="flex flex-col gap-2.5">
                        <p className="font-body text-sm font-medium text-[var(--color-text-light)]">
                          {t('methodLabel')}
                        </p>

                        <div className="grid grid-cols-2 gap-2.5">
                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => {
                              setContactMethod((prev) => ({ ...prev, phone: !prev.phone }))
                              setErrors((p) => ({ ...p, method: undefined, telephone: undefined }))
                            }}
                            aria-pressed={contactMethod.phone}
                            className={[
                              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-start transition-all duration-150',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#128c7e]',
                              contactMethod.phone
                                ? 'border-[#128c7e] bg-[#128c7e]/5'
                                : 'border-[var(--color-border)] hover:border-[#128c7e]/40',
                            ].join(' ')}
                          >
                            <div className={[
                              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150',
                              contactMethod.phone ? 'bg-[#128c7e]' : 'bg-[#128c7e]/10',
                            ].join(' ')}>
                              <svg
                                className={`w-4 h-4 ${contactMethod.phone ? 'text-white' : 'text-[#128c7e]'}`}
                                fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-body font-semibold text-sm leading-none mb-0.5 ${contactMethod.phone ? 'text-[#128c7e]' : 'text-[var(--color-text-light)]'}`}>
                                {t('methodWhatsapp')}
                              </p>
                              <p className="font-body text-xs text-[var(--color-text-muted)] leading-snug">
                                {t('methodWhatsappDesc')}
                              </p>
                            </div>
                            {contactMethod.phone && (
                              <CheckCircle className="w-4 h-4 text-[#128c7e] shrink-0" aria-hidden="true" />
                            )}
                          </button>

                          {/* Email */}
                          <button
                            type="button"
                            onClick={() => {
                              setContactMethod((prev) => ({ ...prev, email: !prev.email }))
                              setErrors((p) => ({ ...p, method: undefined, email: undefined }))
                            }}
                            aria-pressed={contactMethod.email}
                            className={[
                              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-start transition-all duration-150',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-red)]',
                              contactMethod.email
                                ? 'border-[var(--color-red)] bg-[var(--color-red)]/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-red)]/40',
                            ].join(' ')}
                          >
                            <div className={[
                              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150',
                              contactMethod.email ? 'bg-[var(--color-red)]' : 'bg-[var(--color-red)]/10',
                            ].join(' ')}>
                              <Mail className={`w-4 h-4 ${contactMethod.email ? 'text-white' : 'text-[var(--color-red)]'}`} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-body font-semibold text-sm leading-none mb-0.5 ${contactMethod.email ? 'text-[var(--color-red)]' : 'text-[var(--color-text-light)]'}`}>
                                {t('methodEmail')}
                              </p>
                              <p className="font-body text-xs text-[var(--color-text-muted)] leading-snug">
                                {t('methodEmailDesc')}
                              </p>
                            </div>
                            {contactMethod.email && (
                              <CheckCircle className="w-4 h-4 text-[var(--color-red)] shrink-0" aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        {errors.method && (
                          <p className="font-body text-xs text-[var(--color-red)]" role="alert">
                            {errors.method}
                          </p>
                        )}
                      </div>

                      {/* Contact fields — revealed per selection */}
                      {contactMethod.phone && (
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
                      )}
                      {contactMethod.email && (
                        <FieldWrapper label={t('labelEmail')} required error={errors.email}>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                            onBlur={() => {
                              if (!EMAIL_RE.test(contact.email))
                                setErrors((p) => ({ ...p, email: t('errorEmail') }))
                              else
                                setErrors((p) => ({ ...p, email: undefined }))
                            }}
                            placeholder={t('placeholderEmail')}
                            aria-required="true"
                            aria-invalid={!!errors.email}
                            className={inputCls(errors.email)}
                          />
                        </FieldWrapper>
                      )}

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
