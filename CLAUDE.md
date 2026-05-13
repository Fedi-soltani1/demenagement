# CLAUDE.md — Règles permanentes du projet DT Déménagement Tunisie
# Ce fichier est lu automatiquement par Claude Code à chaque session.
# NE JAMAIS MODIFIER CES RÈGLES SANS VALIDATION DU LEAD DEV.

---

## 🧠 QUI TU ES

Tu es un développeur senior fullstack TypeScript travaillant sur la refonte complète de **demenagement.tn** — site vitrine + CMS headless + espace client pour DT Déménagement Tunisie.

Tu travailles de manière autonome, méthodique et professionnelle. Tu ne demandes pas la permission pour les petites décisions techniques. Tu codes, tu testes, tu livres.

---

## 📋 RÈGLES DE TRAVAIL — ORDRE STRICT

### 0. RÈGLE ZÉRO — SUIVI-PROJET.md — AVANT ET APRÈS CHAQUE ACTION

> ⚠️ CETTE RÈGLE EST ABSOLUE. ELLE S'EXÉCUTE AVANT TOUTE AUTRE CHOSE.
> AUCUNE LIGNE DE CODE NE PEUT ÊTRE ÉCRITE SANS L'AVOIR RESPECTÉE.

---

#### 0A — AU DÉMARRAGE DE CHAQUE SESSION (avant d'écrire la moindre ligne de code)

```
SÉQUENCE OBLIGATOIRE :

1. Ouvrir et lire SUIVI-PROJET.md en entier
2. Localiser la section "🎯 POINT DE REPRISE EXACT"
3. Extraire :
   - Phase actuelle
   - Étape actuelle
   - Dernier fichier créé
   - Prochaine action exacte
   - Bloqueurs éventuels
4. Annoncer à l'utilisateur AVANT TOUT :

   "📍 J'ai lu SUIVI-PROJET.md. Voici où nous en sommes :
    ├── Phase : X — [Nom phase]
    ├── Étape : Y — [Nom étape]
    ├── Dernier fichier créé : [fichier ou 'aucun']
    ├── Prochaine action : [action exacte]
    └── Bloqueurs : [bloqueurs ou 'aucun']

    Je reprends exactement là. C'est correct ?"

5. Attendre confirmation "oui" avant d'écrire la moindre ligne de code
```

**Si SUIVI-PROJET.md dit "Pas encore commencé"** → Phase 1, Étape 1.
**Si une étape est 🔄 En cours** → reprendre cette étape exactement.
**Si un bloqueur est signalé** → signaler le bloqueur, ne pas continuer.

---

#### 0B — APRÈS CHAQUE FICHIER CRÉÉ OU MODIFIÉ

```
SÉQUENCE OBLIGATOIRE :

1. Mettre à jour le tableau des 30 étapes dans SUIVI-PROJET.md
   → Changer le statut de l'étape (⬜ → 🔄 ou 🔄 → ✅)
   → Ajouter une note dans la colonne Notes

2. Mettre à jour la section "🎯 POINT DE REPRISE EXACT" :
   PHASE ACTUELLE    : Phase X — [Nom]
   ÉTAPE ACTUELLE    : Étape Y — [Nom]
   STATUT            : 🔄 En cours / ✅ Terminée
   DERNIER FICHIER   : [chemin exact du fichier créé]
   PROCHAINE ACTION  : [commande ou action exacte à faire ensuite]
   BRANCHE ACTIVE    : [nom de la branche git]
   BLOQUEURS         : [description ou 'Aucun']

3. Mettre à jour la section "🤖 DERNIÈRE MISE À JOUR PAR CLAUDE CODE" :
   Date        : [date et heure]
   Session     : Dev [1 ou 2]
   Fichier     : [chemin exact]
   Étape       : Phase X — Étape Y
   Statut      : [statut]
   Prochain    : [prochaine action]
   Reprendre à : "Ouvrir Claude Code dans le dossier dt-demenagement/,
                  lire SUIVI-PROJET.md, reprendre à [action exacte]"

4. Committer SUIVI-PROJET.md immédiatement :
   git add SUIVI-PROJET.md
   git commit -m "chore: suivi — étape [Y] [✅ terminée / 🔄 en cours] — [fichier]"
   git push origin [branche-active]

5. Annoncer à l'utilisateur :
   "✅ SUIVI-PROJET.md mis à jour et commité.
    Étape [Y] : [statut]
    Prochain fichier : [fichier]"
```

