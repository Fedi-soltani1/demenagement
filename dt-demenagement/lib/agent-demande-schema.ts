import { z } from 'zod'

// Formulaire progressif : essentiels requis, détails optionnels.
// Réutilisé côté client (formulaire app) ET serveur (validation à la création).
export const agentDemandeSchema = z.object({
  type: z.enum(['devis', 'rendez-vous']),
  // Essentiels (requis)
  clientNom: z.string().min(2, 'Nom du client requis'),
  clientTelephone: z.string().min(6, 'Téléphone requis'),
  gouvernoratDepart: z.string().min(1, 'Gouvernorat de départ requis'),
  // Requis pour un déménagement (devis) ; facultatif pour un rendez-vous (visite).
  gouvernoratArrivee: z.string().optional(),
  pointFinal: z.string().optional(),
  dateApprox: z.string().min(1, 'Date souhaitée requise'),
  // Optionnels (détails)
  clientWhatsapp: z.string().optional(),
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  adresseDepart: z.string().optional(),
  adresseArrivee: z.string().optional(),
  typeBien: z.string().optional(),
  notes: z.string().optional(),
  // Champs hérités : renseignés automatiquement (rétro-compat), non saisis directement.
  villeDepart: z.string().optional(),
  villeArrivee: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.type === 'devis' && !(val.gouvernoratArrivee && val.gouvernoratArrivee.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gouvernoratArrivee'], message: 'Gouvernorat d\'arrivée requis' })
  }
})

export type AgentDemandeInput = z.infer<typeof agentDemandeSchema>
