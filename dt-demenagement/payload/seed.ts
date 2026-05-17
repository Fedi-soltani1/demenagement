import type { Payload } from 'payload'

// ─────────────────────────────────────────────────────────────
// SEED COMPLET — DT DÉMÉNAGEMENT TUNISIE
// Lance via : pnpm seed  (le serveur doit tourner sur :3000)
// ─────────────────────────────────────────────────────────────

// Helpers Lexical richText
function lexicalParagraph(text: string) {
  return {
    root: {
      children: [{
        children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
        direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1,
      }],
      direction: 'ltr', format: '', indent: 0, type: 'root', version: 1,
    },
  }
}

// ── Données ────────────────────────────────────────────────────────────────

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
    description: 'Service de déménagement professionnel sur tout le territoire tunisien. Nos équipes interviennent dans les 24 gouvernorats avec des camions adaptés à chaque volume.',
    icone: 'Truck',
    tarifDepuis: 150,
    ordre: 1,
  },
  {
    nom: 'Transfert Entreprises',
    slug: 'transfert-entreprises',
    description: 'Déménagement d\'entreprise, bureaux, locaux commerciaux et entrepôts. Planning sur mesure pour minimiser l\'interruption de votre activité.',
    icone: 'Building2',
    tarifDepuis: 500,
    ordre: 2,
  },
  {
    nom: 'Location Monte-Meubles',
    slug: 'location-monte-meubles',
    description: 'Location de monte-meubles professionnel pour les étages élevés ou les passages étroits. Idéal pour les appartements sans ascenseur.',
    icone: 'ArrowUpFromLine',
    tarifDepuis: 80,
    ordre: 3,
  },
  {
    nom: 'Garde-Meubles',
    slug: 'gardes-meubles',
    description: 'Stockage sécurisé de vos meubles et effets personnels. Entrepôts climatisés, surveillance 24h/24, accès flexible.',
    icone: 'Warehouse',
    tarifDepuis: 50,
    ordre: 4,
  },
  {
    nom: 'Service Emballage',
    slug: 'services-emballage',
    description: 'Emballage professionnel de vos affaires par nos experts. Cartons renforcés, protection spéciale pour les objets fragiles et précieux.',
    icone: 'Package',
    tarifDepuis: 30,
    ordre: 5,
  },
  {
    nom: 'Montage & Démontage',
    slug: 'montage-demontage',
    description: 'Service professionnel de montage et démontage de tous types de meubles. Cuisine, armoires, bibliothèques, lits — nous gérons tout.',
    icone: 'Wrench',
    tarifDepuis: 40,
    ordre: 6,
  },
] as const