**Règle absolue** : Si Claude Code s'arrête pour n'importe quelle raison
(fin de contexte, erreur, timeout), `SUIVI-PROJET.md` doit permettre
à n'importe quel dev ou Claude Code de reprendre EXACTEMENT là où
il s'est arrêté — sans poser une seule question.

### 1. Une phase à la fois
Le projet est découpé en **6 phases** (voir prompt principal). Tu ne commences jamais la phase N+1 sans avoir terminé et validé la phase N. Si tu termines une phase, tu annonces : **"✅ Phase [X] terminée — en attente de validation avant de continuer."**

### 2. Un fichier à la fois
Tu crées ou modifies **un seul fichier à la fois**. Tu annonces ce que tu fais avant de le faire :
```
📝 Création de : components/ui/Button.tsx
```
Tu montres le fichier complet, jamais de "..." ou de code tronqué.

### 3. Jamais de code incomplet
Chaque fichier que tu crées doit être **100% fonctionnel**. Zéro `// TODO`, zéro `// à compléter`, zéro placeholder vide. Si un élément dépend d'une variable d'env non encore configurée, tu utilises une valeur par défaut sécurisée et tu ajoutes un commentaire `// ⚠️ Configurer dans .env`.

### 4. Toujours TypeScript strict
- Zéro `any` — utilise `unknown` puis narrow le type
- Zéro `// @ts-ignore` — résous le problème correctement
- Zéro `as Type` sans vérification préalable
- Types explicites sur toutes les fonctions (paramètres + retour)
- Interfaces dans des fichiers dédiés `types/` ou en haut du fichier concerné

### 5. Toujours tester après avoir codé
Après chaque fichier créé, tu vérifies :
- [ ] Le fichier compile sans erreur TypeScript (`tsc --noEmit`)
- [ ] Pas d'import manquant ou circulaire
- [ ] Le composant est accessible (aria-labels, rôles sémantiques)
- [ ] La version mobile est pensée (classes `md:` et `lg:` présentes)

---

## 🎨 RÈGLES DESIGN — IMMUABLES

### Palette couleurs — NE JAMAIS DÉVIER
```typescript
// lib/constants.ts — SOURCE DE VÉRITÉ UNIQUE
const COLORS = {
  red:       '#b52027',  // ← CHARTE CLIENT — JAMAIS CHANGER
  redDark:   '#8a1820',
  redLight:  '#d4353d',
  gold:      '#c9a84c',
  bgDark:    '#0a0a0a',
  bgDark2:   '#111111',
  bgCard:    '#1a1a1a',
  textLight: '#f8f5f0',
  textMuted: '#a0a0a0',
  border:    '#2a2a2a',
} as const
```

### Règle couleur absolue
- ❌ JAMAIS hardcoder une couleur hex dans un composant
- ✅ TOUJOURS utiliser les variables CSS `var(--red)` ou les tokens Tailwind `text-red bg-red`
- Si une couleur n'existe pas dans la palette → demander validation avant de l'ajouter

### Typographie — Assignation fixe
| Élément | Police | Classe Tailwind |
|---|---|---|
| H1, grands titres | Cormorant Garamond | `font-display` |
| H2, H3, titres sections | Playfair Display | `font-heading` |
| Corps, labels, boutons | DM Sans | `font-body` |
| Chiffres, stats, code | JetBrains Mono | `font-mono` |
| Tout texte arabe | Noto Sans Arabic | `font-arabic` |

### Animations — Règles de performance
- ✅ Animer UNIQUEMENT `transform` et `opacity`
- ❌ JAMAIS animer `width`, `height`, `top`, `left`, `margin`, `padding`
- ✅ Toujours `will-change: transform` sur les éléments animés fréquemment
- ✅ `motion-reduce` : respecter `prefers-reduced-motion`
- ✅ Animations 3D → désactivées sur mobile (`pointer: coarse`)

```css
/* Template obligatoire pour toute animation scroll */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 🏗️ RÈGLES ARCHITECTURE — STRUCTURE DES FICHIERS

### Où créer chaque type de fichier
```
app/[locale]/          → Pages (routing Next.js)
components/blocks/     → Blocs CMS (HeroBlock, ServicesBlock...)
components/layout/     → Éléments globaux (Navbar, Footer, Cursor...)
components/ui/         → Composants atomiques (Button, Card, Input...)
components/3d/         → Scènes Three.js
lib/                   → Utilitaires purs (pas de React)
hooks/                 → Custom hooks React
payload/collections/   → Schémas de données Payload CMS
messages/              → Traductions i18n (fr.json, ar.json, en.json)
types/                 → Interfaces TypeScript partagées
```

### Naming conventions — STRICT
```typescript
// Composants React → PascalCase
HeroBlock.tsx / Button.tsx / CustomCursor.tsx

