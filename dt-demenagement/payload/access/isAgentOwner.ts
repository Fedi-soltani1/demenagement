import type { Access } from 'payload'

type U = { collection?: string; id?: string | number; role?: string } | null | undefined

// Retourne le filtre d'accès Payload : true (super-admin voit tout), un `where`
// (l'agent ne voit que ses propres demandes), ou false (sinon).
export function agentOwnerWhere(user: U): true | { agent: { equals: string | number } } | false {
  if (!user) return false
  if ((user as { role?: string }).role === 'super-admin') return true
  if (user.collection === 'agents' && user.id != null) return { agent: { equals: user.id } }
  return false
}

export const isAgentOwner: Access = ({ req: { user } }) => agentOwnerWhere(user as U)