const FAQ_ITEMS = [
  // Tarifs & Devis
  {
    question: 'Comment obtenir un devis gratuit ?',
    reponse: 'Vous pouvez obtenir un devis gratuit en remplissant notre formulaire en ligne, en nous appelant au +216 52 880 311 ou via WhatsApp. Nous vous répondons sous 2h en moyenne.',
    categorie: 'tarifs-devis', ordre: 1,
  },
  {
    question: 'Quels sont vos tarifs pour un déménagement à Tunis ?',
    reponse: 'Nos tarifs dépendent du volume à déménager, de la distance, et des services souhaités. Un déménagement standard (studio à Tunis) commence à partir de 150 TND. Demandez votre devis personnalisé gratuit.',
    categorie: 'tarifs-devis', ordre: 2,
  },
  {
    question: 'Le devis est-il sans engagement ?',
    reponse: 'Oui, notre devis est totalement gratuit et sans aucun engagement de votre part. Vous êtes libre d\'accepter ou de refuser notre proposition.',
    categorie: 'tarifs-devis', ordre: 3,
  },
  // Déroulement
  {
    question: 'Comment se déroule un déménagement avec DT ?',
    reponse: 'Notre processus est en 4 étapes : 1) Devis gratuit, 2) Visite technique si nécessaire, 3) Jour du déménagement avec notre équipe, 4) Installation dans votre nouveau logement. Nous gérons tout de A à Z.',
    categorie: 'deroulement', ordre: 1,
  },
  {
    question: 'Combien de temps dure un déménagement ?',
    reponse: 'La durée dépend du volume. Un studio prend généralement 3 à 4 heures. Un appartement F3 prend une demi-journée. Une maison complète peut nécessiter une journée entière ou deux jours.',
    categorie: 'deroulement', ordre: 2,
  },
  {
    question: 'Faut-il être présent le jour du déménagement ?',
    reponse: 'Nous recommandons votre présence (ou celle d\'un représentant) au départ et à l\'arrivée pour vérifier l\'état des biens. Entre les deux, vous pouvez nous confier les clés en toute sécurité.',
    categorie: 'deroulement', ordre: 3,
  },
  // Services
  {
    question: 'Proposez-vous le service d\'emballage ?',
    reponse: 'Oui, nous proposons un service d\'emballage complet. Nos emballeurs professionnels s\'occupent de tout : cartons, papier bulle, couvertures de protection pour meubles. Prix à partir de 30 TND.',
    categorie: 'services', ordre: 1,
  },
  {
    question: 'Avez-vous un service de garde-meubles ?',
    reponse: 'Oui, nous disposons d\'entrepôts sécurisés et climatisés à Tunis. Vous pouvez stocker vos affaires de quelques jours à plusieurs mois. Accès possible sur rendez-vous.',
    categorie: 'services', ordre: 2,
  },
  // International
  {
    question: 'Effectuez-vous des déménagements vers l\'Europe ?',
    reponse: 'Oui, nous effectuons des déménagements depuis la Tunisie vers la France, l\'Allemagne, la Belgique, l\'Italie, le Luxembourg, l\'Espagne, le Portugal, la Suède et Malte. Délai moyen : 7 à 15 jours.',
    categorie: 'international', ordre: 1,
  },
  {
    question: 'Comment se déroule un déménagement international ?',
    reponse: 'Pour l\'international, nous gérons le transport, les formalités douanières tunisiennes et européennes, l\'assurance trajet et la livraison à domicile dans le pays de destination.',
    categorie: 'international', ordre: 2,
  },
  // Espace Client
  {
    question: 'Comment suivre mon déménagement en ligne ?',
    reponse: 'Connectez-vous à votre espace client sur notre site. Vous pouvez suivre l\'état de votre déménagement en temps réel, télécharger vos documents et contacter directement votre équipe dédiée.',
    categorie: 'espace-client', ordre: 1,
  },
] as const

const PARTNERS = [
  { nom: 'UK Embassy',           lien: 'https://www.gov.uk',           ordre: 1  },
  { nom: 'Qatar Airways',        lien: 'https://www.qatarairways.com', ordre: 2  },
  { nom: 'Union Européenne',     lien: 'https://european-union.europa.eu', ordre: 3 },
  { nom: 'Tunisair',             lien: 'https://www.tunisair.com',     ordre: 4  },
  { nom: 'Banque Zitouna',       lien: 'https://www.banquezitouna.com', ordre: 5 },
  { nom: 'ICRC',                 lien: 'https://www.icrc.org',         ordre: 6  },
  { nom: 'ODDO BHF',             lien: 'https://www.oddo-bhf.com',     ordre: 7  },
  { nom: 'Expertise France',     lien: 'https://www.expertisefrance.fr', ordre: 8 },
  { nom: 'JCC',                  lien: null,                           ordre: 9  },
  { nom: 'Ministère Environnement', lien: null,                        ordre: 10 },
] as const

const CATEGORIES = [
  { nom: 'Conseils déménagement', slug: 'conseils-demenagement', couleur: '#b52027' },
  { nom: 'International',         slug: 'international',         couleur: '#c9a84c' },
  { nom: 'Entreprises',           slug: 'entreprises',           couleur: '#2563eb' },
  { nom: 'Guides pratiques',      slug: 'guides-pratiques',      couleur: '#16a34a' },
  { nom: 'Actualités',            slug: 'actualites',            couleur: '#7c3aed' },
] as const

