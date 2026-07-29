import { getDomaineBySlug } from '../db/domaines.js';
import { rechercherSujets } from '../modules/veille.js';
import { selectionnerSujet } from '../modules/selection.js';
import { redigerArticle } from '../modules/redaction.js';
import { verifierArticle } from '../modules/verification.js';
import { enregistrerArticleBrouillon, marquerArticlePublie, marquerArticleAnnule } from '../db/articles.js';
import { slugifier } from '../utils/slugify.js';
import { pool } from '../db/client.js';

async function main() {
  const slug = process.argv[2] || 'numerique';
  const domaine = await getDomaineBySlug(slug);
  if (!domaine) {
    throw new Error(`Domaine introuvable : ${slug}`);
  }

  console.log(`Veille pour le domaine "${domaine.nom}"...`);
  const candidats = await rechercherSujets(domaine);
  console.log(`${candidats.length} candidat(s) trouvé(s).\n`);

  console.log('Sélection en cours...');
  const { sujetRetenu } = await selectionnerSujet(domaine, candidats);
  if (!sujetRetenu) {
    console.log('Aucun sujet retenu (tous doublons) — arrêt.');
    await pool.end();
    return;
  }
  console.log(`Sujet retenu : ${sujetRetenu.sujet}\n`);

  console.log('Rédaction en cours...');
  const article = await redigerArticle(domaine, sujetRetenu);
  console.log(`Article rédigé : "${article.titre}"\n`);

  const articleEnregistre = await enregistrerArticleBrouillon({
    domaineId: domaine.id,
    sujetTraiteId: sujetRetenu.id,
    titre: article.titre,
    slug: slugifier(article.titre),
    extrait: article.extrait,
    corps: article.corps,
    sources: article.sources,
    typeCycle: sujetRetenu.type_cycle,
    metaSeo: { titre_seo: article.titre, description: article.extrait, mots_cles: article.mots_cles_seo || [] },
  });
  console.log(`Article enregistré en brouillon — id = ${articleEnregistre.id}\n`);

  console.log('Auto-vérification en cours (garde-fou)...');
  const rapport = await verifierArticle(article);

  console.log(`\nVerdict du garde-fou : ${rapport.verdict} (score de confiance : ${rapport.scoreConfiance}/100)`);
  console.log(`Raison : ${rapport.raison}`);
  if (rapport.affirmationsProblematiques.length > 0) {
    console.log('Affirmations problématiques :');
    rapport.affirmationsProblematiques.forEach((p) => console.log(`  - ${p.affirmation}\n    → ${p.probleme}`));
  }
  if (rapport.contradictionsEntreSources.length > 0) {
    console.log('Contradictions entre sources non signalées dans l\'article :');
    rapport.contradictionsEntreSources.forEach((c) => console.log(`  - ${c}`));
  }

  if (rapport.estValide) {
    const publie = await marquerArticlePublie(articleEnregistre.id, rapport.scoreConfiance);
    console.log(`\n✓ Article publié (statut = ${publie.statut}, publie_le = ${publie.publie_le})`);
  } else {
    const annule = await marquerArticleAnnule(articleEnregistre.id, rapport.scoreConfiance, rapport.raison);
    console.log(`\n✗ Publication annulée (statut = ${annule.statut})`);
    console.log(`Raison enregistrée : ${annule.raison_annulation}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de vérification :', err.message);
  process.exit(1);
});
