'use client'

import React, { useState, useTransition, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, CheckCircle,
  MapPin, User, Package, Camera, ClipboardList, Home,
  Truck, Building2, ArrowUpDown, Archive, PackageOpen, Wrench,
  RotateCcw,
} from 'lucide-react'
import { StepPhotos } from './steps/StepPhotos'
import { StepRecapitulatif } from './steps/StepRecapitulatif'
import type { UploadedPhoto } from './PhotoUploadZone'

// ── Data ──────────────────────────────────────────────────────────────────────

const SERVICES = [
  { value: 'transporteur-en-tunisie', label: 'Transporteur en Tunisie', icon: Truck },
  { value: 'transfert-entreprises',   label: 'Transfert Entreprises',   icon: Building2 },
  { value: 'location-monte-meubles',  label: 'Location Monte-Meubles',  icon: ArrowUpDown },
  { value: 'gardes-meubles',          label: 'Gardes Meubles',          icon: Archive },
  { value: 'services-emballage',      label: 'Services Emballage',      icon: PackageOpen },
  { value: 'montage-demontage',       label: 'Montage / Démontage',     icon: Wrench },
]

const ETAGES = [
  { value: 'RDC', short: 'RDC', long: 'Rez-de-chaussée' },
  { value: '1',   short: '1er', long: '1er étage' },
  { value: '2',   short: '2ème', long: '2ème étage' },
  { value: '3',   short: '3ème', long: '3ème étage' },
  { value: '4',   short: '4ème', long: '4ème étage' },
  { value: '5+',  short: '5+',  long: '5ème et +' },
]

const STEP_META = [
  { Icon: User,          title: 'Vos coordonnées',    subtitle: 'Pour recevoir votre confirmation et numéro de dossier' },
  { Icon: MapPin,        title: 'Adresse de départ',  subtitle: "D'où partiront vos affaires ?" },
  { Icon: Home,          title: "Adresse d'arrivée",  subtitle: 'La destination finale de votre déménagement' },
  { Icon: Package,       title: 'Vos besoins',        subtitle: 'Sélectionnez les services qui correspondent à votre projet' },
  { Icon: Camera,        title: 'Photos (optionnel)', subtitle: 'Des photos nous évitent une visite et accélèrent votre devis' },
  { Icon: ClipboardList, title: 'Tout est correct ?', subtitle: 'Vérifiez vos informations avant d\'envoyer' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type TypeDevis = 'particulier' | 'entreprise'

interface FormData {
  prenom: string; nom: string; email: string; telephone: string
  departAdresse: string; departVille: string; departEtage: string; departAscenseur: boolean
  arriveeAdresse: string; arriveeVille: string; arriveeEtage: string; arriveeAscenseur: boolean
  services: string[]; dateSouhaitee: string; volumeEstime: string; commentaire: string
  photosDepart:  UploadedPhoto[]
  photosArrivee: UploadedPhoto[]
  photosMeubles: UploadedPhoto[]
}

interface FieldErrors {
  prenom?: string; nom?: string; email?: string; telephone?: string
  departAdresse?: string; departVille?: string
  arriveeAdresse?: string; arriveeVille?: string
  services?: string
}

// ── LocalStorage draft ────────────────────────────────────────────────────────

const DRAFT_KEY    = 'dt-devis-draft'
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

function saveDraft(step: number, form: FormData) {
  try {
    const { photosDepart: _a, photosArrivee: _b, photosMeubles: _c, ...rest } = form
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form: rest, savedAt: Date.now() }))
  } catch { /* blocked */ }
}

function loadDraft(): { step: number; form: Partial<FormData> } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { step: number; form: Partial<FormData>; savedAt: number }
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) { localStorage.removeItem(DRAFT_KEY); return null }
    return { step: parsed.step, form: parsed.form }
  } catch { return null }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* noop */ }
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateField(field: keyof FieldErrors, value: string | string[]): string {
  switch (field) {
    case 'prenom':         return (value as string).trim().length >= 2 ? '' : 'Au moins 2 caractères'
    case 'nom':            return (value as string).trim().length >= 2 ? '' : 'Au moins 2 caractères'
    case 'email':          return (value as string).trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string) ? '' : 'Email invalide'
    case 'telephone':      return /^\+?[0-9\s\-()\s]{8,20}$/.test(value as string) ? '' : 'Ex : +216 52 XXX XXX'
    case 'departAdresse':  return (value as string).trim().length >= 3 ? '' : 'Adresse trop courte'
    case 'departVille':    return (value as string).trim().length >= 2 ? '' : 'Ville requise'
    case 'arriveeAdresse': return (value as string).trim().length >= 3 ? '' : 'Adresse trop courte'
    case 'arriveeVille':   return (value as string).trim().length >= 2 ? '' : 'Ville requise'
    case 'services':       return (value as string[]).length > 0 ? '' : 'Choisissez au moins un service'
    default:               return ''
  }
}

