# Cahier des charges — Agent de veille et analyse éditoriale autonome

## 1. Vision du projet

Un système multi-agents qui surveille l'actualité dans plusieurs domaines, sélectionne de façon autonome les sujets pertinents, produit sa propre analyse (pas un simple résumé) sous forme d'article, et publie automatiquement sur un site web monétisé par la publicité.

Le point différenciant : chaque article est une **analyse argumentée** issue du croisement de plusieurs sources, pas une compilation ou un simple résumé d'actualité.

---

## 2. Objectifs

- Générer un flux régulier de contenu original et crédible sur 5 domaines ou plus
- Fonctionner en autonomie complète (sélection, rédaction, publication) sans validation humaine
- Construire une audience suffisante pour rentabiliser le site via la publicité display
- Poser une base technique capable d'évoluer vers un modèle freemium (V2)

---

## 3. Domaines couverts

- 5 domaines minimum dès la V1
- Chaque domaine fonctionne comme un **profil indépendant** : mots-clés de veille, sources privilégiées, angle éditorial, ton
- Architecture pensée pour ajouter un nouveau domaine sans reconstruire le système (ajout de profil, pas de nouvel agent)

### Domaines retenus
1. **Numérique** — tech, produits, plateformes, cybersécurité
2. **Écosystème** — entrepreneuriat, startups, innovation
3. **Économie** — marchés, entreprises, politique monétaire

### Domaines proposés en complément (sujets porteurs de l'actualité actuelle)
4. **Géopolitique** — conflits, diplomatie, rapports de force internationaux
5. **Intelligence artificielle** — traité séparément du numérique généraliste vu le volume d'actualité spécifique (modèles, régulation, usages)
6. **Société & environnement** *(proposition)* — climat, santé publique, mouvements sociaux — domaine à fort volume d'actualité récurrente
7. **Culture & médias** *(proposition, optionnel)* — évolutions du secteur des médias, industries créatives

*(Recommandation : démarrer avec les 5 premiers domaines listés, ajouter le 6e/7e une fois le pipeline stabilisé)*

---

## 4. Fonctionnement de l'agent — cycle éditorial

Pour chaque domaine, le système suit un cycle en 5 étapes :

1. **Veille** — recherche web ciblée sur le domaine (mots-clés, sources prioritaires, actualité récente)
2. **Sélection & angle** — évaluation de plusieurs sujets candidats (nouveauté, nombre de sources qui en parlent, écart avec les sujets déjà traités récemment) ; choix autonome du sujet le plus pertinent
3. **Analyse croisée** — lecture de plusieurs sources sur le sujet retenu, identification des points de convergence/désaccord, construction d'un point de vue argumenté
4. **Rédaction** — structuration en article (titre optimisé SEO, angle, argumentaire, sources citées) dans le ton du domaine
5. **Auto-vérification & publication** — relecture automatique pour vérifier que chaque affirmation s'appuie sur au moins une source trouvée ; publication directe si le seuil de confiance est atteint, sinon le cycle est annulé (pas de publication d'une analyse fragile)

---

## 5. Rythme de publication

Deux cycles fonctionnent en parallèle par domaine :

- **Cycle quotidien fixe** — un article par jour par domaine, déclenché à heure fixe (les 5+ domaines sont décalés dans le temps pour ne pas tout lancer simultanément)
- **Cycle réactif** — scan plus fréquent (ex. toutes les 30–60 min) qui détecte un sujet "chaud" (pic de mentions, plusieurs sources majeures publiant simultanément, mots-clés inhabituels) et déclenche une publication immédiate hors cycle

**Point de vigilance** : le système doit garder en mémoire les sujets déjà traités récemment (par domaine) pour éviter qu'un article du cycle quotidien fasse doublon avec un article déjà publié par le cycle réactif.

### Critères de détection d'un "sujet chaud" par domaine

Le seuil ne peut pas être identique partout — un même événement n'a pas le même poids en géopolitique, en économie ou en IA. Proposition de grille de scoring par domaine (déclenchement si le score dépasse un seuil fixé après calibrage) :

