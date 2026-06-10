# Bot WhatsApp DT (Baileys)

Service Node qui mène une conversation devis/RDV sur WhatsApp et crée les demandes
dans Payload via les endpoints publics du site (`/api/devis`, `/api/rdv`, `/api/devis/upload`).

> ⚠️ Baileys n'est **pas** officiel (contre les règles WhatsApp). Utilisez un **numéro dédié**,
> jamais la ligne pro principale : le numéro peut être banni.

## Prérequis
- Node.js 20+
- Un numéro WhatsApp **dédié** (pas la ligne pro principale)
- Le site déployé et accessible (`BOT_API_BASE_URL`)

## Lancer en local (test)
```bash
cd whatsapp-bot
cp .env.example .env      # éditer BOT_API_BASE_URL
npm install
npm start                 # affiche un QR -> scanner avec WhatsApp > Appareils connectés
```
Puis, depuis un AUTRE téléphone, écrire au numéro du bot : « Bonjour ».

## Vérifier le moteur sans WhatsApp
```bash
npm run sim
```

## Production (VPS, 24/7)
```bash
npm i -g pm2
npm install
pm2 start npm --name dt-whatsapp-bot -- start
pm2 logs dt-whatsapp-bot     # scanner le QR au 1er lancement
pm2 save && pm2 startup      # redémarrage auto au reboot
```
Le dossier `auth/` contient la session WhatsApp : **ne pas le committer** (déjà dans `.gitignore`),
le conserver sur le VPS pour éviter de re-scanner le QR à chaque redémarrage.

## Variables d'environnement
| Variable | Rôle |
|---|---|
| `BOT_API_BASE_URL` | URL du site déployé, sans slash final (ex : `https://demenagement.tn`) |
| `LOG_LEVEL` | Niveau de log pino (`info` par défaut) |
