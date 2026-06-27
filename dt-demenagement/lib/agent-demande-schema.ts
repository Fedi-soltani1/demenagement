import { z } from 'zod'

// Formulaire progressif : essentiels requis, détails optionnels.
// Réutilisé côté client (formulaire app) ET serveur (validation à la création).
export const agentDemandeSchema = z.object({
  type: z.enum(['devis', 'rendez-vous']),
  // Essentiels (requis)
  clientNom: z.string().min(2, 'Nom du client requis'),
  clientTelephone: z.string().min(6, 'Téléphone requis'),
  villeDepart: z.string().min(1, 'Ville de départ requise'),
  // Requise pour un déménagement (devis) ; facultative pour un rendez-vous (visite).
  villeArrivee: z.string().optional(),
  dateApprox: z.string().min(1, 'Date approximative requise'),
  // Optionnels (détails)
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  adresseDepart: z.string().optional(),
  adresseArrivee: z.string().optional(),
  typeBien: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.type === 'devis' && !(val.villeArrivee && val.villeArrivee.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['villeArrivee'], message: 'Ville d\'arrivée requise' })
  }
})

export type AgentDemandeInput = z.infer<typeof agentDemandeSchema>
