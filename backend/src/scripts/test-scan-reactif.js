import { getDomaineBySlug } from '../db/domaines.js';
import { executerScanReactif } from '../orchestrateur/cycleEditorial.js';
import { pool } from '../db/client.js';

async function main() {
  const slug = process.argv[2] || 'geopolitique';
  const domaine = await getDomaineBySlug(slug);
  if (!domaine) {
    throw new Error(`Domaine introuvable : ${slug}`);
  }

  console.log(`Scan réactif — domaine "${domaine.nom}"...\n`);
  const resultat = await executerScanReactif(domaine);

  console.log(`Sujet chaud détecté : ${resultat.detection.sujetChaudDetecte}`);
  console.log(`Score : ${resultat.detection.score}/100`);
  console.log(`Justification : ${resultat.detection.justification}\n`);

  console.log(`Statut du scan : ${resultat.statut}`);

  if (resultat.statut === 'rien_de_chaud' || resultat.statut === 'doublon_ecarte') {
    await pool.end();
    return;
  }

  console.log(`Sujet retenu : ${resultat.sujetRetenu.sujet}`);
  console.log(`Article rédigé : "${resultat.article.titre}"`);
  console.log(
    resultat.statut === 'publie'
      ? `\n✓ Article publié (score de confiance : ${resultat.rapportVerification.scoreConfiance}/100)`
      : `\n✗ Publication annulée — raison : ${resultat.articleEnregistre.raison_annulation}`
  );

  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de scan réactif :', err.message);
  process.exit(1);
});