const BLOG_ARTICLES = [
  {
    titre: 'Comment bien préparer son déménagement : le guide complet',
    slug: 'preparer-demenagement-guide-complet',
    extrait: 'Découvrez nos conseils d\'experts pour organiser votre déménagement de A à Z sans stress. Checklist, timing et astuces de pros.',
    contenu: 'Préparer un déménagement est une étape cruciale qui demande organisation et méthode. Voici les étapes clés : commencer 6 à 8 semaines avant le jour J, trier et désencombrer, réserver votre déménageur, informer les organismes (banque, administration, poste), emballer méthodiquement en étiquetant chaque carton. Notre équipe DT Déménagement est là pour vous accompagner à chaque étape.',
    categorieSlug: 'conseils-demenagement',
    tempsLecture: 8,
    datePublication: '2026-04-15T08:00:00.000Z',
  },
  {
    titre: 'Déménager de Tunisie vers la France : tout ce qu\'il faut savoir',
    slug: 'demenager-tunisie-france-guide',
    extrait: 'Formalités douanières, transport, assurance, délais — guide pratique complet pour votre déménagement international de Tunisie vers la France.',
    contenu: 'Un déménagement international entre la Tunisie et la France requiert une préparation rigoureuse. Il faut prévoir : la liste détaillée des biens (inventaire douanier), les documents nécessaires (titre de séjour, contrat de travail ou preuve d\'études), le choix entre groupage et camion dédié, l\'assurance transport. DT Déménagement gère l\'ensemble des formalités et livraisons à domicile dans toute la France. Délai moyen : 7 à 15 jours.',
    categorieSlug: 'international',
    tempsLecture: 12,
    datePublication: '2026-03-22T08:00:00.000Z',
  },
  {
    titre: '10 erreurs à éviter lors d\'un déménagement d\'entreprise',
    slug: 'erreurs-demenagement-entreprise',
    extrait: 'Les professionnels DT partagent les 10 pièges les plus courants lors d\'un déménagement d\'entreprise et comment les éviter pour minimiser l\'arrêt d\'activité.',
    contenu: 'Un déménagement d\'entreprise mal planifié peut coûter cher. Les erreurs les plus fréquentes : ne pas commencer la planification assez tôt (prévoyez 3 à 6 mois), ne pas impliquer les équipes IT pour les serveurs et câblages, oublier de notifier les clients et fournisseurs, négliger l\'étiquetage du matériel, ne pas assurer les équipements. DT Déménagement propose un service clé en main pour les transferts d\'entreprises avec un planning sur mesure.',
    categorieSlug: 'entreprises',
    tempsLecture: 6,
    datePublication: '2026-02-10T08:00:00.000Z',
  },
  {
    titre: 'Comment emballer vos objets fragiles comme un pro',
    slug: 'emballer-objets-fragiles',
    extrait: 'Vaisselle, œuvres d\'art, électronique, miroirs — nos experts vous dévoilent les techniques professionnelles pour emballer vos objets fragiles sans risque.',
    contenu: 'L\'emballage des objets fragiles est un art. Voici les règles d\'or : utiliser du papier bulle en double couche pour la vaisselle, emballer chaque pièce individuellement, garnir le fond des cartons avec de la mousse, ne jamais laisser d\'espace vide (combler avec du papier froissé), étiqueter "FRAGILE" sur les 4 faces et le dessus. Pour les œuvres d\'art et miroirs, nous recommandons nos caisses sur mesure. Demandez notre service emballage complet à partir de 30 TND.',
    categorieSlug: 'conseils-demenagement',
    tempsLecture: 5,
    datePublication: '2026-01-20T08:00:00.000Z',
  },
  {
    titre: 'Déménager à Tunis : les quartiers et nos conseils pratiques',
    slug: 'demenager-tunis-quartiers-conseils',
    extrait: 'Cité El Khadra, La Marsa, Ennasr, El Menzah — guide complet pour bien choisir votre quartier à Tunis et organiser votre déménagement dans la capitale.',
    contenu: 'Tunis est une ville aux multiples visages. Chaque quartier a ses caractéristiques : La Marsa et Sidi Bou Saïd pour le bord de mer et la tranquillité, Ennasr et El Menzah pour les familles avec enfants et les commodités modernes, La Soukra pour les grandes villas, le centre-ville pour la proximité des transports. Notre équipe intervient dans tous les quartiers du Grand Tunis 7j/7. Devis gratuit sous 2h.',
    categorieSlug: 'guides-pratiques',
    tempsLecture: 7,
    datePublication: '2026-05-01T08:00:00.000Z',
  },
] as const

