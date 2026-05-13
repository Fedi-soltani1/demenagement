# 🚀 PROMPT DE DÉMARRAGE — À COPIER-COLLER DANS CLAUDE CODE

---

## MESSAGE À ENVOYER EN PREMIER (copier tel quel)

---

Bonjour Claude Code. Tu vas travailler sur un projet complet de refonte web.

Avant de commencer, lis attentivement dans l'ordre :
1. Le fichier `CLAUDE.md` — ce sont tes règles permanentes pour ce projet, tu les respectes sans exception tout au long du développement
2. Le fichier `prompt-DT-demenagement-FINAL.md` — c'est le cahier des charges complet du projet

Une fois les deux fichiers lus, confirme-moi que tu as bien compris en me donnant :
- Le nom du projet
- La stack technique choisie
- Le nombre de phases dans la checklist
- La couleur principale du client et pourquoi tu ne peux jamais la modifier
- La première action que tu vas effectuer

Attends ma validation avant de commencer à coder.

---

## MESSAGES DE VALIDATION PAR PHASE (à envoyer après confirmation de Claude)

### Pour démarrer la Phase 1 :
```
Parfait. Lance la Phase 1 — étapes 1 à 6 uniquement.
Commence par l'étape 1 : initialisation du projet Next.js.
Montre-moi chaque fichier créé en entier.
Annonce-moi quand la Phase 1 est terminée avant de continuer.
```

### Pour valider et passer à la Phase 2 :
```
Phase 1 validée. Lance la Phase 2 — étapes 7 à 11.
Commence par l'étape 7 : tokens Tailwind dans tailwind.config.ts.
Un fichier à la fois, complet à chaque fois.
```

### Pour valider et passer à la Phase 3 :
```
Phase 2 validée. Lance la Phase 3 — étapes 12 à 16.
Commence par la Navbar (étape 12) — version desktop d'abord, ensuite mobile.
```

### Pour valider et passer à la Phase 4 :
```
Phase 3 validée. Lance la Phase 4 — étapes 17 à 19.
Commence par les collections Payload CMS dans l'ordre :
Pages → Services → Villes → Pays → Blog → FAQ → Testimonials → Partners → Media → Clients → Demenagements → Messages → Newsletter → GoogleReviews → Settings.
```

### Pour valider et passer à la Phase 5 :
```
Phase 4 validée. Lance la Phase 5 — étapes 20 à 26.
Commence par la page d'accueil (étape 20).
Développe les 14 blocs dans l'ordre exact du cahier des charges.
```

### Pour valider et passer à la Phase 6 :
```
Phase 5 validée. Lance la Phase 6 — étapes 27 à 30 (finalisation).
Commence par l'intégration GTM + events GA4 (étape 27).
```

---

## MESSAGES UTILES EN COURS DE DÉVELOPPEMENT

### Si Claude Code s'arrête au milieu d'un fichier :
```
Continue — montre-moi la suite du fichier en entier.
Ne tronque rien, je veux voir le code complet.
```

### Si tu veux vérifier un composant spécifique :
```
Montre-moi le fichier [NOM_FICHIER] tel qu'il existe actuellement dans le projet.
```

### Si Claude Code fait une erreur de couleur ou de design :
```
Stop. Tu as utilisé [couleur/valeur incorrecte].
La règle est : [rappeler la règle du CLAUDE.md].
Corrige le fichier et montre-moi la version corrigée complète.
```

### Si Claude Code ajoute une dépendance non prévue :
```
Pourquoi as-tu ajouté [librairie] ?
Est-ce que cette librairie était dans le cahier des charges ?
Quel est son impact sur le bundle size ?
```

### Si tu veux tester une page spécifique :
```
Lance les commandes suivantes et montre-moi le résultat :
pnpm tsc --noEmit
pnpm lint
pnpm test
```

### Pour demander un audit de performance :
```
Fais un audit du bundle size actuel.
Identifie les 3 plus grosses dépendances.
Propose des optimisations si on dépasse les seuils du cahier des charges.
```

### Pour demander la génération des données seed :
```
Génère le script de seed Payload CMS avec :
- Les 24 villes tunisiennes (données dans lib/constants.ts)
- Les 9 pays européens
- Les 6 services
- Les 3 rôles utilisateurs (SuperAdmin, Éditeur, Commercial)
```

### Pour demander la vérification SEO d'une page :
```
Vérifie que la page [NOM_PAGE] respecte toutes les règles SEO du cahier des charges :
- Metadata complète (title, description, OG, canonical, hreflang)
- Schema.org JSON-LD approprié
- Images avec alt text
- Breadcrumb présent
```

---

## ⚠️ RÈGLES POUR TOI (développeur) EN TRAVAILLANT AVEC CLAUDE CODE

**Ne jamais lui demander de tout faire en une seule fois.**
Ce projet est trop grand. Une phase à la fois, un fichier à la fois.

**Toujours valider visuellement avant de passer à la suite.**
Ouvre le navigateur, vérifie que ça ressemble à ce que tu attends.

**Garder une copie de sauvegarde avant chaque phase.**
Un `git commit` avant de démarrer chaque nouvelle phase.

**Si Claude Code semble perdu ou répète des erreurs :**
Commence un nouveau message en lui rappelant :
```
Rappel contexte : tu travailles sur DT Déménagement Tunisie.
Lis le fichier CLAUDE.md pour tes règles.
Nous sommes à la Phase [X], étape [Y].
La dernière chose que tu as créée était [fichier].
Continue à partir de là.
```

**Si le contexte devient trop long (> 50 messages) :**
Ouvre une nouvelle conversation Claude Code et commence par :
```
Nouveau contexte. Projet : DT Déménagement Tunisie.
Lis CLAUDE.md et prompt-DT-demenagement-FINAL.md.
Nous sommes à la Phase [X], étape [Y].
Tous les fichiers des phases précédentes sont déjà créés dans le projet.
Continue à partir de l'étape [Y].
```

---

## 📁 FICHIERS À PLACER À LA RACINE DU PROJET

Quand tu crées le projet, place ces 2 fichiers à la racine :
```
dt-demenagement/
├── CLAUDE.md                          ← Règles permanentes Claude Code
├── prompt-DT-demenagement-FINAL.md   ← Cahier des charges complet
├── ... (reste du projet)
```

Claude Code les lira automatiquement au démarrage de chaque session.

---

## 🎯 RÉSUMÉ DU PROJET EN 5 LIGNES

> Refonte complète de demenagement.tn — site de déménagement N°1 en Tunisie.
> Stack : Next.js 14 + TypeScript strict + Tailwind + Framer Motion + Three.js + Payload CMS v3 + PostgreSQL.
> Design : premium noir/rouge #b52027, scène 3D, glassmorphism, animations 60fps.
> Fonctionnalités : CMS headless, espace client, FAQ, newsletter, avis Google auto, 3 langues (FR/AR/EN), RGPD.
> Objectif : Lighthouse > 90 partout, zéro perte SEO depuis WordPress, livraison propre et maintenable.
