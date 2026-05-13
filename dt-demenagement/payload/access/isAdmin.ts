import type { Access } from 'payload'

type UserWithRole = { role?: string; id?: string | number }

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && (user as UserWithRole).role === 'super-admin')
}

export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if ((user as UserWithRole).role === 'super-admin') return true
  return String((user as UserWithRole).id) === String(id)
}
