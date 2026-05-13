import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && (user as { role?: string }).role === 'admin')
}

export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if ((user as { role?: string }).role === 'admin') return true
  return user.id === id
}
