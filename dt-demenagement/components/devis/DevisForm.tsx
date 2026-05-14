'use client'

import React, { useState, useTransition } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, MapPin, User, Package, Calendar, Building2 } from 'lucide-react'

const SERVICES = [
  { value: 'transporteur-en-tunisie', label: 'Transporteur en Tunisie' },
  { value: 'transfert-entreprises',   label: 'Transfert Entreprises'   },
  { value: 'location-monte-meubles',  label: 'Location Monte-Meubles'  },
  { value: 'gardes-meubles',          label: 'Gardes Meubles'          },
  { value: 'services-emballage',      label: 'Services Emballage'       },
  { value: 'montage-demontage',       label: 'Montage / Démontage'      },
]

const ETAGES = [
  { value: 'RDC', label: 'Rez-de-chaussée' },
  { value: '1',   label: '1er étage'       },
  { value: '2',   label: '2ème étage'      },
  { value: '3',   label: '3ème étage'      },
  { value: '4',   label: '4ème étage'      },
  { value: '5+',  label: '5ème et +'       },
]

type TypeDevis = 'particulier' | 'entreprise'

interface FormData {
  prenom: string; nom: string; email: string; telephone: string
  departAdresse: string; departVille: string; departEtage: string; departAscenseur: boolean
  arriveeAdresse: string; arriveeVille: string; arriveeEtage: string; arriveeAscenseur: boolean
  services: string[]; dateSouhaitee: string; volumeEstime: string; commentaire: string
}

const INITIAL: FormData = {
  prenom: '', nom: '', email: '', telephone: '',
  departAdresse: '', departVille: '', departEtage: 'RDC', departAscenseur: false,
  arriveeAdresse: '', arriveeVille: '', arriveeEtage: 'RDC', arriveeAscenseur: false,
  services: [], dateSouhaitee: '', volumeEstime: '', commentaire: '',
}

