import type { Access } from 'payload'

type UserWithRole = { role?: string; id?: string | number }

export const isClient: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const isClientOwner: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if ((user as UserWithRole).role === 'super-admin') return true
  return String((user as UserWithRole).id) === String(id)
}

// Accès commercial : super-admin + commercial (gestion des dossiers)
export const isCommercial: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = (user as UserWithRole).role
  return role === 'super-admin' || role === 'commercial'
}
