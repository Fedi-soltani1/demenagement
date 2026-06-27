'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Truck, Package, MapPin, Calendar, ChevronRight,
  ChevronLeft, CheckCircle, Loader2, AlertCircle,
  Layers, Wrench, Box, ArrowUpDown,
} from 'lucide-react'

type DemandeType = 'demenagement' | 'livraison'

interface AdresseForm {
  adresse:   string
  ville:     string
  etage:     string
  ascenseur: boolean
}

interface FormState {
  type:          DemandeType
  adresseDepart:  AdresseForm
  adresseArrivee: AdresseForm
  dateSouhaitee: string
  services:      string[]
  commentaire:   string
}

const SERVICES_OPTIONS = [
  { value: 'services-emballage',   label: 'Emballage / déballage',  icon: Box },
  { value: 'montage-demontage',    label: 'Montage / démontage',    icon: Wrench },
  { value: 'gardes-meubles',       label: 'Garde-meubles',          icon: Layers },
  { value: 'location-monte-meubles', label: 'Monte-meubles',        icon: ArrowUpDown },
]

const emptyAdresse = (): AdresseForm => ({ adresse: '', ville: '', etage: '', ascenseur: false })

const STEPS = ['Type', 'Adresses', 'Détails', 'Confirmation']

export function NouvelleDemandeForm({ locale }: { locale: string }) {
  const router = useRouter()

  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState<FormState>({
    type:           'demenagement',
    adresseDepart:  emptyAdresse(),
    adresseArrivee: emptyAdresse(),
    dateSouhaitee:  '',
    services:       [],
    commentaire:    '',
  })

  function setType(t: DemandeType) { setForm(f => ({ ...f, type: t })) }

  function setDepart(k: keyof AdresseForm, v: string | boolean) {
    setForm(f => ({ ...f, adresseDepart: { ...f.adresseDepart, [k]: v } }))
  }
  function setArrivee(k: keyof AdresseForm, v: string | boolean) {
    setForm(f => ({ ...f, adresseArrivee: { ...f.adresseArrivee, [k]: v } }))
  }

  function toggleService(val: string) {
    setForm(f => ({
      ...f,
      services: f.services.includes(val)
        ? f.services.filter(s => s !== val)
        : [...f.services, val],
    }))
  }

  function canNext(): boolean {
    if (step === 1) {
      return (
        form.adresseDepart.adresse.trim().length > 0 &&
        form.adresseDepart.ville.trim().length > 0 &&
        form.adresseArrivee.adresse.trim().length > 0 &&
        form.adresseArrivee.ville.trim().length > 0
      )
    }
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/client/nouvelle-demande', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:           form.type,
          adresseDepart:  form.adresseDepart,
          adresseArrivee: form.adresseArrivee,
          dateSouhaitee:  form.dateSouhaitee || undefined,
          services:       form.services,
          commentaire:    form.commentaire,
        }),
      })
      const data = await res.json() as { ok?: boolean; numeroDossier?: string; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Erreur inconnue')
      router.push(`/${locale}/espace-client/${data.numeroDossier}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-bold transition-all ${
                i < step  ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-[var(--color-red)] text-white ring-4 ring-[var(--color-red)]/20' :
                             'bg-white/8 text-[var(--color-text-muted)]'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`font-body text-[10px] whitespace-nowrap ${
                i === step ? 'text-[var(--color-text-light)]' : 'text-[var(--color-text-muted)]'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 mb-4 ${i < step ? 'bg-emerald-500/40' : 'bg-white/8'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Type */}
      {step === 0 && (
        <div>
          <h2 className="font-heading font-bold text-[var(--color-text-light)] text-xl mb-2">
            Quel service souhaitez-vous ?
          </h2>
          <p className="font-body text-sm text-[var(--color-text-muted)] mb-8">
            Sélectionnez le type de prestation pour votre demande.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              {
                id:       'demenagement' as DemandeType,
                icon:     Truck,
                label:    'Déménagement',
                desc:     'Transfert complet de votre logement ou bureau, avec ou sans services additionnels.',
              },
              {
                id:       'livraison' as DemandeType,
                icon:     Package,
                label:    'Livraison / Transport',
                desc:     'Transport d\'objets, colis, ou petits meubles d\'un point A à un point B.',
              },
            ] as const).map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={`group text-start p-6 rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                  form.type === id
                    ? 'border-[var(--color-red)]/60 bg-[var(--color-red)]/8'
                    : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  form.type === id
                    ? 'bg-[var(--color-red)]/15 text-[var(--color-red)]'
                    : 'bg-white/5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className={`font-heading font-semibold text-base mb-1 ${
                  form.type === id ? 'text-[var(--color-text-light)]' : 'text-[var(--color-text-muted)]'
                }`}>{label}</p>
                <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
                {form.type === id && (
                  <div className="mt-4 flex items-center gap-1.5 text-[var(--color-red)]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-body text-xs font-semibold">Sélectionné</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Adresses */}
      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-heading font-bold text-[var(--color-text-light)] text-xl mb-2">Vos adresses</h2>
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              Indiquez le lieu de départ et le lieu d&apos;arrivée.
            </p>
          </div>

          {/* Départ */}
          <AdresseBlock
            icon={<MapPin className="w-4 h-4 text-[var(--color-red)]" />}
            title="Adresse de départ"
            value={form.adresseDepart}
            onChange={setDepart}
          />

          {/* Arrivée */}
          <AdresseBlock
            icon={<MapPin className="w-4 h-4 text-emerald-400" />}
            title="Adresse d'arrivée"
            value={form.adresseArrivee}
            onChange={setArrivee}
          />
        </div>
      )}

      {/* Step 2 — Détails */}
      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-heading font-bold text-[var(--color-text-light)] text-xl mb-2">Détails de la demande</h2>
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              Ces informations aident notre équipe à préparer votre devis.
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Date souhaitée <span className="normal-case">(optionnel)</span>
            </label>
            <input
              type="date"
              value={form.dateSouhaitee}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setForm(f => ({ ...f, dateSouhaitee: e.target.value }))}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text-light)] font-body text-sm focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30"
            />
          </div>

          {/* Services */}
          <div>
            <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
              <Package className="w-3.5 h-3.5 inline mr-1.5" />
              Services additionnels <span className="normal-case">(optionnel)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICES_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = form.services.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleService(value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                      active
                        ? 'border-[var(--color-red)]/40 bg-[var(--color-red)]/8 text-[var(--color-text-light)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] hover:border-white/15'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[var(--color-red)]' : ''}`} />
                    <span className="font-body text-sm">{label}</span>
                    {active && <CheckCircle className="w-3.5 h-3.5 text-[var(--color-red)] ms-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
              Notes / Informations complémentaires <span className="normal-case">(optionnel)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Précisions sur le mobilier, contraintes d'accès, objets fragiles ou lourds..."
              value={form.commentaire}
              onChange={e => setForm(f => ({ ...f, commentaire: e.target.value.slice(0, 1000) }))}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30 resize-none"
            />
            <p className={`text-right font-mono text-[10px] mt-1 ${form.commentaire.length >= 950 ? 'text-amber-400' : 'text-[var(--color-text-muted)]'}`}>
              {form.commentaire.length} / 1000
            </p>
          </div>
        </div>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <div>
          <h2 className="font-heading font-bold text-[var(--color-text-light)] text-xl mb-2">Récapitulatif</h2>
          <p className="font-body text-sm text-[var(--color-text-muted)] mb-8">
            Vérifiez vos informations avant d&apos;envoyer votre demande.
          </p>

          <div className="space-y-4">
            <RecapRow label="Type de service" value={form.type === 'livraison' ? '📦 Livraison / Transport' : '🚚 Déménagement'} />
            <RecapRow
              label="Adresse de départ"
              value={[form.adresseDepart.adresse, form.adresseDepart.ville, form.adresseDepart.etage ? `Ét. ${form.adresseDepart.etage}` : null, form.adresseDepart.ascenseur ? 'Ascenseur' : null].filter(Boolean).join(' · ')}
            />
            <RecapRow
              label="Adresse d'arrivée"
              value={[form.adresseArrivee.adresse, form.adresseArrivee.ville, form.adresseArrivee.etage ? `Ét. ${form.adresseArrivee.etage}` : null, form.adresseArrivee.ascenseur ? 'Ascenseur' : null].filter(Boolean).join(' · ')}
            />
            {form.dateSouhaitee && (
              <RecapRow label="Date souhaitée" value={new Date(form.dateSouhaitee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
            )}
            {form.services.length > 0 && (
              <RecapRow label="Services" value={form.services.map(s => SERVICES_OPTIONS.find(o => o.value === s)?.label ?? s).join(', ')} />
            )}
            {form.commentaire && (
              <RecapRow label="Notes" value={form.commentaire} />
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="font-body text-sm">{error}</p>
            </div>
          )}

          <p className="mt-6 font-body text-xs text-[var(--color-text-muted)]">
            Notre équipe vous contactera dans les 24h pour confirmer votre demande et vous transmettre un devis personnalisé.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
        <button
          type="button"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[var(--color-text-muted)] font-body text-sm hover:text-[var(--color-text-light)] hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[var(--color-red)] text-white font-body font-bold text-sm hover:bg-[var(--color-red-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Envoyer ma demande
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function AdresseBlock({ icon, title, value, onChange }: {
  icon: React.ReactNode
  title: string
  value: AdresseForm
  onChange: (k: keyof AdresseForm, v: string | boolean) => void
}) {
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] space-y-4">
      <p className="flex items-center gap-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
        {icon}
        {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block font-body text-xs text-[var(--color-text-muted)] mb-1.5">Rue / Adresse *</label>
          <input
            type="text"
            placeholder="Ex: 12 Rue de la République"
            value={value.adresse}
            onChange={e => onChange('adresse', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-[var(--color-text-muted)] mb-1.5">Ville *</label>
          <input
            type="text"
            placeholder="Ex: Tunis"
            value={value.ville}
            onChange={e => onChange('ville', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-[var(--color-text-muted)] mb-1.5">Étage</label>
          <input
            type="text"
            placeholder="Ex: 3"
            value={value.etage}
            onChange={e => onChange('etage', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text-light)] font-body text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value.ascenseur}
              onChange={e => onChange('ascenseur', e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--color-red)]"
            />
            <span className="font-body text-sm text-[var(--color-text-muted)]">Ascenseur disponible</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="font-body text-xs text-[var(--color-text-muted)] w-36 flex-shrink-0 mt-0.5">{label}</span>
      <span className="font-body text-sm text-[var(--color-text-light)]">{value}</span>
    </div>
  )
}
