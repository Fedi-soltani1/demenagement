import { z } from 'zod'

// Formulaire progressif : essentiels requis, détails optionnels.
// Réutilisé côté client (formulaire app) ET serveur (validation à la création).
export const agentDemandeSchema = z.object({
  type: z.enum(['devis', 'rendez-vous']),
  // Essentiels (requis)
  clientNom: z.string().min(2, 'Nom du client requis'),
  clientTelephone: z.string().min(6, 'Téléphone requis'),
  villeDepart: z.string().min(1, 'Ville de départ requise'),
  villeArrivee: z.string().min(1, 'Ville d\'arrivée requise'),
  dateApprox: z.string().min(1, 'Date approximative requise'),
  // Optionnels (détails)
  clientEmail: z.string().email().optional().or(z.literal('')),
  adresseDepart: z.string().optional(),
  adresseArrivee: z.string().optional(),
  typeBien: z.string().optional(),
  volume: z.string().optional(),
  notes: z.string().optional(),
})

export type AgentDemandeInput = z.infer<typeof agentDemandeSchema>
