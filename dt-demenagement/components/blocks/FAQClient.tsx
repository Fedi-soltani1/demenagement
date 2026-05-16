'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Accordion } from '@/components/ui/Accordion'

export interface FAQItem {
  id: string
  question: string
  answer: string
  categorie: string
}

export interface FAQCategory {
  value: string
  label: string
}

interface FAQClientProps {
  items: FAQItem[]
  categories: FAQCategory[]
  labelAll: string
  emptyLabel: string
}

export function FAQClient({ items, categories, labelAll, emptyLabel }: FAQClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = activeCategory === 'all'
    ? items
    : items.filter((item) => item.categorie === activeCategory)

  const accordionItems = filtered.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }))

  return (
    <div>
      {/* Filtres par catégorie */}
      <div
        className="flex flex-wrap gap-3 mb-10"
        role="tablist"
        aria-label="Filtrer les questions par catégorie"
      >
        <button
          role="tab"
          aria-selected={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-dark)] ${
            activeCategory === 'all'
              ? 'bg-[var(--color-red)] text-white'
              : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-red)]/40 hover:text-[var(--color-text-light)]'
          }`}
        >
          {labelAll}
          <span className="ms-2 text-xs opacity-70">({items.length})</span>
        </button>

        {categories.map((cat) => {
          const count = items.filter((i) => i.categorie === cat.value).length
          if (count === 0) return null
          return (
            <button
              key={cat.value}
              role="tab"
              aria-selected={activeCategory === cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-dark)] ${
                activeCategory === cat.value
                  ? 'bg-[var(--color-red)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-red)]/40 hover:text-[var(--color-text-light)]'
              }`}
            >
              {cat.label}
              <span className="ms-2 text-xs opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Accordion filtré */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {accordionItems.length > 0 ? (
            <Accordion items={accordionItems} allowMultiple />
          ) : (
            <p className="font-body text-[var(--color-text-muted)] text-sm py-8 text-center">
              {emptyLabel}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
