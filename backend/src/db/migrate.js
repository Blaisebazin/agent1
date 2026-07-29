import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.resolve(__dirname, '../../../database');

async function run() {
  const schema = await readFile(path.join(databaseDir, 'schema.sql'), 'utf8');
  const seed = await readFile(path.join(databaseDir, 'seed.sql'), 'utf8');

  await pool.query(schema);
  console.log('Schéma appliqué (domaines, sujets_traites, articles).');

  await pool.query(seed);
  console.log('Domaines de départ insérés (idempotent).');

  await pool.end();
}

run().catch((err) => {
  console.error('Échec de la migration :', err);
  process.exit(1);
});
