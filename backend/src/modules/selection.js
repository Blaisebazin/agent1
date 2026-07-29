import { getSujetsRecents, enregistrerSujets } from '../db/sujetsTraites.js';

// Constantes de scoring — volontairement isolées ici pour être recalibrées
// après une phase de test réelle (cf. cahier des charges, section 10.4).
const POINTS_PAR_SOURCE = 3;
const MAX_SOURCES_COMPTEES = 5;
const SEUIL_SIMILARITE_DEDUPLICATION = 0.5; // au-delà, sujet considéré comme doublon
const JOURS_HISTORIQUE_DEDUP = 30;
const MOTS_VIDES = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'en', 'au', 'aux',
  'à', 'dans', 'pour', 'par', 'sur', 'avec', 'sans', 'ce', 'cette', 'ces', 'son',
  'sa', 'ses', 'est', 'sont', 'a', 'ont', 'que', 'qui', 'se', 'sa', 'ne', 'pas',
]);

const DIACRITIQUES = new RegExp('[̀-ͯ]', 'g');

function normaliser(texte) {
  return (texte || '')
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((mot) => mot.length > 2 && !MOTS_VIDES.has(mot));
}

function similariteJaccard(texteA, texteB) {
  const ensembleA = new Set(normaliser(texteA));
  const ensembleB = new Set(normaliser(texteB));
  if (ensembleA.size === 0 || ensembleB.size === 0) return 0;

  let intersection = 0;
  for (const mot of ensembleA) {
    if (ensembleB.has(mot)) intersection += 1;
  }
  const union = ensembleA.size + ensembleB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function scorerCandidat(candidat, sujetsRecents) {
  const nbSources = Math.min((candidat.sources || []).length, MAX_SOURCES_COMPTEES);
  const scoreSources = nbSources * POINTS_PAR_SOURCE;

  let similariteMax = 0;
  for (const recent of sujetsRecents) {
    const s = similariteJaccard(
      `${candidat.sujet} ${candidat.resume}`,
      `${recent.sujet} ${recent.resume}`
    );
    if (s > similariteMax) similariteMax = s;
  }

  const estDoublon = similariteMax >= SEUIL_SIMILARITE_DEDUPLICATION;
  const scoreEcartHistorique = 10 * (1 - similariteMax);
  const score = Number((scoreSources + scoreEcartHistorique).toFixed(2));

  return { score, similariteMax: Number(similariteMax.toFixed(2)), estDoublon };
}

export async function selectionnerSujet(domaine, candidats, { typeCycle = 'quotidien' } = {}) {
  const sujetsRecents = await getSujetsRecents(domaine.id, { joursRecents: JOURS_HISTORIQUE_DEDUP });

  const candidatsNotes = candidats.map((candidat) => ({
    candidat,
    ...scorerCandidat(candidat, sujetsRecents),
  }));

  const eligibles = candidatsNotes.filter((c) => !c.estDoublon);
  const meilleur = eligibles.sort((a, b) => b.score - a.score)[0] || null;

  const lignesAEnregistrer = candidatsNotes.map((c) => ({
    domaineId: domaine.id,
    sujet: c.candidat.sujet,
    resume: c.candidat.resume,
    score: c.score,
    typeCycle,
    statut: meilleur && c.candidat === meilleur.candidat ? 'retenu' : 'rejete',
    sourceUrls: c.candidat.sources || [],
  }));

  const lignesEnregistrees = await enregistrerSujets(lignesAEnregistrer);
  const sujetRetenu = lignesEnregistrees.find((l) => l.statut === 'retenu') || null;

  return {
    sujetRetenu,
    candidatsNotes: candidatsNotes.map((c) => ({
      sujet: c.candidat.sujet,
      score: c.score,
      similariteMax: c.similariteMax,
      estDoublon: c.estDoublon,
    })),
  };
}
