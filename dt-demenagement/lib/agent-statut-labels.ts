// Jalons visibles par l'agent (correspondance avec les sous-statuts internes côté admin).
export const AGENT_STATUTS = ['soumise', 'vue', 'acceptee', 'refusee', 'realisee'] as const
export type AgentStatut = (typeof AGENT_STATUTS)[number]

const MAP: Record<AgentStatut, { label: string; color: string; etape: number }> = {
  soumise:  { label: 'Soumise',              color: '#a0a0a0', etape: 1 },
  vue:      { label: 'Vue par DT',           color: '#c9a84c', etape: 2 },
  acceptee: { label: 'Acceptée',             color: '#2e7d32', etape: 3 },
  refusee:  { label: 'Refusée',              color: '#b52027', etape: 3 },
  realisee: { label: 'Déménagement réalisé', color: '#2e7d32', etape: 4 },
}

export function agentStatutInfo(statut: string): { label: string; color: string; etape: number } {
  return MAP[statut as AgentStatut] ?? { label: 'Inconnu', color: '#a0a0a0', etape: 0 }
}
