# Déploiement Vercel — Checklist des variables d'environnement

> ⚠️ À configurer dans **Vercel → Project → Settings → Environment Variables** AVANT le premier déploiement.
> Les variables `NEXT_PUBLIC_*` sont **figées au build** → après modification, **redéployer**.

---

## 🔴 Obligatoires (le site ne démarre pas sans)

| Variable | Valeur | Note |
|---|---|---|
| `DATABASE_URL` | chaîne Neon **poolée** | Utiliser la connection string **pooled** de Neon (serverless → bcp de connexions) |
| `PAYLOAD_SECRET` | (≥ 32 car.) | secret Payload |
| `AUTH_SECRET` | (≥ 32 car.) | secret NextAuth |
| **`NEXT_PUBLIC_SERVER_URL`** | **`https://demenagement.tn`** | ⭐ Magic-link espace client. **Mettre le domaine final.** Redéployer si changé. |
| `CRON_SECRET` | (secret) | protège les routes cron |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `21652880311` | bouton WhatsApp |
| `NEXT_PUBLIC_WHATSAPP_MESSAGE` | message par défaut | bouton WhatsApp |

## 📧 Emails (Resend — adaptateur actuel)

| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | clé Resend |
| `RESEND_FROM_ADDRESS` | ex. `noreply@demenagement.tn` (domaine vérifié sur Resend) |
| `EMAIL_FROM` | `DT Déménagement <contact@demenagement.tn>` |
| `EMAIL_DEVIS_TO` | `contact@demenagement.tn` (destinataire interne des devis/RDV) |

## 🖼️ Médias — OBLIGATOIRE sur Vercel (disque éphémère)

| Variable | Note |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | sinon les uploads Payload (logos, photos) **disparaissent** |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |

## 🤖 Bot WhatsApp (envoi devis depuis Vercel → VPS)

| Variable | Valeur | Note |
|---|---|---|
| `BOT_SEND_URL` | `https://bot.demenagement.tn` | URL **publique** du bot sur le VPS (reverse proxy HTTPS) |
| `BOT_SEND_SECRET` | (le même que dans le `.env` du bot) | doit être **identique** côté bot |

## 🟡 Optionnelles (selon intégrations activées)

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_CLARITY_ID` | analytics |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | avis Google |
| `INSTAGRAM_ACCESS_TOKEN` / `INSTAGRAM_USER_ID` | feed Instagram |
| `BREVO_API_KEY` / `BREVO_LIST_ID` | newsletter |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | rate-limiting |
| `SENTRY_DSN` / `SENTRY_ORG` / `SENTRY_PROJECT` | monitoring erreurs |

---

## Ordre de déploiement recommandé

```
1. Créer le projet Vercel (connecter le dépôt GitHub) — root: dt-demenagement/
2. Renseigner les variables ci-dessus (au moins les 🔴 + 📧 + 🖼️)
3. Déployer
4. Lier le domaine demenagement.tn (DNS → Vercel, SSL auto)
5. Vérifier NEXT_PUBLIC_SERVER_URL = https://demenagement.tn → redéployer si besoin
6. (Feature partenaires) générer/distribuer les liens partenaires DEPUIS l'admin sur demenagement.tn
7. Le bot reste sur le VPS (jamais sur Vercel) ; BOT_SEND_URL pointe vers son URL publique
```

## Pièges connus (déjà rencontrés)
- **Médias** : sans Cloudinary, les uploads se perdent (disque Vercel éphémère).
- **`NEXT_PUBLIC_*`** : figées au build → redéployer après changement.
- **Neon** : utiliser la connection string **poolée** (serverless).
- **Liens partenaires** : générés depuis `window.location.origin` → suivent le domaine courant automatiquement (pas de var d'env à gérer pour eux).
