import type { Payload } from 'payload'

// ─────────────────────────────────────────
// SEED DATA — DT DÉMÉNAGEMENT TUNISIE
// À exécuter une seule fois : pnpm payload seed
// ou via script : npx ts-node payload/seed.ts
// ─────────────────────────────────────────

const VILLES = [
  { nom: 'Tunis',       slug: 'tunis',       region: 'Nord',          lat: 36.8065,  lng: 10.1815 },
  { nom: 'Ariana',      slug: 'ariana',      region: 'Nord',          lat: 36.8663,  lng: 10.1647 },
  { nom: 'Ben Arous',   slug: 'ben-arous',   region: 'Nord',          lat: 36.7539,  lng: 10.2281 },
  { nom: 'La Manouba',  slug: 'la-manouba',  region: 'Nord',          lat: 36.8096,  lng: 10.0978 },
  { nom: 'Zaghouan',    slug: 'zaghouan',    region: 'Nord',          lat: 36.4027,  lng: 10.1427 },
  { nom: 'Nabeul',      slug: 'nabeul',      region: 'Nord-Est',      lat: 36.4561,  lng: 10.7376 },
  { nom: 'Bizerte',     slug: 'bizerte',     region: 'Nord',          lat: 37.2746,  lng: 9.8739  },
  { nom: 'Béja',        slug: 'beja',        region: 'Nord-Ouest',    lat: 36.7256,  lng: 9.1817  },
  { nom: 'Jendouba',    slug: 'jendouba',    region: 'Nord-Ouest',    lat: 36.5013,  lng: 8.7803  },
  { nom: 'Le Kef',      slug: 'le-kef',      region: 'Nord-Ouest',    lat: 36.1824,  lng: 8.7147  },
  { nom: 'Siliana',     slug: 'siliana',     region: 'Centre',        lat: 36.0848,  lng: 9.3705  },
  { nom: 'Kairouan',    slug: 'kairouan',    region: 'Centre',        lat: 35.6781,  lng: 10.0963 },
  { nom: 'Kassérine',   slug: 'kasserine',   region: 'Centre-Ouest',  lat: 35.1724,  lng: 8.8365  },
  { nom: 'Sidi Bouzid', slug: 'sidi-bouzid', region: 'Centre',        lat: 35.0382,  lng: 9.4850  },
  { nom: 'Sousse',      slug: 'sousse',      region: 'Centre-Est',    lat: 35.8256,  lng: 10.6369 },
  { nom: 'Monastir',    slug: 'monastir',    region: 'Centre-Est',    lat: 35.7770,  lng: 10.8262 },
  { nom: 'Mahdia',      slug: 'mahdia',      region: 'Centre-Est',    lat: 35.5046,  lng: 11.0622 },
  { nom: 'Sfax',        slug: 'sfax',        region: 'Sud-Est',       lat: 34.7400,  lng: 10.7601 },
  { nom: 'Gafsa',       slug: 'gafsa',       region: 'Sud-Ouest',     lat: 34.4250,  lng: 8.7842  },
  { nom: 'Tozeur',      slug: 'tozeur',      region: 'Sud-Ouest',     lat: 33.9197,  lng: 8.1335  },
  { nom: 'Kébili',      slug: 'kebili',      region: 'Sud',           lat: 33.7042,  lng: 8.9705  },
  { nom: 'Gabès',       slug: 'gabes',       region: 'Sud-Est',       lat: 33.8814,  lng: 10.0982 },
  { nom: 'Médenine',    slug: 'medenine',    region: 'Sud-Est',       lat: 33.3547,  lng: 10.5053 },
  { nom: 'Tataouine',   slug: 'tataouine',   region: 'Sud',           lat: 32.9213,  lng: 10.4509 },
] as const

const PAYS = [
  { nom: 'France',      slug: 'france',      drapeau: '🇫🇷', lat: 46.2276,  lng: 2.2137   },
  { nom: 'Allemagne',   slug: 'allemagne',   drapeau: '🇩🇪', lat: 51.1657,  lng: 10.4515  },
  { nom: 'Belgique',    slug: 'belgique',    drapeau: '🇧🇪', lat: 50.5039,  lng: 4.4699   },
  { nom: 'Italie',      slug: 'italie',      drapeau: '🇮🇹', lat: 41.8719,  lng: 12.5674  },
  { nom: 'Luxembourg',  slug: 'luxembourg',  drapeau: '🇱🇺', lat: 49.8153,  lng: 6.1296   },
  { nom: 'Portugal',    slug: 'portugal',    drapeau: '🇵🇹', lat: 39.3999,  lng: -8.2245  },
  { nom: 'Suède',       slug: 'suede',       drapeau: '🇸🇪', lat: 60.1282,  lng: 18.6435  },
  { nom: 'Espagne',     slug: 'espagne',     drapeau: '🇪🇸', lat: 40.4637,  lng: -3.7492  },
  { nom: 'Malte',       slug: 'malte',       drapeau: '🇲🇹', lat: 35.9375,  lng: 14.3754  },
] as const

