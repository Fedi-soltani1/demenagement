// Moteur de conversation PUR : (texte, session) -> { session, replies, action? }.
// Aucune I/O ici. index.ts exécute les `action` (appels HTTP) et l'envoi WhatsApp.
import { DEVIS_STEPS, RDV_STEPS, PREAMBULE_STEPS, SERVICES, type Step } from './flows.js'
import { type Session } from './sessions.js'

export type SubmitAction =
  | { type: 'submit-devis' }
  | { type: 'submit-rdv' }
  | { type: 'submit-lead' }

export interface EngineResult {
  session: Session
  replies: string[]
  action?: SubmitAction
}

const GREETING =
  'Bonjour 👋 Bienvenue chez DT Déménagement Tunisie.\n' +
  '(Tapez "annuler" à tout moment pour recommencer.)'

function stepsFor(flux: Session['flux']): Step[] {
  if (flux === 'devis') return DEVIS_STEPS
  if (flux === 'rdv') return RDV_STEPS
  return PREAMBULE_STEPS
}

function isSkip(input: string): boolean {
  return input.trim().toLowerCase() === 'passer'
}

function recapText(session: Session): string {
  const d = session.data
  const lines = Object.entries(d)
    .filter(([k, v]) => v !== undefined && k !== 'canal' && k !== 'intention')
    .map(([k, v]) => `• ${k} : ${String(v)}`)
  const photos = session.flux === 'devis' ? `\n• photos : ${session.mediaIds.length}` : ''
  return 'Récapitulatif :\n' + lines.join('\n') + photos +
    '\n\nTapez OUI pour confirmer, NON pour recommencer.'
}

function askCurrent(session: Session): string {
  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!
  return step.kind === 'confirm' ? recapText(session) : step.question
}

// Avance d'une étape en sautant celles dont la condition n'est pas remplie.
function advance(session: Session): void {
  const steps = stepsFor(session.flux)
  session.stepIndex += 1
  while (session.stepIndex < steps.length) {
    const s = steps[session.stepIndex]!
    if (s.condition && !s.condition(session.data)) { session.stepIndex += 1; continue }
    break
  }
}

export function handleMessage(input: string, session: Session): EngineResult {
  const text = input.trim()

  // Commande globale "annuler" -> recommence au préambule
  if (text.toLowerCase() === 'annuler') {
    session.flux = 'preambule'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
    return { session, replies: ['On recommence.', askCurrent(session)] }
  }

  // Première interaction : saluer puis démarrer le préambule (sans consommer le message)
  if (session.flux === 'menu') {
    session.flux = 'preambule'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
    return { session, replies: [GREETING, askCurrent(session)] }
  }

  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!

  // Étape confirmation (flux devis/rdv)
  if (step.kind === 'confirm') {
    if (text.toLowerCase() === 'oui') {
      return { session, replies: [], action: session.flux === 'devis' ? { type: 'submit-devis' } : { type: 'submit-rdv' } }
    }
    if (text.toLowerCase() === 'non') {
      session.flux = 'preambule'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
      return { session, replies: ['On recommence.', askCurrent(session)] }
    }
    return { session, replies: ['Tapez OUI pour confirmer ou NON pour recommencer.'] }
  }

  // Étape photos (texte "ok"/"passer" fait avancer ; les images sont gérées dans index.ts)
  if (step.kind === 'photos') {
    if (text.toLowerCase() === 'ok' || isSkip(text)) {
      advance(session)
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

    // Routage spécial à l'étape "intention" du préambule
    if (step.key === 'intention') {
      if (choice.value === 'pas_maintenant') {
        return { session, replies: [], action: { type: 'submit-lead' } }
      }
      session.flux = choice.value === 'devis' ? 'devis' : 'rdv'
      session.stepIndex = 0
      return { session, replies: [askCurrent(session)] }
    }

    advance(session)
    return { session, replies: [askCurrent(session)] }
  }

  // Étape services (multi-sélection)
  if (step.kind === 'services') {
    const picks = text.split(',').map((n) => Number(n.trim()) - 1).filter((i) => SERVICES[i])
    if (picks.length === 0) return { session, replies: [`Choisissez au moins un service.\n${step.question}`] }
    session.data[step.key] = picks.map((i) => SERVICES[i]!.value)
    advance(session)
    return { session, replies: [askCurrent(session)] }
  }

  // Étape texte
  if (step.optional && isSkip(text)) {
    session.data[step.key] = undefined
    advance(session)
    return { session, replies: [askCurrent(session)] }
  }
  const err = step.validate?.(text) ?? null
  if (err) return { session, replies: [err] }
  session.data[step.key] = text
  advance(session)
  return { session, replies: [askCurrent(session)] }
}

export { GREETING }
