import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Tourne uniquement en développement, protégé par SEED_SECRET
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Secret invalide' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const results: string[] = []

  // ── Helpers ──────────────────────────────────────────────────────────────

  function lexical(text: string) {
    return {
      root: {
        type: 'root',
        version: 1,
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        children: [
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            textStyle: '',
            children: [
              { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal' as const, style: '' },
            ],
          },
        ],
      },
    }
  }

  // ── Services ──────────────────────────────────────────────────────────────

  const SERVICES_DATA = [
    {
      nom: 'Transporteur en Tunisie',
      slug: 'transporteur-en-tunisie',
      description: 'Notre service de transport couvre toute la Tunisie. Flotte de véhicules adaptés à chaque volume, équipe professionnelle formée, assurance tous risques incluse pour un déménagement en toute sérénité.',
      icone: 'truck',
      ordre: 1,
      seo: {
        metaTitle: 'Transporteur Professionnel en Tunisie — DT Déménagement',
        metaDescription: 'Service de transport et déménagement dans toute la Tunisie. Flotte moderne, équipe certifiée, assurance incluse. Devis gratuit en 24h.',
      },
    },
    {
      nom: 'Transfert Entreprises',
      slug: 'transfert-entreprises',
      description: "Spécialistes du déménagement d'entreprise, nous assurons le transfert de vos bureaux, laboratoires ou entrepôts avec un minimum d'interruption d'activité. Planification sur mesure et exécution rapide.",
      icone: 'building',
      ordre: 2,
      seo: {
        metaTitle: "Déménagement d'Entreprise en Tunisie — DT Déménagement",
        metaDescription: "Transfert de bureaux et d'entreprises en Tunisie. Gestion complète du déménagement professionnel, zéro interruption d'activité. Devis gratuit.",
      },
    },
    {
      nom: 'Location Monte-Meubles',
      slug: 'location-monte-meubles',
      description: 'Notre monte-meubles professionnel facilite le déménagement en hauteur et dans les étages. Idéal pour les meubles encombrants, les appareils électroménagers et les objets fragiles.',
      icone: 'crane',
      ordre: 3,
      seo: {
        metaTitle: 'Location Monte-Meubles Professionnel — DT Déménagement',
        metaDescription: 'Location de monte-meubles avec opérateur pour vos déménagements en étages. Sécurité et rapidité garanties.',
      },
    },
    {
      nom: 'Gardes Meubles',
      slug: 'gardes-meubles',
      description: 'Nos espaces de garde-meubles sécurisés et climatisés sont disponibles pour courte ou longue durée. Stockage sécurisé avec accès contrôlé et surveillance 24h/24.',
      icone: 'warehouse',
      ordre: 4,
      seo: {
        metaTitle: 'Garde-Meubles Sécurisé en Tunisie — DT Déménagement',
        metaDescription: 'Stockage et garde-meubles sécurisé, climatisé et surveillé. Solutions courte et longue durée.',
      },
    },
    {
      nom: 'Service Emballage',
      slug: 'services-emballage',
      description: "Notre équipe emballe vos affaires avec des matériaux certifiés : cartons renforcés, papier bulle, protections spéciales pour objets fragiles, œuvres d'art et électronique.",
      icone: 'box',
      ordre: 5,
      seo: {
        metaTitle: 'Service Emballage Professionnel — DT Déménagement',
        metaDescription: 'Emballage et conditionnement professionnel de vos effets personnels. Matériaux certifiés, protection maximale.',
      },
    },
    {
      nom: 'Montage / Démontage',
      slug: 'montage-demontage',
      description: "Montage et démontage de meubles par nos techniciens expérimentés. Armoires, cuisines équipées, lits, étagères — nous gérons l'ensemble du mobilier avec soin et efficacité.",
      icone: 'tools',
      ordre: 6,
      seo: {
        metaTitle: 'Montage et Démontage de Meubles — DT Déménagement',
        metaDescription: 'Service de montage et démontage de meubles à domicile. Techniciens expérimentés, intervention rapide.',
      },
    },
  ]

  for (const data of SERVICES_DATA) {
    const existing = await payload.find({ collection: 'services', where: { slug: { equals: data.slug } }, limit: 1 })
    if (existing.docs.length > 0) { results.push(`⏭ Service existant: ${data.nom}`); continue }
    await payload.create({
      collection: 'services',
      data: { nom: data.nom, slug: data.slug, description: data.description, icone: data.icone, ordre: data.ordre, publie: true, seo: data.seo },
      locale: 'fr',
    })
    results.push(`✅ Service créé: ${data.nom}`)
  }

  // ── Villes ────────────────────────────────────────────────────────────────

  const VILLES_DATA = [
    { nom: 'Tunis',       slug: 'tunis',        region: 'Nord',         lat: 36.8190, lng: 10.1658 },
    { nom: 'Ariana',      slug: 'ariana',       region: 'Nord',         lat: 36.8625, lng: 10.1956 },
    { nom: 'Ben Arous',   slug: 'ben-arous',    region: 'Nord',         lat: 36.7533, lng: 10.2278 },
    { nom: 'La Manouba',  slug: 'la-manouba',   region: 'Nord',         lat: 36.8081, lng: 10.0993 },
    { nom: 'Zaghouan',    slug: 'zaghouan',     region: 'Nord',         lat: 36.4027, lng: 10.1425 },
    { nom: 'Nabeul',      slug: 'nabeul',       region: 'Nord-Est',     lat: 36.4513, lng: 10.7375 },
    { nom: 'Bizerte',     slug: 'bizerte',      region: 'Nord',         lat: 37.2744, lng: 9.8739  },
    { nom: 'Béja',        slug: 'beja',         region: 'Nord-Ouest',   lat: 36.7256, lng: 9.1817  },
    { nom: 'Jendouba',    slug: 'jendouba',     region: 'Nord-Ouest',   lat: 36.5011, lng: 8.7811  },
    { nom: 'Le Kef',      slug: 'le-kef',       region: 'Nord-Ouest',   lat: 36.1820, lng: 8.7147  },
    { nom: 'Siliana',     slug: 'siliana',      region: 'Centre',       lat: 36.0847, lng: 9.3711  },
    { nom: 'Kairouan',    slug: 'kairouan',     region: 'Centre',       lat: 35.6712, lng: 10.1005 },
    { nom: 'Kassérine',   slug: 'kasserine',    region: 'Centre-Ouest', lat: 35.1674, lng: 8.8307  },
    { nom: 'Sidi Bouzid', slug: 'sidi-bouzid',  region: 'Centre',       lat: 35.0383, lng: 9.4849  },
    { nom: 'Sousse',      slug: 'sousse',       region: 'Centre-Est',   lat: 35.8288, lng: 10.6407 },
    { nom: 'Monastir',    slug: 'monastir',     region: 'Centre-Est',   lat: 35.7643, lng: 10.8113 },
    { nom: 'Mahdia',      slug: 'mahdia',       region: 'Centre-Est',   lat: 35.5024, lng: 11.0621 },
    { nom: 'Sfax',        slug: 'sfax',         region: 'Sud-Est',      lat: 34.7406, lng: 10.7603 },
    { nom: 'Gafsa',       slug: 'gafsa',        region: 'Sud-Ouest',    lat: 34.4200, lng: 8.7842  },
    { nom: 'Tozeur',      slug: 'tozeur',       region: 'Sud-Ouest',    lat: 33.9197, lng: 8.1335  },
    { nom: 'Kébili',      slug: 'kebili',       region: 'Sud',          lat: 33.7032, lng: 8.9715  },
    { nom: 'Gabès',       slug: 'gabes',        region: 'Sud-Est',      lat: 33.8828, lng: 10.0982 },
    { nom: 'Médenine',    slug: 'medenine',     region: 'Sud-Est',      lat: 33.3540, lng: 10.5055 },
    { nom: 'Tataouine',   slug: 'tataouine',    region: 'Sud',          lat: 32.9290, lng: 10.4513 },
  ] as const

  const ALL_SERVICE_SLUGS = SERVICES_DATA.map((s) => s.slug)

  for (const data of VILLES_DATA) {
    const existing = await payload.find({ collection: 'villes', where: { slug: { equals: data.slug } }, limit: 1 })
    if (existing.docs.length > 0) { results.push(`⏭ Ville existante: ${data.nom}`); continue }
    await payload.create({
      collection: 'villes',
      data: {
        nom: data.nom,
        slug: data.slug,
        region: data.region,
        coordonnees: { lat: data.lat, lng: data.lng },
        servicesDisponibles: ALL_SERVICE_SLUGS,
        publie: true,
        seo: {
          metaTitle: `Déménagement ${data.nom} — DT Déménagement Tunisie`,
          metaDescription: `DT Déménagement intervient à ${data.nom} et dans toute la région ${data.region}. Devis gratuit en 24h, équipe professionnelle certifiée.`,
        },
      },
      locale: 'fr',
    })
    results.push(`✅ Ville créée: ${data.nom}`)
  }

  // ── Pays ──────────────────────────────────────────────────────────────────

  const PAYS_DATA = [
    { nom: 'France',     slug: 'france',     drapeau: '🇫🇷', lat: 46.6,  lng: 2.3   },
    { nom: 'Allemagne',  slug: 'allemagne',  drapeau: '🇩🇪', lat: 51.2,  lng: 10.5  },
    { nom: 'Belgique',   slug: 'belgique',   drapeau: '🇧🇪', lat: 50.5,  lng: 4.5   },
    { nom: 'Italie',     slug: 'italie',     drapeau: '🇮🇹', lat: 42.8,  lng: 12.8  },
    { nom: 'Luxembourg', slug: 'luxembourg', drapeau: '🇱🇺', lat: 49.8,  lng: 6.1   },
    { nom: 'Portugal',   slug: 'portugal',   drapeau: '🇵🇹', lat: 39.4,  lng: -8.2  },
    { nom: 'Suède',      slug: 'suede',      drapeau: '🇸🇪', lat: 59.3,  lng: 18.1  },
    { nom: 'Espagne',    slug: 'espagne',    drapeau: '🇪🇸', lat: 40.4,  lng: -3.7  },
    { nom: 'Malte',      slug: 'malte',      drapeau: '🇲🇹', lat: 35.9,  lng: 14.5  },
  ] as const

  for (const data of PAYS_DATA) {
    const existing = await payload.find({ collection: 'pays', where: { slug: { equals: data.slug } }, limit: 1 })
    if (existing.docs.length > 0) { results.push(`⏭ Pays existant: ${data.nom}`); continue }
    await payload.create({
      collection: 'pays',
      data: {
        nom: data.nom,
        slug: data.slug,
        drapeau: data.drapeau,
        coordonnees: { lat: data.lat, lng: data.lng },
        publie: true,
        seo: {
          metaTitle: `Déménagement en ${data.nom} depuis la Tunisie — DT Déménagement`,
          metaDescription: `DT Déménagement assure vos déménagements de Tunisie vers ${data.nom}. Transport routier ou maritime, formalités douanières incluses.`,
        },
      },
      locale: 'fr',
    })
    results.push(`✅ Pays créé: ${data.nom}`)
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────

  const FAQ_DATA = [
    { question: 'Comment obtenir un devis pour mon déménagement ?',           reponse: 'Remplissez notre formulaire en ligne en moins de 2 minutes ou appelez-nous directement. Notre équipe vous contacte sous 24h avec une proposition personnalisée et sans engagement.',              categorie: 'tarifs-devis',  ordre: 1 },
    { question: 'Le devis est-il gratuit et sans engagement ?',               reponse: "Oui, notre devis est 100% gratuit et sans engagement. Vous n'êtes jamais obligé d'accepter la proposition. Nous calculons le prix en fonction du volume, de la distance et des services souhaités.", categorie: 'tarifs-devis',  ordre: 2 },
    { question: 'Quels sont les modes de paiement acceptés ?',                reponse: 'Nous acceptons le paiement en espèces, par virement bancaire et par chèque. Un acompte peut être demandé à la réservation. Le solde est réglé le jour du déménagement.',                           categorie: 'tarifs-devis',  ordre: 3 },
    { question: "L'assurance est-elle incluse dans le prix ?",                reponse: "Oui, une assurance de base tous risques est incluse dans tous nos tarifs. Pour les objets de valeur, une couverture complémentaire peut être souscrite.",                                            categorie: 'tarifs-devis',  ordre: 4 },
    { question: 'Comment se déroule un déménagement avec DT ?',               reponse: "Notre équipe arrive à l'heure convenue, prend en charge l'emballage si souhaité, charge le camion avec soin, transporte vos affaires et les dépose dans chaque pièce à destination.",              categorie: 'deroulement',   ordre: 5 },
    { question: "Combien de temps à l'avance dois-je réserver ?",             reponse: "Nous recommandons de réserver 2 à 4 semaines à l'avance, surtout en haute saison. Pour les urgences, nous faisons notre maximum pour intervenir rapidement.",                                       categorie: 'deroulement',   ordre: 6 },
    { question: 'Que faire si ma date de déménagement change ?',              reponse: "Contactez-nous dès que possible. Un report est possible sans frais jusqu'à 7 jours avant la date prévue.",                                                                                          categorie: 'deroulement',   ordre: 7 },
    { question: "Proposez-vous le service d'emballage des affaires ?",        reponse: "Oui, notre service d'emballage complet inclut cartons renforcés, papier bulle, protections spéciales pour les fragiles et le démontage/remontage des meubles.",                                     categorie: 'services',      ordre: 8 },
    { question: 'Avez-vous un service de garde-meubles ?',                    reponse: 'Oui, nous disposons de stockage sécurisé, climatisé et surveillé disponible pour courte ou longue durée. Idéal lors d\'une transition entre deux logements.',                                       categorie: 'services',      ordre: 9 },
    { question: 'Pouvez-vous déménager des entreprises et des bureaux ?',     reponse: "Absolument. Nous sommes spécialisés dans le transfert d'entreprises avec une planification sur mesure pour minimiser l'interruption d'activité.",                                                   categorie: 'services',      ordre: 10 },
    { question: "Proposez-vous des déménagements vers l'Europe ?",            reponse: 'Oui, nous assurons des déménagements vers 9 pays européens : France, Allemagne, Belgique, Italie, Luxembourg, Portugal, Suède, Espagne et Malte.',                                                  categorie: 'international', ordre: 11 },
    { question: 'Quelles sont les formalités douanières à prévoir ?',         reponse: "Notre équipe vous guide dans toutes les démarches : inventaire détaillé, déclaration douanière, franchise de droits pour effets personnels. Nous nous occupons de la paperasse.",                   categorie: 'international', ordre: 12 },
    { question: 'Quel est le délai pour un déménagement Tunisie-France ?',    reponse: "Par camion, le délai est de 5 à 10 jours selon le point de livraison. Pour les volumes importants, nous proposons aussi le transport maritime (3 à 5 semaines).",                                   categorie: 'international', ordre: 13 },
    { question: "Comment fonctionne l'espace client ?",                       reponse: "L'espace client vous permet de suivre l'avancement de votre dossier, consulter vos documents et communiquer directement avec notre équipe. Accès sécurisé par lien magique envoyé par email.",      categorie: 'espace-client', ordre: 14 },
    { question: "Je n'arrive pas à me connecter à mon espace client.",        reponse: "Vérifiez que l'email utilisé est bien celui fourni lors de votre demande de devis. Le lien magique expire après 10 minutes — demandez-en un nouveau si besoin.",                                    categorie: 'espace-client', ordre: 15 },
  ]

  for (const data of FAQ_DATA) {
    const existing = await payload.find({ collection: 'faq', where: { question: { equals: data.question } }, limit: 1, locale: 'fr' })
    if (existing.docs.length > 0) { results.push(`⏭ FAQ existante: ${data.question.slice(0, 40)}…`); continue }
    await payload.create({
      collection: 'faq',
      data: { question: data.question, reponse: lexical(data.reponse), categorie: data.categorie, ordre: data.ordre, publie: true },
      locale: 'fr',
    })
    results.push(`✅ FAQ créée: ${data.question.slice(0, 40)}…`)
  }

  // ── Utilisateurs de test (3 rôles) ───────────────────────────────────────

  const testUsers = [
    {
      nom: 'Admin',
      prenom: 'DT',
      email: 'admin@dt-demenagement.tn',
      password: 'Admin@2024!',
      role: 'super-admin' as const,
    },
    {
      nom: 'Editeur',
      prenom: 'Test',
      email: 'editeur@dt-demenagement.tn',
      password: 'Editeur@2024!',
      role: 'editeur' as const,
    },
    {
      nom: 'Commercial',
      prenom: 'Test',
      email: 'commercial@dt-demenagement.tn',
      password: 'Commercial@2024!',
      role: 'commercial' as const,
    },
  ]

  for (const user of testUsers) {
    const existing = await payload.find({
      collection: 'admins',
      where: { email: { equals: user.email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'admins',
        overrideAccess: true,
        data: user,
      })
      results.push(`✅ Créé [${user.role}]: ${user.email} / ${user.password}`)
    } else {
      results.push(`⏭ Existant [${user.role}]: ${user.email}`)
    }
  }

  return NextResponse.json({ success: true, count: results.length, results })
}
