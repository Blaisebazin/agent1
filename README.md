# Agent de veille et analyse éditoriale

Système autonome de veille, analyse et publication d'articles sur plusieurs domaines d'actualité.
Cahier des charges complet : [`cahier-des-charges-agent-veille-analyse.md`](./cahier-des-charges-agent-veille-analyse.md).

## Structure

- `backend/` — orchestrateur Node.js (veille, sélection, rédaction, scheduler)
- `frontend/` — site Next.js (à mettre en place à l'étape 7)
- `database/` — schéma SQL et données d'amorçage (`schema.sql`, `seed.sql`)

## Démarrage — backend

```bash
cd backend
cp .env.example .env   # renseigner ANTHROPIC_API_KEY et DATABASE_URL
npm install
npm run migrate         # crée les tables et insère les domaines de départ
npm run db:test         # vérifie la connexion
```

## État d'avancement

- [x] Étape 1 — structure du projet, base de données, variables d'environnement
- [ ] Étape 2 — module de veille (domaine test)
- [ ] Étape 3 — module de sélection
- [ ] Étape 4 — module d'analyse et rédaction
- [ ] Étape 5 — garde-fou d'auto-vérification
- [ ] Étape 6 — orchestrateur (scheduler + scan réactif)
- [ ] Étape 7 — frontend
- [ ] Étape 8 — déploiement
