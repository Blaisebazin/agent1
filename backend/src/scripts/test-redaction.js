import { getDomaineBySlug } from '../db/domaines.js';
import { rechercherSujets } from '../modules/veille.js';
import { selectionnerSujet } from '../modules/selection.js';
import { redigerArticle } from '../modules/redaction.js';
import { enregistrerArticleBrouillon } from '../db/articles.js';
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

  console.log('Rédaction en cours (croisement de sources)...');
  const article = await redigerArticle(domaine, sujetRetenu);

  const slugArticle = slugifier(article.titre);
  const articleEnregistre = await enregistrerArticleBrouillon({
    domaineId: domaine.id,
    sujetTraiteId: sujetRetenu.id,
    titre: article.titre,
    slug: slugArticle,
    extrait: article.extrait,
    corps: article.corps,
    sources: article.sources,
    typeCycle: sujetRetenu.type_cycle,
    metaSeo: {
      titre_seo: article.titre,
      description: article.extrait,
      mots_cles: article.mots_cles_seo || [],
    },
  });

  console.log('\n=== ARTICLE GÉNÉRÉ (brouillon) ===');
  console.log(`Titre   : ${articleEnregistre.titre}`);
  console.log(`Slug    : ${articleEnregistre.slug}`);
  console.log(`Extrait : ${articleEnregistre.extrait}`);
  console.log(`Sources : ${article.sources.length}`);
  article.sources.forEach((s) => console.log(`  - ${s.titre} — ${s.url}`));
  console.log(`\nCorps (${article.corps.length} caractères) :\n`);
  console.log(article.corps);
  console.log(`\nEnregistré en base — id article = ${articleEnregistre.id}, statut = ${articleEnregistre.statut}`);

  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de rédaction :', err.message);
  process.exit(1);
});
