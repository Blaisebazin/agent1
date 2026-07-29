import { getDomaineBySlug } from '../db/domaines.js';
import { rechercherSujets } from '../modules/veille.js';
import { selectionnerSujet } from '../modules/selection.js';
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

  console.log('Sélection en cours...\n');
  const { sujetRetenu, candidatsNotes } = await selectionnerSujet(domaine, candidats);

  console.log('Scores calculés :');
  candidatsNotes.forEach((c) => {
    const marque = sujetRetenu && c.sujet === sujetRetenu.sujet ? '✓ RETENU' : c.estDoublon ? '✗ doublon' : '  rejeté';
    console.log(`  [${marque}] score=${c.score} similarite_max=${c.similariteMax} — ${c.sujet}`);
  });

  console.log('\nSujet retenu et enregistré en base :');
  console.log(sujetRetenu ? JSON.stringify(sujetRetenu, null, 2) : 'Aucun (tous les candidats étaient des doublons)');

  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de sélection :', err.message);
  process.exit(1);
});
