interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeMap = { sm: 14, md: 18, lg: 22 }

function StarRating({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  className = '',
}: StarRatingProps) {
  const px = sizeMap[size]
  const rounded = Math.round(rating * 2) / 2

  return (
    <span
      className={['inline-flex items-center gap-1', className].join(' ')}
      role="img"
      aria-label={`Note : ${rating} sur ${max} étoiles`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= rounded
        const half = !filled && i + 0.5 === rounded

        return (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#c9a84c" />
                <stop offset="50%" stopColor="#2a2a2a" />
              </linearGradient>
            </defs>
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              fill={
                filled
                  ? '#c9a84c'
                  : half
                    ? `url(#half-${i})`
                    : 'var(--color-border)'
              }
            />
          </svg>
        )
      })}

      {showValue ? (
        <span className="text-sm font-medium text-[var(--color-text-muted)] ms-1">
          {rating.toFixed(1)}
        </span>
      ) : null}
    </span>
  )
}

export { StarRating }
export type { StarRatingProps }