**Géopolitique**
- Événement soudain à fort impact (conflit, attentat, coup d'État, rupture diplomatique majeure)
- Couverture simultanée par plusieurs agences de presse internationales majeures (Reuters, AFP, AP) en moins de quelques heures
- Implication directe d'une puissance majeure (États-Unis, Chine, UE, Russie) ou d'une organisation internationale (ONU, OTAN)

**Économie**
- Mouvement de marché significatif (indice boursier, taux de change, matière première) au-delà d'un seuil de variation
- Décision de banque centrale (taux directeur) non anticipée par le marché
- Annonce majeure d'entreprise (faillite, fusion-acquisition, résultats très en écart des attentes)
- Publication de données macroéconomiques (inflation, emploi) en rupture avec les prévisions

**Intelligence artificielle**
- Lancement d'un nouveau modèle par un acteur majeur (OpenAI, Anthropic, Google, Meta, etc.)
- Décision réglementaire (UE, États-Unis, Chine) impactant le secteur
- Incident ou controverse significative (sécurité, biais, usage détourné)
- Levée de fonds ou rachat de grande ampleur dans le secteur

**Autres domaines (numérique, écosystème, société)**
- Grille similaire à adapter : nombre de sources traitant le sujet dans une fenêtre de temps courte + écart avec le volume de mentions habituel du sujet

*(Le seuil numérique exact de déclenchement devra être calibré après une phase de test — commencer avec un seuil volontairement élevé pour limiter les faux déclenchements, puis l'ajuster à la baisse selon les résultats observés)*

---

## 6. Architecture technique

### 6.1 Principe général
Un seul moteur d'orchestration, plusieurs profils de domaine en entrée — pas un agent séparé par domaine.

### 6.2 Composants

| Composant | Rôle |
|---|---|
| Orchestrateur (scheduler) | Déclenche les cycles quotidiens (décalés) et le scan réactif en continu |
| Module de veille | Appels API Claude avec `web_search` pour la recherche par domaine |
| Module d'analyse/rédaction | Appels API Claude pour croisement de sources et génération de l'article |
| Base de données | Historique des sujets traités par domaine, articles générés, logs de scoring "sujet chaud" |
| Frontend / site | Affichage des articles, navigation par domaine, gestion des emplacements publicitaires |

### 6.3 Hébergement
- Serveur/cloud 24/7 dès la V1 (VPS type Hetzner, DigitalOcean ou OVH suffisant pour le volume visé)
- Backend en service continu (Node.js ou Python) portant le scheduler et les boucles de veille

### 6.4 Stockage
- PostgreSQL (ou SQLite pour un démarrage plus léger) pour l'historique et les articles

---

## 7. Monétisation

### 7.1 Modèle V1
100% gratuit, revenu par publicité display.

### 7.2 Implications sur la conception
- **Volume et régularité critiques** : le pipeline doit être fiable (pas de cycle manqué) puisque le revenu dépend directement du trafic
- **Qualité perçue** : les régies publicitaires (notamment Google AdSense) sont strictes sur le contenu IA sans valeur ajoutée perçue — l'analyse argumentée et les sources citées visiblement sont le principal argument de différenciation
- **SEO intégré au pipeline** : titre, structure et mots-clés optimisés dès la génération de l'article, pas en post-traitement

### 7.3 Choix de régie publicitaire
- Démarrage : Google AdSense ou Ezoic (acceptent des sites jeunes, peu de trafic minimum requis)
- Évolution : Mediavine/AdThrive une fois un seuil de trafic atteint (généralement 50k+ sessions/mois)

### 7.4 Levier gratuit complémentaire
Newsletter quotidienne récapitulative par domaine — coût de mise en place faible, fidélise l'audience, prépare une transition vers un modèle freemium en V2 sans redesign majeur.

### 7.5 Évolution envisageable (V2, hors périmètre V1)
Modèle freemium avec analyses approfondies ou brief multi-domaines réservés aux abonnés.

---

## 8. Structure du site

- Une rubrique par domaine + un flux global mélangeant tous les domaines
- Distinction visuelle entre articles du cycle quotidien et articles du cycle réactif (ex. tag "analyse du jour" / "actualité chaude")
- Pages d'articles longues avec plusieurs emplacements publicitaires intégrés sans nuire à la lecture
- Priorité à la vitesse de chargement (rendu statique ou ISR)

---

## 9. Garde-fous (critiques en publication 100% automatique)

- **Auto-vérification des sources** avant publication — chaque affirmation doit s'appuyer sur au moins une source de la recherche
- **Seuil de confiance** — si les sources se contredisent trop ou sont insuffisantes, le cycle est annulé plutôt que de publier une analyse fragile
- **Déduplication** — vérification systématique contre l'historique des sujets déjà traités par domaine

---

## 10. Propositions pour les points restants

### 10.1 Stack technique proposée
- **Backend/orchestrateur** : Node.js (facilite l'intégration directe avec le SDK Anthropic et un écosystème riche pour le scheduling — `node-cron` pour les cycles fixes, une boucle asynchrone dédiée pour le scan réactif)
- **Frontend/site** : Next.js avec rendu statique/ISR pour la vitesse de chargement et le SEO
- **Base de données** : PostgreSQL dès la V1 (plus robuste que SQLite si le volume grossit vite avec 5-7 domaines)
- **Hébergement** : VPS Hetzner ou DigitalOcean, largement suffisant pour ce volume de départ

### 10.2 Régie publicitaire de lancement
Démarrer avec **Google AdSense** — intégration simple, pas de seuil de trafic minimum bloquant. Prévoir de migrer vers Ezoic dès que le trafic le permet (meilleure optimisation automatique des emplacements), puis viser Mediavine/AdThrive une fois le seuil de trafic significatif atteint.

### 10.3 Newsletter
- Fréquence : quotidienne, envoyée en fin de cycle journalier (une fois les articles du jour publiés sur tous les domaines)
- Format : un résumé court par domaine avec lien vers l'article complet, plus une mise en avant si un article "sujet chaud" a été publié dans la journée
- Outil proposé : Resend ou Mailchimp pour la V1 (simple à intégrer, pas besoin d'infra dédiée)

### 10.4 Points restant malgré tout à trancher avec l'usage
- Calibrage définitif des seuils numériques de "sujet chaud" (nécessite une phase de test réelle)
- Décision d'ajouter les domaines 6/7 proposés (société & environnement, culture & médias)
- Ton éditorial précis par domaine (à définir profil par profil une fois le premier prototype en place)
