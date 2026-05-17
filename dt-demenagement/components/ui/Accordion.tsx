'use client'

import { useState } from 'react'

interface AccordionItem {
  id: string
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
}

function Accordion({ items, allowMultiple = false, className = '' }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className={['divide-y divide-[var(--color-border)]', className].join(' ')}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id)
        const panelId = `accordion-panel-${item.id}`
        const triggerId = `accordion-trigger-${item.id}`

        return (
          <div key={item.id}>
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between py-5 text-start gap-4 group"
            >
              <span className="font-medium text-[var(--text)] font-[var(--font-body)] group-hover:text-[var(--color-red)] transition-colors">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className={[
                  'shrink-0 w-5 h-5 rounded-full border border-[var(--color-border)] flex items-center justify-center',
                  'transition-transform duration-300',
                  isOpen ? 'rotate-180 border-[var(--color-red)]' : '',
                ].join(' ')}
              >
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M1 1l4 4 4-4"
                    stroke={isOpen ? 'var(--color-red)' : 'var(--color-text-muted)'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
            >
              <div className="pb-5 text-[var(--color-text-muted)] text-sm leading-relaxed font-[var(--font-body)]">
                {item.answer}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Accordion }
export type { AccordionProps, AccordionItem }
