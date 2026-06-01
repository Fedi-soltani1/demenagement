import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_noStore as noStore } from 'next/cache'
import { Navbar } from '@/components/layout/Navbar'
import type { NavService, NavVille, NavPays, NavSettings, NavLien } from '@/components/layout/Navbar'
import { COMPANY, VILLES, PAYS } from '@/lib/constants'

type ServiceDoc = { id: string; nom?: string | null; slug?: string | null }
type VilleDoc   = { id: string; nom?: string | null; slug?: string | null }
type PaysDoc    = { id: string; nom?: string | null; slug?: string | null; drapeau?: string | null }
type SettingsDoc = {
  telephone1?:       string | null
  telephone2?:       string | null
  whatsapp?:         string | null
  whatsappMessage?:  string | null
  email?:            string | null
  adresse?:          string | null
  horaires?:         string | null
  facebook?:         string | null
  instagram?:        string | null
  tagline?:          string | null
  liensNavigation?:  Array<{ libelle?: string | null; chemin?: string | null; actif?: boolean | null }> | null
  logoImage?:        { url?: string | null } | null
  navbarCtaTexte?:   string | null
  navbarCtaLien?:    string | null
}

async function fetchAll(): Promise<{
  services: NavService[]
  villes:   NavVille[]
  pays:     NavPays[]
  settings: NavSettings
}> {
  noStore()
  const payload = await getPayload({ config })

  // ── Services (depuis page accueil ou fallback collection) ──────────────────
  let services: NavService[] = []
  try {
    const pageRes = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'accueil' } },
      locale: 'fr',
      limit: 1,
      depth: 2,
      draft: true,
    })
    const layout = (pageRes.docs[0] as { layout?: unknown[] } | undefined)?.layout ?? []
    const block = layout.find(
      (b): b is { blockType: string; services?: unknown[] } =>
        typeof b === 'object' && b !== null &&
        (b as { blockType?: string }).blockType === 'services'
    )
    const raw = block?.services ?? []
    const populated: NavService[] = []
    for (const s of raw) {
      if (typeof s === 'object' && s !== null) {
        const svc = s as { nom?: string | null; slug?: string | null }
        if (svc.nom && svc.slug) populated.push({ nom: svc.nom, slug: svc.slug })
      }
    }
    if (populated.length > 0) services = populated
  } catch { /* fallback ci-dessous */ }

  if (services.length === 0) {
    const res = await payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: 'fr',
      limit: 12,
      select: { nom: true, slug: true },
      depth: 0,
    })
    services = (res.docs as ServiceDoc[])
      .filter((d) => d.nom && d.slug)
      .map((d) => ({ nom: d.nom!, slug: d.slug! }))
  }

  // ── Villes publiées ────────────────────────────────────────────────────────
  let villes: NavVille[] = []
  try {
    const res = await payload.find({
      collection: 'villes',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: 'fr',
      limit: 24,
      select: { nom: true, slug: true },
      depth: 0,
    })
    villes = (res.docs as VilleDoc[])
      .filter((d) => d.nom && d.slug)
      .map((d) => ({ nom: d.nom!, slug: d.slug! }))
  } catch {
    villes = VILLES.map((v) => ({ nom: v.nom, slug: v.slug }))
  }

  // ── Pays ───────────────────────────────────────────────────────────────────
  let pays: NavPays[] = []
  try {
    const res = await payload.find({
      collection: 'pays',
      sort: 'nom',
      locale: 'fr',
      limit: 20,
      select: { nom: true, slug: true, drapeau: true },
      depth: 0,
    })
    pays = (res.docs as PaysDoc[])
      .filter((d) => d.nom && d.slug && d.drapeau)
      .map((d) => ({ nom: d.nom!, slug: d.slug!, drapeau: d.drapeau! }))
  } catch {
    pays = PAYS.map((p) => ({ nom: p.nom, slug: p.slug, drapeau: p.drapeau }))
  }

  // ── Settings global ────────────────────────────────────────────────────────
  let settings: NavSettings = {
    telephone1:      COMPANY.phone1,
    telephone2:      COMPANY.phone2,
    whatsapp:        COMPANY.whatsapp,
    whatsappMessage: COMPANY.whatsappMessage,
    email:           COMPANY.email,
    adresse:         COMPANY.address,
    facebook:        COMPANY.facebook,
    instagram:       COMPANY.instagram,
  }
  try {
    const s = await payload.findGlobal({ slug: 'settings', locale: 'fr', depth: 0 }) as SettingsDoc
    const liensNavigation: NavLien[] = Array.isArray(s.liensNavigation)
      ? (s.liensNavigation as Array<{ libelle?: string | null; chemin?: string | null; actif?: boolean | null }>)
          .filter((l) => l?.actif !== false && l?.libelle && l?.chemin)
          .map((l) => ({ libelle: l.libelle!, chemin: l.chemin! }))
      : []
    settings = {
      telephone1:       s.telephone1      || COMPANY.phone1,
      telephone2:       s.telephone2      || COMPANY.phone2,
      whatsapp:         s.whatsapp        || COMPANY.whatsapp,
      whatsappMessage:  s.whatsappMessage || COMPANY.whatsappMessage,
      email:            s.email           || COMPANY.email,
      adresse:          s.adresse         || COMPANY.address,
      horaires:         s.horaires        ?? null,
      facebook:         s.facebook        || COMPANY.facebook,
      instagram:        s.instagram       || COMPANY.instagram,
      tagline:          s.tagline         ?? null,
      liensNavigation:  liensNavigation.length > 0 ? liensNavigation : null,
      logoUrl:          s.logoImage?.url  ?? null,
      navbarCtaTexte:   s.navbarCtaTexte  ?? null,
      navbarCtaLien:    s.navbarCtaLien   ?? '/devis',
    }
  } catch { /* garde les fallbacks */ }

  return { services, villes, pays, settings }
}

export async function NavbarServer() {
  const { services, villes, pays, settings } = await fetchAll()
  return <Navbar services={services} villes={villes} pays={pays} settings={settings} />
}