const TESTIMONIALS = [
  {
    nom: 'Sami Ben Ali',
    ville: 'Tunis',
    note: '5',
    texte: 'Déménagement parfait ! L\'équipe était ponctuelle, soigneuse et très professionnelle. Mes meubles sont arrivés sans aucune égratignure. Je recommande vivement DT Déménagement.',
    ordre: 1,
  },
  {
    nom: 'Leila Mansouri',
    ville: 'Sousse',
    note: '5',
    texte: 'Service exceptionnel. Ils ont géré mon déménagement de Sousse à Tunis en une seule journée. Équipe sympathique, rapide et efficace. Prix très compétitif par rapport à la concurrence.',
    ordre: 2,
  },
  {
    nom: 'Mohamed Trabelsi',
    ville: 'Sfax',
    note: '5',
    texte: 'J\'ai fait appel à DT pour déménager mon bureau à Sfax. Organisation impeccable, aucune interruption de mon activité. Le service emballage était parfait pour mon matériel informatique.',
    ordre: 3,
  },
  {
    nom: 'Amira Khelifi',
    ville: 'Ariana',
    note: '5',
    texte: 'Très satisfaite ! Devis rapide, équipe aimable et professionnelle. Le monte-meubles était parfait pour mon appartement au 5ème étage. Je referai appel à eux sans hésiter.',
    ordre: 4,
  },
  {
    nom: 'Karim Bouzidi',
    ville: 'France (depuis Tunis)',
    note: '5',
    texte: 'DT a géré mon déménagement de Tunis vers Lyon. Toutes les formalités douanières prises en charge. Mes affaires sont arrivées en parfait état en moins de 10 jours. Merci !',
    ordre: 5,
  },
] as const

// ── Seed principal ──────────────────────────────────────────────────────────

