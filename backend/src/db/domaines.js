import { pool } from './client.js';

export async function getDomaineBySlug(slug) {
  const { rows } = await pool.query('SELECT * FROM domaines WHERE slug = $1', [slug]);
  return rows[0] || null;
}
