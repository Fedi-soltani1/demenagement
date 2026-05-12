import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const t = useTranslations('Layout')

  return (
    <nav
      aria-label={t('breadcrumbLabel')}
      className={['text-sm', className].filter(Boolean).join(' ')}
    >
      <ol
        className="flex flex-wrap items-center gap-1.5"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Home */}
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            itemProp="item"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-red)] rounded"
          >
            <span itemProp="name">{t('home')}</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, index) => (
          <li
            key={index}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-1.5"
          >
            {/* Separator */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-[var(--color-border)] rtl:rotate-180"
            >
              <path d="M4.5 2.5l3 3.5-3 3.5" />
            </svg>

            {item.href ? (
              <Link
                href={item.href}
                itemProp="item"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-red)] rounded"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span
                itemProp="name"
                aria-current="page"
                className="text-[var(--color-text-light)] font-medium"
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
export type { BreadcrumbItem, BreadcrumbProps }
