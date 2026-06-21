// Définition déclarative des parcours conversationnels. Module PUR.

export type StepKind = 'text' | 'choice' | 'services' | 'photos' | 'confirm'

export interface Step {
  key:       string                 // clé dans session.data
  question:  string                 // texte envoyé au client
  kind:      StepKind
  optional?: boolean                // accepte "passer"
  choices?:  { label: string; value: string }[]  // pour kind 'choice'
  validate?: (input: string) => string | null    // null = ok, sinon message d'erreur
  condition?: (data: Record<string, unknown>) => boolean  // étape posée seulement si true (sinon sautée)
}

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const minLen = (n: number) => (input: string): string | null =>
  input.trim().length >= n ? null : `Trop court — au moins ${n} caractères.`

export const SERVICES: { label: string; value: string }[] = [
  { label: 'Transporteur en Tunisie', value: 'transporteur-en-tunisie' },
  { label: 'Transfert Entreprises',   value: 'transfert-entreprises' },
  { label: 'Location Monte-Meubles',  value: 'location-monte-meubles' },
  { label: 'Garde-Meubles / Stockage', value: 'gardes-meubles' },
  { label: 'Service Emballage',       value: 'services-emballage' },
  { label: 'Montage & Démontage',     value: 'montage-demontage' },
]

const servicesQuestion =
  'Quels services ? Répondez avec les numéros séparés par une virgule (ex : 1,3) :\n' +
  SERVICES.map((s, i) => `${i + 1}. ${s.label}`).join('\n')

export const PREAMBULE_STEPS: Step[] = [
  { key: 'prenom', kind: 'text', question: 'Votre prénom ?', validate: minLen(2) },
  { key: 'nom',    kind: 'text', question: 'Votre nom ?',    validate: minLen(2) },
  { key: 'canal',  kind: 'choice',
    question: 'Comment préférez-vous être recontacté ?\n1. WhatsApp\n2. Email\n3. Les deux',
    choices: [
      { label: 'WhatsApp', value: 'whatsapp' },
      { label: 'Email',    value: 'email' },
      { label: 'Les deux', value: 'les_deux' },
    ] },
  { key: 'email',  kind: 'text', question: 'Votre email ?',
    validate: (v) => EMAIL_OK.test(v) ? null : 'Email invalide. Entrez un email valide (ex : nom@email.com).',
    condition: (d) => d.canal === 'email' || d.canal === 'les_deux' },
  { key: 'intention', kind: 'choice',
    question: 'Que souhaitez-vous ?\n1. Demande de devis\n2. Rendez-vous de visite\n3. Pas maintenant',
    choices: [
      { label: 'Devis',          value: 'devis' },
      { label: 'Rendez-vous',    value: 'rdv' },
      { label: 'Pas maintenant', value: 'pas_maintenant' },
    ] },
]

export const DEVIS_STEPS: Step[] = [
  { key: 'type',           kind: 'choice', question: 'Type de client ?\n1. Particulier\n2. Entreprise',
    choices: [{ label: 'Particulier', value: 'particulier' }, { label: 'Entreprise', value: 'entreprise' }] },
  { key: 'villeDepart',    kind: 'text',   question: 'Ville de départ ?',   validate: minLen(2) },
  { key: 'adresseDepart',  kind: 'text',   question: 'Adresse de départ ?', validate: minLen(3) },
  { key: 'villeArrivee',   kind: 'text',   question: "Ville d'arrivée ?",   validate: minLen(2) },
  { key: 'adresseArrivee', kind: 'text',   question: "Adresse d'arrivée ?", validate: minLen(3) },
  { key: 'services',       kind: 'services', question: servicesQuestion },
  { key: 'dateSouhaitee',  kind: 'text',   question: 'Date souhaitée ? (ex : 15/07/2026, ou "passer")', optional: true },
  { key: 'volumeEstime',   kind: 'text',   question: 'Volume estimé en m³ ? (un nombre, ou "passer")', optional: true,
    validate: (v) => /^[0-9]+([.,][0-9]+)?$/.test(v.trim()) ? null : 'Entrez un nombre (ex : 35) ou "passer".' },
  { key: 'photos',         kind: 'photos', question: 'Envoyez vos photos (meubles, accès) une par une, puis tapez OK. Ou tapez "passer".' },
  { key: 'commentaire',    kind: 'text',   question: 'Un commentaire ? (ou "passer")', optional: true },
  { key: 'confirm',        kind: 'confirm', question: '' },  // question construite dynamiquement (récap)
]

export const RDV_STEPS: Step[] = [
  { key: 'type',       kind: 'choice', question: 'Type ?\n1. Particulier\n2. Entreprise\n3. Administration',
    choices: [
      { label: 'Particulier',    value: 'client' },
      { label: 'Entreprise',     value: 'entreprise' },
      { label: 'Administration', value: 'administration' },
    ] },
  { key: 'adresse',    kind: 'text', question: 'Votre adresse ? (ou "passer")', optional: true },
  { key: 'dateVisite', kind: 'text', question: 'Date de visite souhaitée ? (ou "passer")', optional: true },
  { key: 'heure',      kind: 'text', question: 'Heure souhaitée ? (ou "passer")', optional: true },
  { key: 'confirm',    kind: 'confirm', question: '' },
]
