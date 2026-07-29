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

## Déploiement (Docker / VPS)

Trois services applicatifs (`backend`, `frontend`, `db`) + `caddy` en reverse proxy avec HTTPS automatique.

```bash
cp .env.example .env    # POSTGRES_PASSWORD, ANTHROPIC_API_KEY, SITE_DOMAIN, ...
docker compose up -d --build
```

- `SITE_DOMAIN` : nom de domaine pointant vers le VPS (ex. `mon-site.fr`) → Caddy obtient
  automatiquement un certificat Let's Encrypt. Laisser `:80` pour tester en local sans domaine.
- Le schéma et les domaines de départ sont initialisés automatiquement au premier démarrage de
  `db` (volume vide) via `database/*.sql`, monté dans `/docker-entrypoint-initdb.d`. `npm run
  migrate` reste disponible pour rejouer le schéma sur une base déjà initialisée (ex. DB managée
  externe).
- `backend` exécute l'orchestrateur (scheduler cron) en continu, sans port exposé.
- `frontend` (image `next build` en mode `standalone`) n'est joignable qu'via `caddy` — pas de
  port publié directement sur l'hôte.

Sur le VPS : installer Docker + Docker Compose, cloner le dépôt, pointer le DNS du domaine vers
l'IP du serveur, puis lancer la commande ci-dessus.

**Vérifié dans cet environnement** : `docker compose config` (validité du fichier), `next build`
sans base de données accessible (le build ne dépend plus de PostgreSQL), et la résolution des
chemins du `Dockerfile` backend simulée manuellement (`migrate.js` + démarrage de l'orchestrateur
depuis la même arborescence que l'image). **Non vérifié** : build et exécution réels des images
Docker — le démon Docker n'est pas disponible dans cet environnement d'exécution (pas d'accès
privilégié). À valider sur le VPS cible ou dans un environnement avec Docker actif avant mise en
production.

## État d'avancement

- [x] Étape 1 — structure du projet, base de données, variables d'environnement
- [x] Étape 2 — module de veille (domaine test)
- [x] Étape 3 — module de sélection
- [x] Étape 4 — module d'analyse et rédaction
- [x] Étape 5 — garde-fou d'auto-vérification
- [x] Étape 6 — orchestrateur (scheduler + scan réactif) — scheduler validé, scan réactif en attente de revalidation live (crédit API)
- [x] Étape 7 — frontend
- [x] Étape 8 — déploiement — Dockerfiles + docker-compose + Caddy préparés, build Docker réel non exécutable dans cet environnement (voir section Déploiement)
