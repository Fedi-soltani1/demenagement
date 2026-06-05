import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_noStore as noStore } from 'next/cache'
import { Footer } from '@/components/layout/Footer'
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
  copyright?:        string | null
}

async function fetchAll(): Promise<{
  services: NavService[]
  villes:   NavVille[]
  pays:     NavPays[]
  settings: NavSettings
}> {
  noStore()
  const payload = await getPayload({ config })

  // ── Services — TOUJOURS tous les services publiés (indépendant de l'accueil) ──
  // Un nouveau service publié apparaît automatiquement dans le footer.
  let services: NavService[] = []
  try {
    const res = await payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: 'fr',
      limit: 30,
      select: { nom: true, slug: true },
      depth: 0,
    })
    services = (res.docs as ServiceDoc[])
      .filter((d) => d.nom && d.slug)
      .map((d) => ({ nom: d.nom!, slug: d.slug! }))
  } catch { /* garde la liste vide en cas d'erreur */ }

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
    const s = await payload.findGlobal({ slug: 'settings', locale: 'fr', depth: 1 }) as SettingsDoc
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
      copyright:        s.copyright       ?? null,
    }
  } catch { /* garde les fallbacks */ }

  return { services, villes, pays, settings }
}

export async function FooterServer() {
  const { services, villes, pays, settings } = await fetchAll()
  return <Footer services={services} villes={villes} pays={pays} settings={settings} />
}
