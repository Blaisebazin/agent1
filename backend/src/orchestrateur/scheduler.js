import cron from 'node-cron';
import { pool } from '../db/client.js';
import { executerCycleQuotidien, executerScanReactif } from './cycleEditorial.js';

const HEURE_BASE_CYCLE_QUOTIDIEN = 6; // heure locale du serveur
const ECART_MINUTES_ENTRE_DOMAINES = 20; // décalage entre domaines pour ne pas tout lancer simultanément
const INTERVALLE_SCAN_REACTIF_MINUTES = 60; // haut de la fourchette du cahier des charges (30 à 60 min) — limite le volume d'appels

async function getDomainesActifs() {
  const { rows } = await pool.query('SELECT * FROM domaines WHERE actif = true ORDER BY id');
  return rows;
}

// Le champ "minute" d'une expression cron va de 0 à 59 : "*/60" n'a de sens
// que par coïncidence (ne matche que la minute 0). Pour un intervalle
// multiple de 60, on exprime donc la récurrence sur le champ "heure".
function construireExpressionReactif(intervalleMinutes) {
  if (intervalleMinutes % 60 === 0) {
    const heures = intervalleMinutes / 60;
    return heures === 1 ? '0 * * * *' : `0 */${heures} * * *`;
  }
  return `*/${intervalleMinutes} * * * *`;
}

function calculerHoraire(indexDomaine) {
  const minutesTotal = indexDomaine * ECART_MINUTES_ENTRE_DOMAINES;
  const heure = (HEURE_BASE_CYCLE_QUOTIDIEN + Math.floor(minutesTotal / 60)) % 24;
  const minute = minutesTotal % 60;
  return { heure, minute };
}

async function lancerCycleQuotidien(domaine) {
  console.log(`[scheduler] Démarrage du cycle quotidien — domaine "${domaine.nom}"`);
  try {
    const resultat = await executerCycleQuotidien(domaine);
    console.log(`[scheduler] Cycle quotidien terminé — domaine "${domaine.nom}" — statut : ${resultat.statut}`);
  } catch (err) {
    console.error(`[scheduler] Échec du cycle quotidien — domaine "${domaine.nom}" :`, err.message);
  }
}

async function lancerScanReactif(domaine) {
  try {
    const resultat = await executerScanReactif(domaine);
    if (resultat.statut === 'publie' || resultat.statut === 'annule') {
      console.log(
        `[scheduler] Sujet chaud traité hors cycle — domaine "${domaine.nom}" — statut : ${resultat.statut} (score détection : ${resultat.detection.score})`
      );
    } else {
      console.log(`[scheduler] Scan réactif — domaine "${domaine.nom}" — ${resultat.statut} (score : ${resultat.detection.score})`);
    }
  } catch (err) {
    console.error(`[scheduler] Échec du scan réactif — domaine "${domaine.nom}" :`, err.message);
  }
}

export async function demarrerOrchestrateur() {
  const domaines = await getDomainesActifs();

  if (domaines.length === 0) {
    console.warn('[scheduler] Aucun domaine actif — orchestrateur non démarré.');
    return;
  }

  domaines.forEach((domaine, index) => {
    const { heure, minute } = calculerHoraire(index);
    const expression = `${minute} ${heure} * * *`;
    cron.schedule(expression, () => lancerCycleQuotidien(domaine));
    console.log(
      `[scheduler] Cycle quotidien planifié — "${domaine.nom}" à ${String(heure).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    );
  });

  const expressionReactif = construireExpressionReactif(INTERVALLE_SCAN_REACTIF_MINUTES);
  cron.schedule(expressionReactif, async () => {
    console.log('[scheduler] Scan réactif — début du tour des domaines actifs');
    for (const domaine of domaines) {
      await lancerScanReactif(domaine);
    }
  });
  console.log(`[scheduler] Scan réactif planifié toutes les ${INTERVALLE_SCAN_REACTIF_MINUTES} minutes`);
}