export function DevisForm({ type, locale }: { type: TypeDevis; locale: string }) {
  const [step,    setStep]    = useState(0)
  const [form,    setForm]    = useState<FormData>(INITIAL)
  const [success, setSuccess] = useState(false)
  const [dossier, setDossier] = useState('')
  const [error,   setError]   = useState('')
  const [isPending, startTransition] = useTransition()

  function update(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleService(val: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(val)
        ? prev.services.filter((s) => s !== val)
        : [...prev.services, val],
    }))
  }

  const STEPS = [
    { title: 'Vos coordonnées',  icon: <User className="w-4 h-4" /> },
    { title: 'Adresse de départ', icon: <MapPin className="w-4 h-4" /> },
    { title: "Adresse d'arrivée", icon: <MapPin className="w-4 h-4" /> },
    { title: 'Services & date',   icon: <Package className="w-4 h-4" /> },
  ]

  function isStepValid(): boolean {
    if (step === 0) return !!(form.prenom && form.nom && form.email.includes('@') && form.telephone)
    if (step === 1) return !!(form.departAdresse && form.departVille)
    if (step === 2) return !!(form.arriveeAdresse && form.arriveeVille)
    if (step === 3) return form.services.length > 0
    return true
  }

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/devis', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            type,
            prenom: form.prenom, nom: form.nom, email: form.email, telephone: form.telephone,
            adresseDepart:  { adresse: form.departAdresse,  ville: form.departVille,  etage: form.departEtage,  ascenseur: form.departAscenseur  },
            adresseArrivee: { adresse: form.arriveeAdresse, ville: form.arriveeVille, etage: form.arriveeEtage, ascenseur: form.arriveeAscenseur },
            services:       form.services,
            dateSouhaitee:  form.dateSouhaitee || undefined,
            volumeEstime:   form.volumeEstime ? Number(form.volumeEstime) : undefined,
            commentaire:    form.commentaire  || undefined,
          }),
        })
        const data = await res.json() as { success?: boolean; numeroDossier?: string; error?: unknown }
        if (!res.ok) throw new Error('Erreur serveur')
        setDossier(data.numeroDossier ?? '')
        setSuccess(true)
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer ou nous appeler directement.')
      }
    })
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          </div>
        </div>
        <h2 className="font-heading font-bold text-[var(--color-text-light)] text-2xl mb-3">Demande envoyée !</h2>
        <p className="font-body text-[var(--color-text-muted)] mb-4">
          Notre équipe vous contactera sous 24h.
        </p>
        {dossier && (
          <div className="inline-block px-6 py-3 rounded-xl bg-white/[0.04] border border-white/8 mb-6">
            <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">Numéro de dossier</span>
            <p className="font-mono text-xl font-bold text-[var(--color-gold)] mt-1">{dossier}</p>
          </div>
        )}
        <p className="font-body text-sm text-[var(--color-text-muted)] mb-6">
          Un email de confirmation vous a été envoyé à <strong className="text-[var(--color-text-light)]">{form.email}</strong>
        </p>
        <a
          href={`/${locale}/espace-client`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 text-[var(--color-red)] font-body font-semibold text-sm hover:bg-[var(--color-red)]/20 transition-colors duration-200"
        >
          Suivre mon dossier
        </a>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Étiquette type */}
      <div className="flex items-center gap-2 mb-6">
        {type === 'entreprise'
          ? <Building2 className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
          : <User className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
        }
        <span className="font-body text-xs text-[var(--color-red)] uppercase tracking-widest font-semibold">
          {type === 'entreprise' ? 'Déménagement entreprise' : 'Déménagement particulier'}
        </span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-medium whitespace-nowrap transition-colors ${
                i === step
                  ? 'bg-[var(--color-red)]/10 border border-[var(--color-red)]/30 text-[var(--color-red)]'
                  : i < step
                  ? 'bg-emerald-400/8 border border-emerald-400/20 text-emerald-400 cursor-pointer'
                  : 'bg-white/[0.02] border border-white/8 text-[var(--color-text-muted)] cursor-default'
              }`}
              disabled={i >= step}
              aria-current={i === step ? 'step' : undefined}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && <div className="flex-shrink-0 w-4 h-px bg-white/10" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </div>

      {/* Contenu étape */}
      <div className="space-y-4 min-h-[260px]">
        {step === 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prénom *" value={form.prenom} onChange={(v) => update('prenom', v)} placeholder="Jean" />
              <Field label="Nom *" value={form.nom} onChange={(v) => update('nom', v)} placeholder="Dupont" />
            </div>
            <Field label="Email *" type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="vous@exemple.com" />
            <Field label="Téléphone *" type="tel" value={form.telephone} onChange={(v) => update('telephone', v)} placeholder="+21652XXXXXX" />
          </>
        )}

        {(step === 1 || step === 2) && (
          <>
            {(() => {
              const prefix = step === 1 ? 'depart' : 'arrivee'
              const adresseKey   = (prefix + 'Adresse')  as keyof FormData
              const villeKey     = (prefix + 'Ville')    as keyof FormData
              const etageKey     = (prefix + 'Etage')    as keyof FormData
              const ascenseurKey = (prefix + 'Ascenseur') as keyof FormData
              return (
                <>
                  <Field label="Adresse *" value={form[adresseKey] as string} onChange={(v) => update(adresseKey, v)} placeholder="12 rue de la Liberté" />
                  <Field label="Ville *" value={form[villeKey] as string} onChange={(v) => update(villeKey, v)} placeholder="Tunis" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Étage</label>
                      <select
                        value={form[etageKey] as string}
                        onChange={(e) => update(etageKey, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent"
                      >
                        {ETAGES.map((e) => <option key={e.value} value={e.value} className="bg-[#1a1a1a]">{e.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id={`ascenseur-${step}`}
                        checked={form[ascenseurKey] as boolean}
                        onChange={(e) => update(ascenseurKey, e.target.checked)}
                        className="w-4 h-4 accent-[var(--color-red)]"
                      />
                      <label htmlFor={`ascenseur-${step}`} className="font-body text-sm text-[var(--color-text-muted)]">Ascenseur disponible</label>
                    </div>
                  </div>
                </>
              )
            })()}
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Services souhaités *</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleService(s.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-start font-body text-sm transition-all ${
                      form.services.includes(s.value)
                        ? 'border-[var(--color-red)]/40 bg-[var(--color-red)]/8 text-[var(--color-red)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] hover:border-white/15'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${form.services.includes(s.value) ? 'bg-[var(--color-red)]' : 'bg-white/20'}`} aria-hidden="true" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                  <Calendar className="w-3.5 h-3.5 inline me-1" aria-hidden="true" />
                  Date souhaitée
                </label>
                <input
                  type="date"
                  value={form.dateSouhaitee}
                  onChange={(e) => update('dateSouhaitee', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent"
                />
              </div>
              <Field label="Volume estimé (m³)" type="number" value={form.volumeEstime} onChange={(v) => update('volumeEstime', v)} placeholder="ex : 25" />
            </div>
            <div>
              <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Commentaire</label>
              <textarea
                value={form.commentaire}
                onChange={(e) => update('commentaire', e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Informations supplémentaires…"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent resize-none"
              />
            </div>
          </>
        )}
      </div>

      {error && <p role="alert" className="font-body text-sm text-[var(--color-red)] mt-2">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] font-body text-sm hover:border-white/15 disabled:opacity-0 disabled:pointer-events-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            Suivant
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isStepValid() || isPending}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Envoi…</>
              : <>Envoyer ma demande<ArrowRight className="w-4 h-4" aria-hidden="true" /></>
            }
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent transition-all"
      />
    </div>
  )
}
