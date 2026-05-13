import type { Access } from 'payload'

export const isClient: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const isClientOwner: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if ((user as { role?: string }).role === 'admin') return true
  return user.id === id
}