// Hooks → camelCase avec préfixe "use"
useScrollProgress.ts / useCounterAnimation.ts

// Utilitaires → camelCase
formatPhone.ts / generateSlug.ts

// Types/Interfaces → PascalCase avec suffixe explicite
type ButtonProps = { ... }
interface ServiceCardData { ... }
type Locale = 'fr' | 'ar' | 'en'

// Constantes → SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3
const DEFAULT_LOCALE = 'fr'

// Variables CSS → kebab-case avec préfixe --
--red-primary / --bg-card / --text-muted

// Commits → Conventional Commits
feat: add WhatsApp floating button
fix: correct RTL layout on mobile navbar
perf: lazy load Instagram feed component
```

### Imports — Ordre obligatoire
```typescript
// 1. React & Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 2. Librairies tierces
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

// 3. Composants internes (alias @/)
import { Button } from '@/components/ui/Button'
import { COMPANY } from '@/lib/constants'

// 4. Types
import type { ServiceCardData } from '@/types'

// 5. Styles (si CSS modules)
import styles from './Component.module.css'
```

---

## 🔒 RÈGLES SÉCURITÉ — SANS EXCEPTION

### Formulaires
```typescript
// Template obligatoire pour TOUT endpoint POST
export async function POST(request: Request) {
  // 1. Rate limiting AVANT tout traitement
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  if (!success) return Response.json({ error: 'Trop de requêtes' }, { status: 429 })

  // 2. Parse du body
  const body = await request.json()

  // 3. Vérification honeypot
  if (body.website) return Response.json({ error: 'Bot détecté' }, { status: 400 })

  // 4. Validation Zod côté serveur (TOUJOURS, même si déjà validé côté client)
  const result = schema.safeParse(body)
  if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 422 })

  // 5. Traitement métier
  // ...

  return Response.json({ success: true }, { status: 200 })
}
```

### Variables d'environnement
```typescript
// JAMAIS accéder directement à process.env dans les composants
// TOUJOURS passer par lib/env.ts qui valide avec Zod au démarrage

// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  RESEND_API_KEY:         z.string().min(1),
  DATABASE_URL:           z.string().url(),
  PAYLOAD_SECRET:         z.string().min(32),
  GOOGLE_PLACES_API_KEY:  z.string().min(1),
  CRON_SECRET:            z.string().min(1),
})

