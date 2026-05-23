'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  locale: string
  label: string
}

export function SignOutButton({ locale, label }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/connexion` })}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-red)]/20 hover:text-[var(--color-red)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  )
}
