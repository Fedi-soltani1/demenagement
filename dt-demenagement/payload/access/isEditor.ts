import type { Access } from 'payload'

type UserWithRole = { role?: string }

export const isEditor: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = (user as UserWithRole).role
  return role === 'super-admin' || role === 'editeur'
}
