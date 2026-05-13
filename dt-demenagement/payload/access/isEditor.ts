import type { Access } from 'payload'

export const isEditor: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = (user as { role?: string }).role
  return role === 'admin' || role === 'editeur'
}
