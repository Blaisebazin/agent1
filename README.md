# Agent de veille et analyse éditoriale

Système autonome de veille, analyse et publication d'articles sur plusieurs domaines d'actualité.
Cahier des charges complet : [`cahier-des-charges-agent-veille-analyse.md`](./cahier-des-charges-agent-veille-analyse.md).

## Structure

- `backend/` — orchestrateur Node.js (veille, sélection, rédaction, vérification, scheduler)
- `frontend/` — site Next.js (flux, pages domaine/article, AdSense)
- `database/` — schéma SQL et données d'amorçage (`schema.sql`, `seed.sql`)

## Démarrage — backend

```bash
cd backend
cp .env.example .env   # renseigner ANTHROPIC_API_KEY et DATABASE_URL
npm install
npm run migrate         # crée les tables et insère les domaines de départ
npm run db:test         # vérifie la connexion

# Tests unitaires par module (consomment du crédit API Anthropic)
npm run veille:test [slug-domaine]
npm run selection:test [slug-domaine]
npm run redaction:test [slug-domaine]
npm run verification:test [slug-domaine]   # cycle quotidien complet
npm run scan-reactif:test [slug-domaine]   # détection de sujet chaud

npm start                # démarre l'orchestrateur (scheduler cron)
```

## Démarrage — frontend

```bash
cd frontend
cp .env.local.example .env.local   # même DATABASE_URL que le backend
npm install
npm run dev              # http://localhost:3000
```

Le frontend lit directement les tables `domaines` et `articles` (statut `publie` uniquement) — aucun appel à l'API Claude côté frontend. Sans `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, les emplacements publicitaires affichent un placeholder visible.

## État d'avancement

- [x] Étape 1 — structure du projet, base de données, variables d'environnement
- [x] Étape 2 — module de veille (domaine test)
- [x] Étape 3 — module de sélection
- [x] Étape 4 — module d'analyse et rédaction
- [x] Étape 5 — garde-fou d'auto-vérification
- [x] Étape 6 — orchestrateur (scheduler + scan réactif) — scheduler validé, scan réactif en attente de revalidation live (crédit API)
- [x] Étape 7 — frontend
- [ ] Étape 8 — déploiement
