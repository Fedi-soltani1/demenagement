import { cx } from '@/lib/sectionOptions'

interface BlockSkeletonProps {
  height?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const HEIGHT_MAP = {
  sm:  'h-32',
  md:  'h-56',
  lg:  'h-80',
  xl:  'h-[480px]',
} as const

export function BlockSkeleton({ height = 'md', className }: BlockSkeletonProps) {
  return (
    <div
      className={cx(
        'w-full animate-pulse bg-[var(--color-bg-dark2)]',
        HEIGHT_MAP[height],
        className,
      )}
      aria-hidden="true"
    />
  )
}
