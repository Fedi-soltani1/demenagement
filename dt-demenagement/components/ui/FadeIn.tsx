'use client'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function FadeIn({
  children,
  delay = 0,
  className,
  direction = 'up',
}: FadeInProps) {
  const initial: Record<string, number> = { opacity: 0 }
  if (direction === 'up')    { initial['y'] = 28 }
  if (direction === 'down')  { initial['y'] = -28 }
  if (direction === 'left')  { initial['x'] = 28 }
  if (direction === 'right') { initial['x'] = -28 }

  const animate: Record<string, number> = { opacity: 1, y: 0, x: 0 }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