const SERVICES = [
  {
    nom: 'Transporteur en Tunisie',
    slug: 'transporteur-en-tunisie',
    description: 'Service de déménagement professionnel sur tout le territoire tunisien.',
    icone: 'truck',
  },
  {
    nom: 'Transfert Entreprises',
    slug: 'transfert-entreprises',
    description: 'Déménagement d\'entreprise, bureaux et locaux commerciaux.',
    icone: 'building',
  },
  {
    nom: 'Location Monte-Meubles',
    slug: 'location-monte-meubles',
    description: 'Location de monte-meubles professionnel pour faciliter le déménagement.',
    icone: 'crane',
  },
  {
    nom: 'Gardes Meubles',
    slug: 'gardes-meubles',
    description: 'Stockage sécurisé de vos meubles et effets personnels.',
    icone: 'warehouse',
  },
  {
    nom: 'Services Emballage',
    slug: 'services-emballage',
    description: 'Emballage professionnel de vos affaires pour un déménagement sécurisé.',
    icone: 'package',
  },
  {
    nom: 'Montage & Démontage',
    slug: 'montage-demontage',
    description: 'Service professionnel de montage et démontage de meubles.',
    icone: 'tool',
  },
] as const

export async function seed(payload: Payload): Promise<void> {
  payload.logger.info('🌱 Démarrage du seed...')

  // ── Villes ────────────────────────────────────────────────────────────────
  payload.logger.info(`📍 Seed villes (${VILLES.length})...`)
  for (const ville of VILLES) {
    const existing = await payload.find({
      collection: 'villes',
      where: { slug: { equals: ville.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'villes',
        data: {
          nom: ville.nom,
          slug: ville.slug,
          region: ville.region,
          coordonnees: { lat: ville.lat, lng: ville.lng },
          servicesDisponibles: [
            'transporteur-en-tunisie',
            'services-emballage',
            'montage-demontage',
          ],
          publie: true,
        },
      })
      payload.logger.info(`  ✅ Ville créée : ${ville.nom}`)
    } else {
      payload.logger.info(`  ⏭️  Ville déjà existante : ${ville.nom}`)
    }
  }

  // ── Pays ──────────────────────────────────────────────────────────────────
  payload.logger.info(`🌍 Seed pays (${PAYS.length})...`)
  for (const pays of PAYS) {
    const existing = await payload.find({
      collection: 'pays',
      where: { slug: { equals: pays.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'pays',
        data: {
          nom: pays.nom,
          slug: pays.slug,
          drapeau: pays.drapeau,
          coordonnees: { lat: pays.lat, lng: pays.lng },
          publie: true,
        },
      })
      payload.logger.info(`  ✅ Pays créé : ${pays.nom}`)
    } else {
      payload.logger.info(`  ⏭️  Pays déjà existant : ${pays.nom}`)
    }
  }

  // ── Services ──────────────────────────────────────────────────────────────
  payload.logger.info(`🔧 Seed services (${SERVICES.length})...`)
  for (const service of SERVICES) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: service.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'services',
        data: {
          nom: service.nom,
          slug: service.slug,
          description: service.description,
          icone: service.icone,
          publie: true,
        },
      })
      payload.logger.info(`  ✅ Service créé : ${service.nom}`)
    } else {
      payload.logger.info(`  ⏭️  Service déjà existant : ${service.nom}`)
    }
  }

  // ── Admin par défaut ──────────────────────────────────────────────────────
  payload.logger.info('👤 Seed admin par défaut...')
  const adminsExisting = await payload.find({
    collection: 'admins',
    limit: 1,
  })

  if (adminsExisting.docs.length === 0) {
    await payload.create({
      collection: 'admins',
      data: {
        nom: 'Admin',
        prenom: 'DT',
        email: 'admin@demenagement.tn',
        password: 'ChangeMe2026!',
        role: 'super-admin',
      },
    })
    payload.logger.info('  ✅ Admin créé : admin@demenagement.tn / ChangeMe2026!')
    payload.logger.info('  ⚠️  IMPORTANT : Changer le mot de passe immédiatement après connexion!')
  } else {
    payload.logger.info('  ⏭️  Admin déjà existant')
  }

  payload.logger.info('✅ Seed terminé.')
}
