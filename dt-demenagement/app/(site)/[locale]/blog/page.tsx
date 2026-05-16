import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Clock } from 'lucide-react'
import { LOCALES, COMPANY } from '@/lib/constants'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home.blog' })
  return {
    title: `${t('title')} — ${COMPANY.name}`,
  }
}

const ARTICLES = [
  { id: '1', titre: 'Comment bien préparer son déménagement : le guide complet',     slug: 'preparer-demenagement-guide-complet', extrait: 'Découvrez nos conseils d\'experts pour organiser votre déménagement de A à Z sans stress.', categorie: 'Conseils',       tempsLecture: 8,  datePublication: '2026-04-15', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { id: '2', titre: 'Déménager de Tunisie vers la France : tout ce qu\'il faut savoir', slug: 'demenager-tunisie-france-guide',         extrait: 'Formalités douanières, transport, assurance — guide pratique pour votre déménagement international.', categorie: 'International', tempsLecture: 12, datePublication: '2026-03-22', imageUrl: 'https://images.unsplash.com/photo-1499914485622-a88fac536970?w=800&q=80' },
  { id: '3', titre: '10 erreurs à éviter lors d\'un déménagement d\'entreprise',        slug: 'erreurs-demenagement-entreprise',        extrait: 'Les professionnels DT partagent les pièges les plus courants et comment les éviter.', categorie: 'Entreprises',   tempsLecture: 6,  datePublication: '2026-02-10', imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80' },
  { id: '4', titre: 'Checklist déménagement : les 50 étapes à ne pas oublier',        slug: 'checklist-demenagement-50-etapes',      extrait: 'Une liste complète pour ne rien oublier avant, pendant et après votre déménagement.', categorie: 'Conseils',       tempsLecture: 10, datePublication: '2026-01-05', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
  { id: '5', titre: 'Garde-meuble : quand et comment en louer un ?',                   slug: 'guide-garde-meuble-tunisie',            extrait: 'Tout ce que vous devez savoir sur la location d\'un espace de stockage en Tunisie.', categorie: 'Services',       tempsLecture: 7,  datePublication: '2025-12-18', imageUrl: 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=800&q=80' },
  { id: '6', titre: 'Emballer ses affaires : les techniques des professionnels',       slug: 'techniques-emballage-professionnels',   extrait: 'Protégez vos objets fragiles avec les méthodes utilisées par les déménageurs experts.', categorie: 'Conseils',       tempsLecture: 5,  datePublication: '2025-11-30', imageUrl: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800&q=80' },
]

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Home.blog' })

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-container bg-[var(--color-bg-dark)] text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
          {t('badge')}
        </span>
        <h1
          className="font-heading font-bold text-[var(--color-text-light)] mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          {t('title')}
        </h1>
      </section>

      {/* Grille articles */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden hover:border-[var(--color-red)]/30 transition-colors duration-300"
            >
              <Link href={`/${locale}/blog/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden" tabIndex={-1} aria-hidden="true">
                <Image src={article.imageUrl} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-[var(--color-red)] text-white font-body text-xs font-semibold">
                  {article.categorie}
                </span>
              </Link>

              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 mb-3 text-xs font-body text-[var(--color-text-muted)]">
                  <time dateTime={article.datePublication}>
                    {new Date(article.datePublication).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {article.tempsLecture} {t('minRead')}
                  </span>
                </div>

                <h2 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 leading-snug group-hover:text-[var(--color-red)] transition-colors duration-200 line-clamp-2">
                  <Link href={`/${locale}/blog/${article.slug}`}>{article.titre}</Link>
                </h2>

                <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-5 flex-1 line-clamp-3">
                  {article.extrait}
                </p>

                <Link
                  href={`/${locale}/blog/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-[var(--color-red)] font-body text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
                >
                  {t('readMore')} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
