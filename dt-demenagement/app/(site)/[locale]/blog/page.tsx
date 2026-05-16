import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Clock } from 'lucide-react'
import { LOCALES, COMPANY } from '@/lib/constants'

export const revalidate = 300

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home.blog' })
  return {
    title:       `${t('title')} — ${COMPANY.name}`,
    description: t('subtitle'),
  }
}

type CategoryDoc = { id: string; nom?: string | null }

type ArticleDoc = {
  id: string
  titre: string
  slug: string
  extrait?: string | null
  imageAlaUne?: { url?: string | null } | null
  categories?: CategoryDoc[] | null
  tempsLecture?: number | null
  datePublication?: string | null
  statut?: string
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Home.blog' })

  const payload = await getPayload({ config })
  const result  = await payload
    .find({
      collection: 'blog',
      where: { statut: { equals: 'publie' } },
      sort: '-datePublication',
      locale: locale as 'fr' | 'ar' | 'en',
      limit: 12,
      depth: 1,
    })
    .catch(() => ({ docs: [] as unknown[] }))

  const articles = result.docs as ArticleDoc[]

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-container bg-[var(--color-bg-dark)] text-center relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Grille articles */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid">
              {articles.map((article) => {
                const categorie = article.categories?.[0]?.nom ?? null
                return (
                  <article
                    key={article.id}
                    className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden hover:border-[var(--color-red)]/30 transition-colors duration-300"
                  >
                    <Link
                      href={`/${locale}/blog/${article.slug}`}
                      className="block relative aspect-[16/9] overflow-hidden"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {article.imageAlaUne?.url ? (
                        <Image
                          src={article.imageAlaUne.url}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--color-red)]/20 to-[var(--color-bg-dark)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {categorie && (
                        <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-[var(--color-red)] text-white font-body text-xs font-semibold">
                          {categorie}
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-3 mb-3 text-xs font-body text-[var(--color-text-muted)]">
                        {article.datePublication && (
                          <time dateTime={article.datePublication}>
                            {new Date(article.datePublication).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </time>
                        )}
                        {article.tempsLecture && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              {article.tempsLecture} {t('minRead')}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 leading-snug group-hover:text-[var(--color-red)] transition-colors duration-200 line-clamp-2">
                        <Link href={`/${locale}/blog/${article.slug}`}>{article.titre}</Link>
                      </h2>

                      {article.extrait && (
                        <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                          {article.extrait}
                        </p>
                      )}

                      <Link
                        href={`/${locale}/blog/${article.slug}`}
                        className="inline-flex items-center gap-1 text-[var(--color-red)] font-body text-sm font-medium mt-auto hover:gap-2 transition-all duration-200"
                        aria-label={`Lire l'article : ${article.titre}`}
                      >
                        {t('readMore')} →
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-body text-[var(--color-text-muted)] mb-6">
                Aucun article publié pour le moment.
              </p>
              <p className="font-body text-xs text-[var(--color-text-muted)]/60">
                {"L'administrateur peut ajouter des articles depuis /admin → Articles."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
