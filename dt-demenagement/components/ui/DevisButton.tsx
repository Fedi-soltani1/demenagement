'use client'

import type { ReactNode } from 'react'
import { useDevisModal } from '@/components/layout/DevisModal'

interface DevisButtonProps {
  children:  ReactNode
  className?: string
  ville?:     string
}

export function DevisButton({ children, className, ville }: DevisButtonProps) {
  const { open } = useDevisModal()
  return (
    <button
      type="button"
      onClick={() => open({ ville })}
      className={className}
    >
      {children}
    </button>
  )
}
