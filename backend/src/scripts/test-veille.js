import { getDomaineBySlug } from '../db/domaines.js';
import { rechercherSujets } from '../modules/veille.js';
import { pool } from '../db/client.js';

async function main() {
  const slug = process.argv[2] || 'numerique';
  const domaine = await getDomaineBySlug(slug);

  if (!domaine) {
    throw new Error(`Domaine introuvable : ${slug}`);
  }

  console.log(`Veille en cours pour le domaine "${domaine.nom}"...\n`);

  const candidats = await rechercherSujets(domaine);

  console.log(`${candidats.length} sujet(s) candidat(s) trouvé(s) :\n`);
  candidats.forEach((c, i) => {
    console.log(`${i + 1}. ${c.sujet}`);
    console.log(`   Résumé     : ${c.resume}`);
    console.log(`   Nouveauté  : ${c.nouveaute}`);
    console.log(`   Sources    :`);
    (c.sources || []).forEach((s) => console.log(`     - ${s.titre} — ${s.url}`));
    console.log('');
  });

  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de veille :', err.message);
  process.exit(1);
});
