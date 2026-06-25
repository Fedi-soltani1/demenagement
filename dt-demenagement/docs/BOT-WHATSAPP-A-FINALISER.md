# Bot WhatsApp — étapes restantes pour l'activer

> État au 2026-06-26. Le bot est déployé sur Railway (projet `calm-reverence`, service `demenagement`)
> mais **pas encore opérationnel**. Une fois ces 3 étapes faites, tout le canal WhatsApp s'active
> (identifiants agents ET fonctions client existantes).

## ✅ Déjà fait
- [x] Bot déployé sur Railway + **volume persistant** monté sur `/app/auth`
- [x] Variables du bot : `BOT_API_BASE_URL=https://demenagement-hazel.vercel.app`,
      `BOT_HTTP_PORT=3100`, `BOT_PAIRING_NUMBER=21652880112`,
      `BOT_SEND_SECRET=e8be9c59173512511980e8ab67bef25014c2075e861321ad`, `LOG_LEVEL=info`
- [x] Code bot : support du **code de jumelage** (pairing code) en plus du QR

## ❌ Reste à faire

### 1. Ré-appairer le bot à WhatsApp (état actuel : « loggedOut »)
Les logs : « Déconnecté (loggedOut). Supprimez le dossier auth/ et rescannez » + « Connection Closed ».
La session dans le volume est corrompue.
- [ ] **Vider le dossier `auth/`** sur le volume Railway (supprimer la session loggedOut)
- [ ] **Redémarrer** le service → nouveau QR / code de jumelage dans les logs
- [ ] **Entrer le code de jumelage** avec le WhatsApp du **+216 52 880 112**
- [ ] Vérifier dans les logs : « ✅ Bot connecté à WhatsApp »

### 2. Exposer le bot sur une URL publique (actuellement : aucun domaine public)
- [ ] Railway → service `demenagement` → **Settings → Networking → Generate Domain**
- [ ] Port cible = **3100** (= `BOT_HTTP_PORT`)
- [ ] Noter l'URL publique (type `xxxx.up.railway.app`)

### 3. Connecter le site (Vercel) au bot
- [ ] Vercel → ajouter `BOT_SEND_URL` = l'URL publique Railway de l'étape 2 (https://…up.railway.app)
- [ ] Vercel → ajouter `BOT_SEND_SECRET` = `e8be9c59173512511980e8ab67bef25014c2075e861321ad` (identique au bot)
- [ ] **Redéployer** Vercel (les fonctions doivent recharger les variables)

### 4. Tester de bout en bout
- [ ] Créer un agent avec un `whatsapp` rempli + cocher « 📲 Envoyer sur WhatsApp » → le message arrive
- [ ] (ou) tester une fonction client WhatsApp existante

## Notes
- Le mécanisme d'envoi côté site : `lib/send-whatsapp.ts` → POST `${BOT_SEND_URL}/send-message`
  avec l'en-tête `x-bot-secret`. Tant que `BOT_SEND_URL`/`SECRET` sont absents, l'envoi échoue
  proprement (journalisé en avertissement, pas de crash ; l'email part quand même).
- Risque IP datacenter (Baileys) : numéro dédié + bot réactif = risque faible. Proxy résidentiel
  optionnel via une variable `PROXY_URL` (support à ajouter dans `whatsapp-bot/src/connection.ts`).
