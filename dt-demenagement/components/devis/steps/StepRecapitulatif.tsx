'use client'

import { ArrowRight, Loader2, Pencil, CheckCircle } from 'lucide-react'
import type { UploadedPhoto } from '../PhotoUploadZone'

const SERVICES_LABELS: Record<string, string> = {
  'transporteur-en-tunisie': 'Transporteur en Tunisie',
  'transfert-entreprises':   'Transfert Entreprises',
  'location-monte-meubles':  'Location Monte-Meubles',
  'gardes-meubles':          'Gardes Meubles',
  'services-emballage':      'Services Emballage',
  'montage-demontage':       'Montage / Démontage',
}

const ETAGES_LABELS: Record<string, string> = {
  'RDC': 'Rez-de-chaussée',
  '1': '1er étage', '2': '2ème étage', '3': '3ème étage',
  '4': '4ème étage', '5+': '5ème et +',
}

interface RecapFormData {
  type:            string
  prenom:          string
  nom:             string
  email:           string
  telephone:       string
  departAdresse:   string
  departVille:     string
  departEtage:     string
  departAscenseur: boolean
  arriveeAdresse:  string
  arriveeVille:    string
  arriveeEtage:    string
  arriveeAscenseur: boolean
  services:        string[]
  dateSouhaitee:   string
  volumeEstime:    string
  commentaire:     string
  photosDepart:    UploadedPhoto[]
  photosArrivee:   UploadedPhoto[]
  photosMeubles:   UploadedPhoto[]
}

interface Props {
  form:       RecapFormData
  isPending:  boolean
  error:      string
  gotoStep:   (n: number) => void
  onSubmit:   () => void
}

function Section({ title, step, gotoStep, children }: {
  title: string; step: number; gotoStep: (n: number) => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-semibold">{title}</p>
        <button
          type="button"
          onClick={() => gotoStep(step)}
          className="flex items-center gap-1 font-body text-xs text-[var(--color-red)] hover:text-[var(--color-red-light)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-red)] rounded px-1"
          aria-label={`Modifier ${title}`}
        >
          <Pencil className="w-3 h-3" aria-hidden="true" />
          Modifier
        </button>
      </div>
      <div className="px-4 py-3 space-y-1">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-body text-xs text-[var(--color-text-muted)] w-24 flex-shrink-0">{label}</span>
      <span className="font-body text-sm text-[var(--color-text-light)]">{value}</span>
    </div>
  )
}

export function StepRecapitulatif({ form, isPending, error, gotoStep, onSubmit }: Props) {
  const donePhotos = [
    ...form.photosMeubles.filter((p) => p.status === 'done'),
    ...form.photosDepart.filter((p) => p.status === 'done'),
    ...form.photosArrivee.filter((p) => p.status === 'done'),
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        <p className="font-heading font-semibold text-[var(--color-text-light)] text-base">
          Récapitulatif de votre demande
        </p>
      </div>
      <p className="font-body text-xs text-[var(--color-text-muted)] -mt-2 mb-4">
        Vérifiez vos informations avant d&apos;envoyer.
      </p>

      {/* Type */}
      <Section title="Type" step={0} gotoStep={gotoStep}>
        <Row label="Profil" value={form.type === 'entreprise' ? 'Entreprise' : 'Particulier'} />
      </Section>

      {/* Coordonnées */}
      <Section title="Vos coordonnées" step={0} gotoStep={gotoStep}>
        <Row label="Nom"       value={`${form.prenom} ${form.nom}`} />
        <Row label="Email"     value={form.email} />
        <Row label="Téléphone" value={form.telephone} />
      </Section>

      {/* Départ */}
      <Section title="Adresse de départ" step={1} gotoStep={gotoStep}>
        <Row label="Adresse" value={`${form.departAdresse}, ${form.departVille}`} />
        <Row label="Étage"   value={ETAGES_LABELS[form.departEtage] ?? form.departEtage} />
        {form.departAscenseur && <Row label="" value="✓ Ascenseur disponible" />}
      </Section>

      {/* Arrivée */}
      <Section title="Adresse d'arrivée" step={1} gotoStep={gotoStep}>
        <Row label="Adresse" value={`${form.arriveeAdresse}, ${form.arriveeVille}`} />
        <Row label="Étage"   value={ETAGES_LABELS[form.arriveeEtage] ?? form.arriveeEtage} />
        {form.arriveeAscenseur && <Row label="" value="✓ Ascenseur disponible" />}
      </Section>

      {/* Services */}
      <Section title="Services & date" step={2} gotoStep={gotoStep}>
        <Row label="Services" value={form.services.map((s) => SERVICES_LABELS[s] ?? s).join(', ')} />
        {form.dateSouhaitee && <Row label="Date" value={new Date(form.dateSouhaitee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {form.volumeEstime  && <Row label="Volume" value={`${form.volumeEstime} m³`} />}
        {form.commentaire   && <Row label="Commentaire" value={form.commentaire} />}
      </Section>

      {/* Photos */}
      <Section title={`Photos (${donePhotos.length} ajoutée${donePhotos.length !== 1 ? 's' : ''})`} step={3} gotoStep={gotoStep}>
        {donePhotos.length === 0 ? (
          <p className="font-body text-xs text-[var(--color-text-muted)]/60 italic">Aucune photo ajoutée</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {donePhotos.map((p) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={p.id}
                src={p.url}
                alt={p.name}
                className="w-14 h-14 rounded-lg object-cover border border-white/10"
              />
            ))}
          </div>
        )}
      </Section>

      {/* Error */}
      {error && (
        <p role="alert" className="font-body text-sm text-[var(--color-red)] px-1">{error}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] mt-2"
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Envoi en cours…</>
          : <>Envoyer ma demande de devis<ArrowRight className="w-4 h-4" aria-hidden="true" /></>
        }
      </button>
      <p className="font-body text-xs text-[var(--color-text-muted)]/60 text-center">
        Notre équipe vous contacte sous 24h.
      </p>
    </div>
  )
}