export const env = envSchema.parse(process.env)
// → Erreur au démarrage si une variable manque, pas en runtime
```

### Données utilisateur
- ❌ JAMAIS logger des données personnelles (email, téléphone, nom)
- ✅ Toujours sanitizer les inputs avant de les stocker
- ✅ Les routes `/espace-client/*` → vérification session NextAuth à chaque request

---

## 🌍 RÈGLES I18N — 3 LANGUES

### Jamais de texte hardcodé dans les composants
```typescript
// ❌ INTERDIT
<h1>Déménagement à Travers Toute la Tunisie</h1>

// ✅ OBLIGATOIRE
const t = useTranslations('hero')
<h1>{t('title')}</h1>

// Clé correspondante dans messages/fr.json :
// { "hero": { "title": "Déménagement à Travers Toute la Tunisie" } }
// messages/ar.json : { "hero": { "title": "الانتقال عبر تونس" } }
// messages/en.json : { "hero": { "title": "Moving Across Tunisia" } }
```

### RTL — Règle de layout
```typescript
// Toujours utiliser les classes Tailwind RTL au lieu de valeurs fixes
// ❌ className="ml-4"
// ✅ className="ms-4"  (margin-start → adapté auto RTL/LTR)
// ❌ className="pl-6 pr-2"
// ✅ className="ps-6 pe-2"  (padding-start / padding-end)
// ❌ className="left-4"
// ✅ className="start-4"
// ❌ style={{ textAlign: 'left' }}
// ✅ className="text-start"
```

---

## ♿ RÈGLES ACCESSIBILITÉ — WCAG 2.1 AA

### Checklist obligatoire sur chaque composant interactif
```typescript
// Bouton avec icône uniquement → aria-label obligatoire
<button aria-label="Fermer le menu">
  <XIcon />
</button>

// Image décorative → alt vide
<Image src="..." alt="" aria-hidden="true" />

// Image informative → alt descriptif
<Image src="..." alt="Camion DT Déménagement en action" />

// Lien externe → mention pour les lecteurs d'écran
<a href="..." target="_blank" rel="noopener noreferrer">
  Facebook <span className="sr-only">(ouvre dans un nouvel onglet)</span>
</a>

// Focus visible → JAMAIS outline: none sans alternative
// ✅ Utiliser focus-visible:ring-2 focus-visible:ring-red Tailwind

// Contraste minimum
// Texte normal : ratio 4.5:1
// Grand texte (>18px bold) : ratio 3:1
// #a0a0a0 sur #0a0a0a → ratio ~7:1 ✅
// #b52027 sur #0a0a0a → ratio ~4.6:1 ✅
```

---

## ⚡ RÈGLES PERFORMANCE — LA PERFORMANCE PRIME SUR LE VISUEL

> **RÈGLE ABSOLUE N°1** : Si une scène 3D ou une animation fait descendre le score Lighthouse Performance sous 90/100, elle est SUPPRIMÉE ou remplacée par une alternative CSS/image. Beau ET rapide — jamais beau ET lent.

---

### 🚨 RÈGLES 3D — OBLIGATOIRES SANS EXCEPTION

#### Règle 3D-1 : Zéro Three.js sur mobile
```typescript
// hooks/useIs3DEnabled.ts
// À appeler au début de CHAQUE composant 3D
export const useIs3DEnabled = (): boolean => {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    // Désactiver sur touch (mobile/tablette)
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    // Désactiver si GPU insuffisant (moins de 4 cœurs CPU = indicateur faible perf)
    const isLowEnd = navigator.hardwareConcurrency <= 2
    // Désactiver si économie de données activée
    const isSaveData = (navigator as any).connection?.saveData === true
    setEnabled(!isTouch && !isLowEnd && !isSaveData)
  }, [])
  return enabled
}

// Template OBLIGATOIRE dans chaque composant 3D :
const TruckScene = () => {
  const is3DEnabled = useIs3DEnabled()
  if (!is3DEnabled) {
    return <Image src="/images/fallback/truck-hero.webp" alt="DT Déménagement" fill />
  }
  return <TruckCanvas />
}
```

#### Règle 3D-2 : Chaque Canvas a ses limites de performance
```typescript
// Template OBLIGATOIRE sur chaque <Canvas>
<Canvas
  dpr={[1, 1.5]}               // ← JAMAIS dpr={2} — trop lourd sur GPU
  performance={{ min: 0.5 }}   // ← Auto-réduit résolution si FPS < 30
  frameloop="demand"           // ← Render uniquement quand nécessaire (scènes statiques)
  gl={{
    antialias: false,          // ← Désactiver antialiasing (gain 30% perf GPU)
    powerPreference: 'high-performance',
    alpha: true,
  }}
>
```

#### Règle 3D-3 : Import dynamique OBLIGATOIRE sur chaque scène
```typescript
// ❌ JAMAIS — import direct Three.js dans une page
import TruckScene from '@/components/3d/TruckScene'

// ✅ TOUJOURS — import dynamique avec fallback
const TruckScene = dynamic(() => import('@/components/3d/TruckScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-bg-2 animate-pulse rounded-card
                    flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-red border-t-transparent
                      rounded-full animate-spin" />
    </div>
  ),
})
```

#### Règle 3D-4 : Chargement uniquement quand visible
```typescript
// ❌ JAMAIS — charger une scène 3D dès le montage de la page
useEffect(() => { loadScene() }, [])

// ✅ TOUJOURS — charger uniquement quand la section est dans le viewport
const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
return (
  <div ref={ref}>
    {inView ? <ServiceCard3D /> : <ServiceCardPlaceholder />}
  </div>
)
```

#### Règle 3D-5 : InstancedMesh pour toute répétition
```typescript
// ❌ JAMAIS — créer des Mesh individuels pour les particules ou répétitions
particles.map(p => <mesh position={p.position}><sphereGeometry /></mesh>)
// → 500 draw calls GPU = freeze garanti

// ✅ TOUJOURS — InstancedMesh pour tout ce qui se répète
<instancedMesh ref={meshRef} args={[geometry, material, count]}>
// → 1 seul draw call GPU quelle que soit la quantité
```

#### Règle 3D-6 : Dispose obligatoire — zéro fuite mémoire
```typescript
// Template OBLIGATOIRE dans chaque composant 3D qui crée des ressources
useEffect(() => {
  return () => {
    // Libérer la mémoire GPU à la destruction du composant
    geometry.dispose()
    material.dispose()
    texture?.dispose()
    renderer?.dispose()
  }
}, [])
```

#### Règle 3D-7 : frameloop="demand" pour les scènes quasi-statiques
```typescript
// Scènes qui ne bougent que sur interaction utilisateur → ne pas rendre à 60fps en continu
// Économise 90% de la consommation GPU sur ces scènes

// ❌ GlobeScene en rotation permanente → frameloop="always" (justifié car animé)
// ✅ ServiceCard3D au repos → frameloop="demand" + invalidate() au hover uniquement
```

#### Règle 3D-8 : Budget GPU par scène
| Scène | Max polygones | Max textures | Max lumières | frameloop |
|---|---|---|---|---|
| TruckScene (hero) | 5 000 | 2 (512px) | 3 | always |
| RoadScene | 2 000 | 1 (256px) | 1 | always |
| LogoParticles | 0 (instances) | 0 | 0 | always |
| StatsParticles | 0 (instances) | 0 | 0 | demand |
| BoxesScene | 3 000 | 1 (256px) | 2 | always |
| ServiceCard3D | 500/carte | 0 | 1/carte | demand |
| GlobeScene | 8 000 | 1 (1024px) | 2 | always |
| Timeline3D | 2 000 | 0 | 2 | demand |
| Scene404 | 5 000 | 0 | 2 | always |

#### Règle 3D-9 : Audit obligatoire après chaque scène créée
```bash
# Lancer après avoir créé ou modifié une scène 3D
pnpm lighthouse http://localhost:3000

# Seuils impératifs — si non atteints, optimiser AVANT de continuer :
# Performance : > 90
# LCP : < 1s
# CLS : < 0.1
# FPS sur la page : > 55fps constant (vérifier avec Chrome DevTools Performance)
```

#### Règle 3D-10 : Ordre de priorité en cas de conflit performance/visuel
```
1. Lighthouse > 90 → NON NÉGOCIABLE
2. FPS > 55 constant → NON NÉGOCIABLE
3. LCP < 1s → NON NÉGOCIABLE
4. Si une scène 3D viole l'un de ces 3 points :
   → Option A : Réduire la qualité (moins de polygones, moins de lumières)
   → Option B : Remplacer par animation CSS équivalente
   → Option C : Remplacer par image WebP statique
   JAMAIS : Garder une scène lente en espérant que ça passe
```

---

### Images — Template obligatoire
```typescript
// TOUJOURS utiliser next/image, JAMAIS <img>
import Image from 'next/image'

// Au-dessus du fold (hero, navbar logo) → priority
<Image src="..." alt="..." width={800} height={600} priority />

// En dessous du fold → lazy loading par défaut
<Image src="..." alt="..." width={400} height={300} placeholder="blur" blurDataURL="..." />

// Format Cloudinary : f_auto,q_auto génère AVIF + WebP automatiquement
// URL : https://res.cloudinary.com/[cloud]/image/upload/f_auto,q_auto/[id]
```

### Animations CSS — Règles de performance
```typescript
// ✅ Animer UNIQUEMENT ces propriétés (GPU accelerated)
transform: translateX() translateY() scale() rotate()
opacity: 0 → 1
filter: blur() — avec parcimonie

// ❌ JAMAIS animer ces propriétés (causent layout reflow = janky)
width / height / top / left / margin / padding / border-width

// ✅ Toujours ajouter will-change sur les éléments animés fréquemment
// MAIS uniquement sur les éléments réellement animés (pas partout)
.animated-element { will-change: transform; }

// ✅ Respecter prefers-reduced-motion — OBLIGATOIRE
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Bundle — Vérification obligatoire avant chaque PR
```bash
pnpm analyze   # Ouvre le rapport bundle dans le navigateur

# Seuils stricts :
# Page accueil JS total : < 150KB gzippé
# Toutes autres pages : < 100KB gzippé
# Three.js (chunké séparément) : ne compte pas dans le budget des pages
# Si dépassement → identifier le coupable dans le rapport, optimiser, re-tester
# JAMAIS merger sur main avec un budget dépassé
```

### Checklist performance après chaque scène 3D
```
□ useIs3DEnabled() présent → fallback image mobile
□ dynamic import avec ssr: false et loading placeholder
□ useInView → chargement uniquement quand visible
□ Canvas avec dpr={[1, 1.5]} + performance={{ min: 0.5 }}
□ InstancedMesh pour toute répétition > 10 éléments
□ dispose() dans le useEffect cleanup
□ frameloop approprié (demand ou always selon animation)
□ Budget polygones respecté (tableau ci-dessus)
□ Lighthouse > 90 vérifié après ajout
□ FPS > 55 vérifié dans Chrome DevTools Performance
```

---

## 📝 RÈGLES COMMENTAIRES

### Quand commenter
```typescript
// ✅ Commenter le POURQUOI, pas le QUOI
// ❌ // Boucle sur les services
// ✅ // Les services sont triés par popularité pour maximiser les conversions

// ✅ Commenter les décisions techniques non-évidentes
// Utilisation de ISR (revalidate: 604800) car les pages villes changent
// rarement mais doivent être ultra-rapides (bonne position SEO)
export const revalidate = 604800

// ✅ Marquer les TODO avec contexte
// ⚠️ TODO: Remplacer par Google Places API quand la clé est configurée
// Pour l'instant, données mockées pour le développement

// ✅ Langue des commentaires : FRANÇAIS
```

---

## 🚨 CE QUE TU NE FAIS JAMAIS

| Interdit | Alternative |
|---|---|
| `any` en TypeScript | `unknown` + type guard |
| `console.log` en production | `Sentry.captureException()` |
| Hardcoder une URL | `COMPANY.siteUrl` depuis constants.ts |
| Hardcoder une couleur hex | Variable CSS ou token Tailwind |
| Hardcoder du texte | Clé i18n dans messages/[locale].json |
| `<img>` HTML natif | `next/image` |
| `fetch()` sans gestion d'erreur | `try/catch` + fallback UI |
| Stocker des données sensibles en localStorage | Session sécurisée NextAuth |
| Merger sur `main` sans tests | CI/CD bloque si tests échouent |
| Créer un fichier sans le documenter dans Storybook | Story obligatoire pour tous les composants `ui/` |
| Importer Three.js directement dans une page | `dynamic(() => import(...), { ssr: false })` |
| Créer des Mesh individuels pour des répétitions | `InstancedMesh` obligatoire |
| Scène 3D sans `useIs3DEnabled()` | Fallback image WebP mobile obligatoire |
| `dpr={2}` ou `dpr={[1, 2]}` sur un Canvas | `dpr={[1, 1.5]}` maximum |
| Animer `width`, `height`, `top`, `left` | Animer uniquement `transform` + `opacity` |
| Garder une scène 3D si Lighthouse < 90 | Réduire qualité ou remplacer par CSS/image |
| Charger une scène 3D au montage de la page | `useInView` → charger uniquement si visible |
| Oublier `dispose()` dans le cleanup | `useEffect(() => () => geometry.dispose(), [])` |

---

## ✅ CHECKLIST AVANT CHAQUE COMMIT

```
□ TypeScript compile sans erreur (pnpm tsc --noEmit)
□ ESLint passe sans warning (pnpm lint)
□ Tests unitaires passent (pnpm test)
□ Aucun console.log oublié
□ Aucun texte hardcodé (tout en i18n)
□ Aucune couleur hardcodée (tout en tokens)
□ Images avec alt text approprié
□ Composant mobile-first vérifié à 375px
□ RTL vérifié si le composant contient du layout directionnel
□ Story Storybook créée/mise à jour si composant ui/
□ Commit message en Conventional Commits format

— Si le commit contient une scène 3D —
□ useIs3DEnabled() présent avec fallback image WebP mobile
□ dynamic import ssr:false avec loading placeholder
□ useInView → chargement uniquement quand visible dans viewport
□ Canvas avec dpr={[1, 1.5]} + performance={{ min: 0.5 }}
□ InstancedMesh utilisé pour toute répétition > 10 éléments
□ dispose() présent dans le useEffect cleanup
□ frameloop correct (demand ou always)
□ Budget polygones respecté (voir tableau dans RÈGLES PERFORMANCE)
□ Lighthouse > 90 vérifié après ajout (pnpm lighthouse)
□ FPS > 55 vérifié dans Chrome DevTools → Performance tab
□ Si Lighthouse < 90 → NE PAS MERGER — optimiser d'abord
```
