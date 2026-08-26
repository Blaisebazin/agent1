# Où je suis — QR code de table

Une appli minimaliste : un QR code fixe, imprimé une fois pour toutes, posé sur ta table. Il
pointe toujours vers la même page. Ce que cette page affiche, c'est toi qui le contrôles depuis
ton téléphone.

Trois écrans :

- **`/` — page publique** : ce que le QR code affiche. Le message du moment, le lieu, l'adresse,
  et un bouton « Itinéraire » qui ouvre Google Maps. Se rafraîchit toutes les 20 secondes.
- **`/admin.html` — page pour publier** : protégée par un code secret. C'est ton « appli mobile » —
  ajoute-la à l'écran d'accueil de ton téléphone (Safari/Chrome → Partager → « Sur l'écran
  d'accueil ») pour l'ouvrir comme une vraie appli. C'est aussi là que tu récupères le QR code à
  imprimer.
- L'API (`/api/status`, `/api/qrcode.png`) sert les deux pages ci-dessus.

## Démarrage local

```bash
cd qr-location-app
cp .env.example .env   # définis un ADMIN_TOKEN à toi
npm install
npm start               # http://localhost:3000
```

Ouvre `http://localhost:3000/admin.html`, entre ton code secret, publie un statut de test, puis
ouvre `http://localhost:3000/` dans un autre onglet pour vérifier l'affichage.

## Déploiement

L'appli est un simple serveur Express sans base de données (le statut est stocké dans
`data/status.json`). Elle tourne sur n'importe quel hébergeur Node (Render, Railway, un VPS…) :

1. Déploie le dossier `qr-location-app/` avec `npm install && npm start`.
2. Définis les variables d'environnement : `ADMIN_TOKEN` (ton code secret, garde-le pour toi) et
   `PUBLIC_URL` (l'URL publique finale, ex. `https://ou-je-suis.mondomaine.fr`) — indispensable
   pour que le QR code encode la bonne adresse.
3. Mets le service derrière HTTPS (obligatoire pour que le code secret ne circule pas en clair).

## Imprimer le QR code

Sur `/admin.html`, une fois connecté avec ton code, le QR code s'affiche en bas de page avec un
lien « Télécharger le QR code pour l'imprimer ». Il encode l'URL publique (`PUBLIC_URL`) — génère-le
donc une fois l'app déployée en production, pas depuis un `localhost`.

## Sécurité

- Un seul secret (`ADMIN_TOKEN`) protège la publication. Pas de gestion multi-utilisateur : conçu
  pour un usage personnel.
- La page publique ne révèle jamais le code secret ni de données sensibles au-delà de ce que tu
  publies toi-même.
- Si le statut est mis sur « invisible » (interrupteur en haut de la page admin), la page publique
  affiche « pas d'information disponible » au lieu du dernier message.