// ── Animation ─────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  prenom: '', nom: '', email: '', telephone: '',
  departAdresse: '', departVille: '', departEtage: 'RDC', departAscenseur: false,
  arriveeAdresse: '', arriveeVille: '', arriveeEtage: 'RDC', arriveeAscenseur: false,
  services: [], dateSouhaitee: '', volumeEstime: '', commentaire: '',
  photosDepart: [], photosArrivee: [], photosMeubles: [],
}

const stepVariants = {
  enter:  (dir: number) => ({ x: dir >= 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir >= 0 ? -48 : 48, opacity: 0 }),
}

// ── Main component ────────────────────────────────────────────────────────────

interface InitialContact {
  prenom?:      string
  nom?:         string
  telephone?:   string
  email?:       string
  departVille?: string
}

export function DevisForm({
  type,
  locale,
  initialContact,
}: {
  type:            TypeDevis
  locale:          string
  initialContact?: InitialContact
}) {
  const [step,       setStep]       = useState(0)
  const [direction,  setDirection]  = useState(1)
  const [form, setForm] = useState<FormData>(() => ({
    ...INITIAL,
    prenom:       initialContact?.prenom      ?? '',
    nom:          initialContact?.nom         ?? '',
    telephone:    initialContact?.telephone   ?? '',
    email:        initialContact?.email       ?? '',
    departVille:  initialContact?.departVille ?? '',
  }))
  const [fieldErrs,  setFieldErrs]  = useState<FieldErrors>({})
  const [success,    setSuccess]    = useState(false)
  const [dossier,    setDossier]    = useState('')
  const [error,      setError]      = useState('')
  const [showResume, setShowResume] = useState(false)
  const [isPending,  startTransition] = useTransition()

  useEffect(() => {
    const draft = loadDraft()
    if (draft?.form?.prenom || draft?.form?.email) setShowResume(true)
  }, [])

  function resumeDraft() {
    const draft = loadDraft()
    if (!draft) return
    setForm((prev) => ({ ...prev, ...draft.form }))
    setStep(Math.min(draft.step, 3))
    setShowResume(false)
  }

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleBlur(field: keyof FieldErrors, value: string | string[]) {
    setFieldErrs((prev) => ({ ...prev, [field]: validateField(field, value) }))
  }

  function toggleService(val: string) {
    const next = form.services.includes(val)
      ? form.services.filter((s) => s !== val)
      : [...form.services, val]
    setForm((prev) => ({ ...prev, services: next }))
    setFieldErrs((prev) => ({ ...prev, services: next.length > 0 ? '' : 'Choisissez au moins un service' }))
  }

  function isStepValid(): boolean {
    if (step === 0) return !!(form.prenom.trim() && form.nom.trim() && form.telephone.trim())
    if (step === 1) return !!(form.departAdresse.trim() && form.departVille.trim())
    if (step === 2) return !!(form.arriveeAdresse.trim() && form.arriveeVille.trim())
    if (step === 3) return form.services.length > 0
    return true
  }

  const STEPS = STEP_META // 6 items — drives stepper + progress

  function advanceStep() {
    if (step < STEPS.length - 1) {
      setDirection(1)
      const next = step + 1
      setStep(next)
      saveDraft(next, form)
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const gotoStep = useCallback((n: number) => {
    setDirection(n > step ? 1 : -1)
    setStep(n)
    saveDraft(n, form)
  }, [step, form])

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            prenom: form.prenom, nom: form.nom, email: form.email, telephone: form.telephone,
            adresseDepart:  { adresse: form.departAdresse,  ville: form.departVille,  etage: form.departEtage,  ascenseur: form.departAscenseur },
            adresseArrivee: { adresse: form.arriveeAdresse, ville: form.arriveeVille, etage: form.arriveeEtage, ascenseur: form.arriveeAscenseur },
            services:       form.services,
            dateSouhaitee:  form.dateSouhaitee || undefined,
            volumeEstime:   form.volumeEstime ? Number(form.volumeEstime) : undefined,
            commentaire:    form.commentaire  || undefined,
            photosDepart:   form.photosDepart.filter((p)  => p.status === 'done').map((p) => p.id),
            photosArrivee:  form.photosArrivee.filter((p) => p.status === 'done').map((p) => p.id),
            photosMeubles:  form.photosMeubles.filter((p) => p.status === 'done').map((p) => p.id),
          }),
        })
        const data = await res.json() as { success?: boolean; numeroDossier?: string }
        if (!res.ok) throw new Error('Erreur serveur')
        clearDraft()
        setDossier(data.numeroDossier ?? '')
        setSuccess(true)
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer ou nous appeler directement.')
      }
    })
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center py-12"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          </div>
        </div>
        <h2 className="font-heading font-bold text-[var(--color-text-light)] text-2xl mb-3">Demande envoyée !</h2>
        <p className="font-body text-[var(--color-text-muted)] mb-4">Notre équipe vous contactera sous 24h.</p>
        {dossier && (
          <div className="inline-block px-6 py-3 rounded-xl bg-white/[0.04] border border-white/8 mb-6">
            <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">Numéro de dossier</span>
            <p className="font-mono text-xl font-bold text-[var(--color-gold)] mt-1">{dossier}</p>
          </div>
        )}
        {form.email ? (
          <p className="font-body text-sm text-[var(--color-text-muted)] mb-6">
            Un email de confirmation a été envoyé à{' '}
            <strong className="text-[var(--color-text-light)]">{form.email}</strong>
          </p>
        ) : (
          <p className="font-body text-sm text-[var(--color-text-muted)] mb-6">
            Notre équipe vous contactera par téléphone sous 24h.
          </p>
        )}
        <Link
          href="/espace-client"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 text-[var(--color-red)] font-body font-semibold text-sm hover:bg-[var(--color-red)]/20 transition-colors"
        >
          Suivre mon dossier
        </Link>
      </motion.div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">

      {/* Reprendre banner */}
      {showResume && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5"
          role="alert"
        >
          <RotateCcw className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" aria-hidden="true" />
          <p className="font-body text-sm text-[var(--color-text-light)] flex-1">
            Vous avez un devis en cours. Reprendre ?
          </p>
          <button type="button" onClick={resumeDraft}
            className="font-body text-xs font-bold text-[var(--color-gold)] hover:underline px-2 focus-visible:outline-none">
            Reprendre
          </button>
          <button type="button" onClick={() => { clearDraft(); setShowResume(false) }}
            className="font-body text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] px-2 focus-visible:outline-none"
            aria-label="Ignorer le brouillon">
            Non merci
          </button>
        </motion.div>
      )}

      {/* Type badge */}
      <div className="flex items-center gap-2 mb-5">
        <Building2 className="w-3.5 h-3.5 text-[var(--color-red)]" aria-hidden="true" />
        <span className="font-body text-xs text-[var(--color-red)] uppercase tracking-widest font-semibold">
          {type === 'entreprise' ? 'Déménagement entreprise' : 'Déménagement particulier'}
        </span>
      </div>

      {/* Unified step header — animated title + track */}
      <StepHeader step={step} direction={direction} steps={STEPS} gotoStep={gotoStep} />

      {/* Step content — animated */}
      <div className="min-h-[340px]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Step 0 — Coordonnées */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Prénom *" value={form.prenom} onChange={(v) => update('prenom', v)}
                    placeholder="Jean" error={fieldErrs.prenom}
                    onBlur={() => handleBlur('prenom', form.prenom)} />
                  <Field label="Nom *" value={form.nom} onChange={(v) => update('nom', v)}
                    placeholder="Dupont" error={fieldErrs.nom}
                    onBlur={() => handleBlur('nom', form.nom)} />
                </div>
                <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)}
                  placeholder="vous@exemple.com" hint="Optionnel — pour recevoir votre confirmation par email" error={fieldErrs.email}
                  onBlur={() => handleBlur('email', form.email)} />
                <Field label="Téléphone *" type="tel" value={form.telephone} onChange={(v) => update('telephone', v)}
                  placeholder="+216 52 XXX XXX" hint="Format : (+216) XX XXX XXX"
                  error={fieldErrs.telephone} onBlur={() => handleBlur('telephone', form.telephone)} />
              </div>
            )}

            {/* Steps 1 & 2 — Adresses */}
            {(step === 1 || step === 2) && (() => {
              const prefix      = step === 1 ? 'depart'  : 'arrivee'
              const adresseKey  = (prefix + 'Adresse')   as keyof FormData
              const villeKey    = (prefix + 'Ville')     as keyof FormData
              const etageKey    = (prefix + 'Etage')     as keyof FormData
              const ascKey      = (prefix + 'Ascenseur') as keyof FormData
              const adresseErr  = step === 1 ? fieldErrs.departAdresse  : fieldErrs.arriveeAdresse
              const villeErr    = step === 1 ? fieldErrs.departVille    : fieldErrs.arriveeVille
              const adresseErrKey = step === 1 ? 'departAdresse' as const : 'arriveeAdresse' as const
              const villeErrKey   = step === 1 ? 'departVille'   as const : 'arriveeVille'   as const
              return (
                <div className="space-y-4">
                  <Field label="Adresse *" value={form[adresseKey] as string}
                    onChange={(v) => update(adresseKey, v)} placeholder="12 rue de la Liberté"
                    error={adresseErr} onBlur={() => handleBlur(adresseErrKey, form[adresseKey] as string)} />
                  <Field label="Ville *" value={form[villeKey] as string}
                    onChange={(v) => update(villeKey, v)} placeholder="Tunis"
                    error={villeErr} onBlur={() => handleBlur(villeErrKey, form[villeKey] as string)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <FloorGrid value={form[etageKey] as string} onChange={(v) => update(etageKey, v)} />
                    <TogglePill
                      value={form[ascKey] as boolean}
                      onChange={(v) => update(ascKey, v)}
                      label="Ascenseur disponible ?"
                    />
                  </div>
                </div>
              )
            })()}

            {/* Step 3 — Services & date */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                    Services souhaités *
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map(({ value: sVal, label, icon: Icon }) => {
                      const active = form.services.includes(sVal)
                      return (
                        <button
                          key={sVal}
                          type="button"
                          onClick={() => toggleService(sVal)}
                          aria-pressed={active}
                          className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border text-start font-body text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                            active
                              ? 'border-[var(--color-red)]/40 bg-[var(--color-red)]/8 text-[var(--color-red)]'
                              : 'border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-[var(--color-red)]' : 'text-white/30 group-hover:text-white/50'}`} aria-hidden="true" />
                          <span>{label}</span>
                          {active && (
                            <span className="ms-auto text-[var(--color-red)]" aria-hidden="true">✓</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {fieldErrs.services && (
                    <p role="alert" className="font-body text-xs text-[var(--color-red)] mt-2">{fieldErrs.services}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                      Date souhaitée
                    </label>
                    <input
                      type="date"
                      value={form.dateSouhaitee}
                      onChange={(e) => update('dateSouhaitee', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent transition-all"
                    />
                  </div>
                  <Field label="Volume estimé (m³)" type="number" value={form.volumeEstime}
                    onChange={(v) => update('volumeEstime', v)} placeholder="ex : 25" />
                </div>

                <div>
                  <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                    Commentaire
                  </label>
                  <textarea
                    value={form.commentaire}
                    onChange={(e) => update('commentaire', e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Informations supplémentaires…"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent resize-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 4 — Photos */}
            {step === 4 && (
              <StepPhotos
                photosDepart={form.photosDepart}
                photosArrivee={form.photosArrivee}
                photosMeubles={form.photosMeubles}
                onChangeDepart={(p)  => update('photosDepart',  p)}
                onChangeArrivee={(p) => update('photosArrivee', p)}
                onChangeMeubles={(p) => update('photosMeubles', p)}
                onSkip={advanceStep}
              />
            )}

            {/* Step 5 — Récapitulatif */}
            {step === 5 && (
              <StepRecapitulatif
                form={{ ...form, type }}
                isPending={isPending}
                error={error}
                gotoStep={gotoStep}
                onSubmit={handleSubmit}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation — hidden on recap step */}
      {step < 5 && (
        <div className="flex justify-between mt-8 pt-6 border-t border-white/8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] font-body text-sm hover:border-white/20 hover:text-[var(--color-text-light)] disabled:opacity-0 disabled:pointer-events-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Retour
          </button>

          <button
            type="button"
            onClick={advanceStep}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {step === 3 ? 'Ajouter des photos' : step === 4 ? 'Vérifier & envoyer' : 'Suivant'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepHeader({
  step, direction, steps, gotoStep,
}: {
  step: number
  direction: number
  steps: typeof STEP_META
  gotoStep: (n: number) => void
}) {
  const meta = steps[step]
  if (!meta) return null
  const { Icon } = meta

  return (
    <div className="mb-8 pb-6 border-b border-white/6">
      {/* Animated title + icon */}
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -10 : 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4 mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-[var(--color-text-light)] text-lg leading-tight">
                {meta.title}
              </h2>
              <p className="font-body text-sm text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                {meta.subtitle}
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-[var(--color-text-muted)] tabular-nums flex-shrink-0 mt-0.5">
            {step + 1} / {steps.length}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Step track — dots + filled connectors */}
      <div
        className="flex items-center"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Étape ${step + 1} sur ${steps.length}`}
      >
        {steps.map((s, i) => {
          const { Icon: SIcon } = s
          const done    = i < step
          const current = i === step
          return (
            <React.Fragment key={i}>
              <button
                type="button"
                onClick={() => { if (done) gotoStep(i) }}
                disabled={!done}
                aria-current={current ? 'step' : undefined}
                aria-label={`${s.title}${done ? ' — complétée' : current ? ' — en cours' : ''}`}
                title={s.title}
                className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                  current
                    ? 'bg-[var(--color-red)] border border-[var(--color-red)]/60 text-white shadow-[0_0_12px_rgba(181,32,39,0.35)]'
                    : done
                    ? 'bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 cursor-pointer hover:bg-emerald-400/20 hover:scale-105'
                    : 'bg-white/[0.03] border border-white/8 text-white/20 cursor-default'
                }`}
              >
                {done
                  ? <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  : <SIcon className="w-3 h-3" aria-hidden="true" />
                }
              </button>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-1.5 relative overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="absolute inset-0 origin-left bg-emerald-400/50 rounded-full"
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

function FloorGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
        Étage
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ETAGES.map((e) => (
          <button
            key={e.value}
            type="button"
            title={e.long}
            aria-label={e.long}
            aria-pressed={value === e.value}
            onClick={() => onChange(e.value)}
            className={`py-2.5 rounded-xl border font-body text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
              value === e.value
                ? 'bg-[var(--color-red)]/15 border-[var(--color-red)]/40 text-[var(--color-red)]'
                : 'bg-white/[0.02] border-white/8 text-[var(--color-text-muted)] hover:border-white/20 hover:text-[var(--color-text-light)]'
            }`}
          >
            {e.short}
          </button>
        ))}
      </div>
    </div>
  )
}

function TogglePill({ value, onChange, label }: {
  value: boolean; onChange: (v: boolean) => void; label: string
}) {
  return (
    <div>
      <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
        {label}
      </label>
      <div
        className="inline-flex rounded-xl border border-white/10 overflow-hidden"
        role="group"
        aria-label={label}
      >
        {([false, true] as const).map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`px-7 py-2.5 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-inset ${
              value === opt
                ? 'bg-[var(--color-red)] text-white'
                : 'bg-white/[0.02] text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-[var(--color-text-light)]'
            }`}
          >
            {opt ? 'Oui' : 'Non'}
          </button>
        ))}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', error, hint, onBlur }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; error?: string; hint?: string; onBlur?: () => void
}) {
  const hasError = !!error
  const isValid  = !hasError && value.trim().length > 0

  return (
    <div>
      <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={hasError}
          className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent transition-all ${
            hasError ? 'border-[var(--color-red)]/60' :
            isValid  ? 'border-emerald-400/40'         :
                       'border-white/10'
          }`}
        />
        {isValid && (
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm pointer-events-none" aria-hidden="true">✓</span>
        )}
      </div>
      {hint  && !error && <p className="font-body text-xs text-[var(--color-text-muted)]/60 mt-1">{hint}</p>}
      {error &&           <p role="alert" className="font-body text-xs text-[var(--color-red)] mt-1">{error}</p>}
    </div>
  )
}