export async function seed(payload: Payload): Promise<void> {
  payload.logger.info('🌱 ═══════════════════════════════════════')
  payload.logger.info('🌱  SEED DT DÉMÉNAGEMENT — DÉMARRAGE')
  payload.logger.info('🌱 ═══════════════════════════════════════')

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  payload.logger.info('\n👤 [1/9] Admin par défaut...')
  const adminsExisting = await payload.find({ collection: 'admins', limit: 1 })
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
    payload.logger.info('  ✅ Admin créé — email: admin@demenagement.tn / mdp: ChangeMe2026!')
    payload.logger.info('  ⚠️  CHANGER LE MOT DE PASSE IMMÉDIATEMENT dans /admin')
  } else {
    payload.logger.info('  ⏭️  Admin déjà existant')
  }

  // ── 2. Settings Global ────────────────────────────────────────────────────
  payload.logger.info('\n⚙️  [2/9] Settings global...')
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      telephone1:      '+21652880311',
      telephone2:      '+21652880112',
      whatsapp:        '+21652880311',
      whatsappMessage: 'Bonjour, je souhaite obtenir un devis pour mon déménagement.',
      email:           'contact@demenagement.tn',
      adresse:         'Tunis, Tunisie',
      horaires:        'Lun – Sam : 08h00 – 18h00\nDimanche : Sur rendez-vous',
      facebook:        'https://www.facebook.com/dtdemenagementtunisie',
      instagram:       'https://www.instagram.com/dtdemenagement',
      chatActif:       true,
      whatsappActif:   true,
      maintenanceMode: false,
    },
  })
  payload.logger.info('  ✅ Settings mis à jour (téléphone, email, horaires, réseaux sociaux)')

  // ── 3. Villes ─────────────────────────────────────────────────────────────
  payload.logger.info(`\n📍 [3/9] Villes (${VILLES.length})...`)
  for (const ville of VILLES) {
    const existing = await payload.find({ collection: 'villes', where: { slug: { equals: ville.slug } }, limit: 1 })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'villes',
        data: {
          nom: ville.nom,
          slug: ville.slug,
          region: ville.region,
          coordonnees: { lat: ville.lat, lng: ville.lng },
          publie: true,
        },
      })
      payload.logger.info(`  ✅ ${ville.nom}`)
    } else {
      payload.logger.info(`  ⏭️  ${ville.nom} (déjà existante)`)
    }
  }

  // ── 4. Pays ───────────────────────────────────────────────────────────────
  payload.logger.info(`\n🌍 [4/9] Pays (${PAYS.length})...`)
  for (const pays of PAYS) {
    const existing = await payload.find({ collection: 'pays', where: { slug: { equals: pays.slug } }, limit: 1 })
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
      payload.logger.info(`  ✅ ${pays.nom} ${pays.drapeau}`)
    } else {
      payload.logger.info(`  ⏭️  ${pays.nom} (déjà existant)`)
    }
  }

  // ── 5. Services ───────────────────────────────────────────────────────────
  payload.logger.info(`\n🔧 [5/9] Services (${SERVICES.length})...`)
  for (const service of SERVICES) {
    const existing = await payload.find({ collection: 'services', where: { slug: { equals: service.slug } }, limit: 1 })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'services',
        data: {
          nom: service.nom,
          slug: service.slug,
          description: service.description,
          icone: service.icone,
          tarifDepuis: service.tarifDepuis,
          ordre: service.ordre,
          publie: true,
        },
      })
      payload.logger.info(`  ✅ ${service.nom}`)
    } else {
      payload.logger.info(`  ⏭️  ${service.nom} (déjà existant)`)
    }
  }

  // ── 6. FAQ ────────────────────────────────────────────────────────────────
  payload.logger.info(`\n❓ [6/9] FAQ (${FAQ_ITEMS.length} questions)...`)
  for (const item of FAQ_ITEMS) {
    const existing = await payload.find({
      collection: 'faq',
      where: { question: { equals: item.question } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'faq',
        data: {
          question: item.question,
          reponse: lexicalParagraph(item.reponse),
          categorie: item.categorie,
          ordre: item.ordre,
          publie: true,
        },
      })
      payload.logger.info(`  ✅ ${item.question.substring(0, 50)}...`)
    } else {
      payload.logger.info(`  ⏭️  Déjà existante : ${item.question.substring(0, 40)}...`)
    }
  }

  // ── 7. Partenaires ───────────────────────────────────────────────────────
  payload.logger.info(`\n🤝 [7/10] Partenaires (${PARTNERS.length})...`)
  for (const partner of PARTNERS) {
    const existing = await payload.find({ collection: 'partners', where: { nom: { equals: partner.nom } }, limit: 1 })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'partners',
        data: {
          nom: partner.nom,
          lien: partner.lien ?? undefined,
          ordre: partner.ordre,
          publie: true,
        },
      })
      payload.logger.info(`  ✅ ${partner.nom}`)
    } else {
      payload.logger.info(`  ⏭️  ${partner.nom} (déjà existant)`)
    }
  }

  // ── 8. Catégories blog ────────────────────────────────────────────────────
  payload.logger.info(`\n🏷️  [8/10] Catégories (${CATEGORIES.length})...`)
  const categoryIds: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: cat.slug } }, limit: 1 })
    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'categories',
        data: { nom: cat.nom, slug: cat.slug, couleur: cat.couleur },
      })
      categoryIds[cat.slug] = created.id as string
      payload.logger.info(`  ✅ ${cat.nom}`)
    } else {
      categoryIds[cat.slug] = (existing.docs[0]?.id ?? '') as string
      payload.logger.info(`  ⏭️  ${cat.nom} (déjà existante)`)
    }
  }

  // ── 8. Articles de blog ───────────────────────────────────────────────────
  payload.logger.info(`\n📝 [9/10] Articles de blog (${BLOG_ARTICLES.length})...`)
  for (const article of BLOG_ARTICLES) {
    const existing = await payload.find({ collection: 'blog', where: { slug: { equals: article.slug } }, limit: 1 })
    if (existing.docs.length === 0) {
      const catId = categoryIds[article.categorieSlug]
      await payload.create({
        collection: 'blog',
        data: {
          titre: article.titre,
          slug: article.slug,
          extrait: article.extrait,
          contenu: lexicalParagraph(article.contenu),
          auteur: 'Équipe DT Déménagement',
          categories: catId ? [catId] : [],
          tempsLecture: article.tempsLecture,
          statut: 'publie',
          datePublication: article.datePublication,
        },
      })
      payload.logger.info(`  ✅ ${article.titre.substring(0, 55)}...`)
    } else {
      payload.logger.info(`  ⏭️  Déjà existant : ${article.slug}`)
    }
  }

  // ── 9. Témoignages ────────────────────────────────────────────────────────
  payload.logger.info(`\n⭐ [10/10] Témoignages (${TESTIMONIALS.length})...`)
  for (const temoignage of TESTIMONIALS) {
    const existing = await payload.find({
      collection: 'testimonials',
      where: { nom: { equals: temoignage.nom } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'testimonials',
        data: {
          nom: temoignage.nom,
          ville: temoignage.ville,
          note: temoignage.note,
          texte: temoignage.texte,
          ordre: temoignage.ordre,
          publie: true,
        },
      })
      payload.logger.info(`  ✅ ${temoignage.nom} — ${temoignage.ville}`)
    } else {
      payload.logger.info(`  ⏭️  ${temoignage.nom} (déjà existant)`)
    }
  }

  // ── 8. Page accueil avec tous les blocs ───────────────────────────────────
  payload.logger.info('\n🏠 [BONUS] Page accueil avec blocs...')
  const pageExisting = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'accueil' } },
    limit: 1,
  })

  if (pageExisting.docs.length === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        titre: 'Accueil — DT Déménagement Tunisie',
        slug: 'accueil',
        publie: true,
        seo: {
          metaTitle: 'DT Déménagement Tunisie — N°1 du déménagement en Tunisie',
          metaDescription: 'Spécialiste du déménagement en Tunisie et vers l\'Europe. Devis gratuit en 2h. Plus de 5000 déménagements réalisés depuis 2009.',
        },
        layout: [
          // Bloc Hero
          {
            blockType: 'hero',
            badge: 'N°1 du déménagement en Tunisie',
            titre: 'Déménagez en toute sérénité à travers toute la Tunisie',
            sousTitre: 'Plus de 5 000 déménagements réalisés. Devis gratuit en 2h. Professionnel, ponctuel, sécurisé.',
            ctaPrimaire: { texte: 'Devis gratuit', lien: '/fr/devis' },
            ctaSecondaire: { texte: 'Nos services', lien: '/fr/services' },
            afficher3D: true,
          },
          // Bloc Stats
          {
            blockType: 'stats',
            titre: 'Nos chiffres parlent d\'eux-mêmes',
            animation: true,
            stats: [
              { valeur: 15,   suffixe: '+',  libelle: 'Années d\'expérience', icone: 'calendar' },
              { valeur: 5000, suffixe: '+',  libelle: 'Déménagements réalisés', icone: 'truck' },
              { valeur: 24,   suffixe: '/7', libelle: 'Disponibilité', icone: 'clock' },
              { valeur: 98,   suffixe: '%',  libelle: 'Clients satisfaits', icone: 'star' },
            ],
          },
          // Bloc Services
          {
            blockType: 'services',
            titre: 'Nos services',
            sousTitre: 'Une offre complète pour tous vos besoins de déménagement',
            badge: 'Ce que nous faisons',
          },
          // Bloc Why Us
          {
            blockType: 'why-us',
            titre: 'Pourquoi choisir DT Déménagement ?',
            sousTitre: 'Depuis 2009, nous nous engageons pour des déménagements réussis',
            arguments: [
              { icone: 'shield', titre: 'Assurance tous risques', texte: 'Vos biens sont assurés de bout en bout. Zéro risque, zéro stress.' },
              { icone: 'clock',  titre: 'Ponctualité garantie',   texte: 'Nous respectons les horaires convenus. Votre temps est précieux.' },
              { icone: 'award',  titre: '15 ans d\'expérience',   texte: 'Plus de 5 000 déménagements réussis depuis 2009 en Tunisie et en Europe.' },
              { icone: 'users',  titre: 'Équipe professionnelle', texte: 'Des déménageurs formés, expérimentés et respectueux de vos biens.' },
            ],
          },
          // Bloc Témoignages
          {
            blockType: 'testimonials',
            titre: 'Ce que disent nos clients',
            badge: 'Témoignages',
          },
          // Bloc Google Reviews
          {
            blockType: 'google-reviews',
            titre: 'Avis Google vérifiés',
            badge: 'Google Reviews',
          },
          // Bloc Blog Preview
          {
            blockType: 'blog-preview',
            titre: 'Conseils déménagement',
            badge: 'Notre blog',
            nombreArticles: 3,
          },
          // Bloc CTA final
          {
            blockType: 'cta',
            titre: 'Prêt à déménager ?',
            sousTitre: 'Contactez-nous pour un devis gratuit et sans engagement. Réponse garantie sous 2h.',
            boutonPrimaire: { texte: 'Obtenir mon devis gratuit', lien: '/fr/devis' },
            couleurFond: 'rouge',
          },
        ],
      },
    })
    payload.logger.info('  ✅ Page accueil créée avec 8 blocs')
  } else {
    payload.logger.info('  ⏭️  Page accueil déjà existante')
  }

  payload.logger.info('\n✅ ═══════════════════════════════════════')
  payload.logger.info('✅  SEED TERMINÉ AVEC SUCCÈS !')
  payload.logger.info('✅  Rendez-vous sur http://localhost:3000/admin')
  payload.logger.info('✅  Email : admin@demenagement.tn')
  payload.logger.info('✅  Mot de passe : ChangeMe2026!')
  payload.logger.info('✅ ═══════════════════════════════════════')
}
