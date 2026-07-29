import { getDomaineBySlug } from '../db/domaines.js';
import { executerCycleQuotidien } from '../orchestrateur/cycleEditorial.js';
import { pool } from '../db/client.js';

async function main() {
  const slug = process.argv[2] || 'numerique';
  const domaine = await getDomaineBySlug(slug);
  if (!domaine) {
    throw new Error(`Domaine introuvable : ${slug}`);
  }

  console.log(`Cycle quotidien — domaine "${domaine.nom}"...\n`);
  const resultat = await executerCycleQuotidien(domaine);

  console.log(`${resultat.nbCandidats} candidat(s) trouvé(s) en veille.`);

  if (resultat.statut === 'aucun_sujet') {
    console.log('Aucun sujet retenu (tous doublons) — arrêt.');
    await pool.end();
    return;
  }

  console.log(`Sujet retenu : ${resultat.sujetRetenu.sujet}`);
  console.log(`Article rédigé : "${resultat.article.titre}"\n`);

  const rapport = resultat.rapportVerification;
  console.log(`Verdict du garde-fou : ${rapport.verdict} (score de confiance : ${rapport.scoreConfiance}/100)`);
  console.log(`Raison : ${rapport.raison}`);
  if (rapport.affirmationsProblematiques.length > 0) {
    console.log('Affirmations problématiques :');
    rapport.affirmationsProblematiques.forEach((p) => console.log(`  - ${p.affirmation}\n    → ${p.probleme}`));
  }
  if (rapport.contradictionsEntreSources.length > 0) {
    console.log("Contradictions entre sources non signalées dans l'article :");
    rapport.contradictionsEntreSources.forEach((c) => console.log(`  - ${c}`));
  }

  if (resultat.statut === 'publie') {
    console.log(`\n✓ Article publié (statut = ${resultat.articleEnregistre.statut}, publie_le = ${resultat.articleEnregistre.publie_le})`);
  } else {
    console.log(`\n✗ Publication annulée (statut = ${resultat.articleEnregistre.statut})`);
    console.log(`Raison enregistrée : ${resultat.articleEnregistre.raison_annulation}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de vérification :', err.message);
  process.exit(1);
});
