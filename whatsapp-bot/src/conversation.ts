// Moteur de conversation PUR : (texte, session) -> { session, replies, action? }.
// Aucune I/O ici. index.ts exécute les `action` (appels HTTP) et l'envoi WhatsApp.
import { DEVIS_STEPS, RDV_STEPS, SERVICES, type Step } from './flows.js'
import { type Session } from './sessions.js'

export type SubmitAction =
  | { type: 'submit-devis' }
  | { type: 'submit-rdv' }

export interface EngineResult {
  session: Session
  replies: string[]
  action?: SubmitAction
}

const WELCOME =
  'Bonjour 👋 Bienvenue chez DT Déménagement Tunisie.\n' +
  'Que souhaitez-vous ?\n1. Un devis\n2. Un rendez-vous (visite)\n\n' +
  '(Tapez "annuler" à tout moment pour recommencer.)'

function stepsFor(flux: Session['flux']): Step[] {
  return flux === 'devis' ? DEVIS_STEPS : RDV_STEPS
}

function isSkip(input: string): boolean {
  return input.trim().toLowerCase() === 'passer'
}

function recapText(session: Session): string {
  const d = session.data
  const lines = Object.entries(d)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `• ${k} : ${String(v)}`)
  const photos = session.flux === 'devis' ? `\n• photos : ${session.mediaIds.length}` : ''
  return 'Récapitulatif :\n' + lines.join('\n') + photos +
    '\n\nTapez OUI pour confirmer, NON pour recommencer.'
}

/** Renvoie le texte de la question courante (récap si étape confirm). */
function askCurrent(session: Session): string {
  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!
  return step.kind === 'confirm' ? recapText(session) : step.question
}

export function handleMessage(input: string, session: Session): EngineResult {
  const text = input.trim()

  // Commande globale "annuler"
  if (text.toLowerCase() === 'annuler') {
    session.flux = 'menu'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
    return { session, replies: [WELCOME] }
  }

  // Menu d'accueil
  if (session.flux === 'menu') {
    if (text === '1') { session.flux = 'devis'; session.stepIndex = 0 }
    else if (text === '2') { session.flux = 'rdv'; session.stepIndex = 0 }
    else return { session, replies: [WELCOME] }
    return { session, replies: [askCurrent(session)] }
  }

  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!

  // Étape confirmation
  if (step.kind === 'confirm') {
    if (text.toLowerCase() === 'oui') {
      return { session, replies: [], action: session.flux === 'devis' ? { type: 'submit-devis' } : { type: 'submit-rdv' } }
    }
    if (text.toLowerCase() === 'non') {
      session.stepIndex = 0; session.data = {}; session.mediaIds = []
      return { session, replies: ['On recommence.', askCurrent(session)] }
    }
    return { session, replies: ['Tapez OUI pour confirmer ou NON pour recommencer.'] }
  }

  // Étape photos : le texte "ok"/"passer" fait avancer ; les images sont gérées dans index.ts
  if (step.kind === 'photos') {
    if (text.toLowerCase() === 'ok' || isSkip(text)) {
      session.stepIndex += 1
      return { session, replies: [askCurrent(session)] }
    }
    return { session, replies: ['Envoyez une photo, ou tapez OK pour continuer (ou "passer").'] }
  }

  // Étape choix numéroté
  if (step.kind === 'choice') {
    const idx = Number(text) - 1
    const choice = step.choices?.[idx]
    if (!choice) return { session, replies: [`Choix invalide.\n${step.question}`] }
    session.data[step.key] = choice.value
    session.stepIndex += 1
    return { session, replies: [askCurrent(session)] }
  }

  // Étape services (multi-sélection)
  if (step.kind === 'services') {
    const picks = text.split(',').map((n) => Number(n.trim()) - 1).filter((i) => SERVICES[i])
    if (picks.length === 0) return { session, replies: [`Choisissez au moins un service.\n${step.question}`] }
    session.data[step.key] = picks.map((i) => SERVICES[i]!.value)
    session.stepIndex += 1
    return { session, replies: [askCurrent(session)] }
  }

  // Étape texte
  if (step.optional && isSkip(text)) {
    session.data[step.key] = undefined
    session.stepIndex += 1
    return { session, replies: [askCurrent(session)] }
  }
  const err = step.validate?.(text) ?? null
  if (err) return { session, replies: [err] }
  session.data[step.key] = text
  session.stepIndex += 1
  return { session, replies: [askCurrent(session)] }
}

export { WELCOME }
