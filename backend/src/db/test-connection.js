import { pool } from './client.js';

async function main() {
  const { rows } = await pool.query('SELECT slug, nom, actif FROM domaines ORDER BY id');
  console.log(`Connexion DB OK — ${rows.length} domaine(s) en base :`);
  for (const row of rows) {
    console.log(`  - ${row.slug} (${row.nom}) actif=${row.actif}`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error('Échec du test de connexion :', err);
  process.exit(1);
});
