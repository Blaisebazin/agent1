import { rechercherSujets } from '../modules/veille.js';
import { selectionnerSujet } from '../modules/selection.js';
import { redigerArticle } from '../modules/redaction.js';
import { verifierArticle } from '../modules/verification.js';
import { enregistrerArticleBrouillon, marquerArticlePublie, marquerArticleAnnule } from '../db/articles.js';
import { slugifier } from '../utils/slugify.js';
import { detecterSujetChaud, SEUIL_DECLENCHEMENT_REACTIF } from './sujetChaud.js';

async function finaliserSujetRetenu(domaine, sujetRetenu) {
  const article = await redigerArticle(domaine, sujetRetenu);

  const articleEnregistre = await enregistrerArticleBrouillon({
    domaineId: domaine.id,
    sujetTraiteId: sujetRetenu.id,
    titre: article.titre,
    slug: slugifier(article.titre),
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

  const rapportVerification = await verifierArticle(article);

  const articleFinal = rapportVerification.estValide
    ? await marquerArticlePublie(articleEnregistre.id, rapportVerification.scoreConfiance)
    : await marquerArticleAnnule(articleEnregistre.id, rapportVerification.scoreConfiance, rapportVerification.raison);

  return {
    statut: articleFinal.statut, // 'publie' | 'annule'
    article,
    articleEnregistre: articleFinal,
    rapportVerification,
  };
}

export async function executerCycleQuotidien(domaine) {
  const candidats = await rechercherSujets(domaine);
  const { sujetRetenu } = await selectionnerSujet(domaine, candidats, { typeCycle: 'quotidien' });

  if (!sujetRetenu) {
    return { statut: 'aucun_sujet', nbCandidats: candidats.length, sujetRetenu: null };
  }

  const resultat = await finaliserSujetRetenu(domaine, sujetRetenu);
  return { nbCandidats: candidats.length, sujetRetenu, ...resultat };
}

export async function executerScanReactif(domaine) {
  const detection = await detecterSujetChaud(domaine);

  if (!detection.sujetChaudDetecte || detection.score < SEUIL_DECLENCHEMENT_REACTIF) {
    return { statut: 'rien_de_chaud', detection, sujetRetenu: null };
  }

  const candidat = {
    sujet: detection.titreSujet,
    resume: detection.resume,
    sources: detection.sources || [],
  };

  const { sujetRetenu } = await selectionnerSujet(domaine, [candidat], { typeCycle: 'reactif' });

  if (!sujetRetenu) {
    return { statut: 'doublon_ecarte', detection, sujetRetenu: null };
  }

  const resultat = await finaliserSujetRetenu(domaine, sujetRetenu);
  return { detection, sujetRetenu, ...resultat };
}
