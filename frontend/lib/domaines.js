import { getPool } from './db.js';

export async function getDomaines() {
  const { rows } = await getPool().query('SELECT * FROM domaines WHERE actif = true ORDER BY nom');
  return rows;
}

export async function getDomaineParSlug(slug) {
  const { rows } = await getPool().query('SELECT * FROM domaines WHERE slug = $1', [slug]);
  return rows[0] || null;
}
