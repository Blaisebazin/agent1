import { pool } from './client.js';

export async function enregistrerArticleBrouillon({
  domaineId,
  sujetTraiteId,
  titre,
  slug,
  extrait,
  corps,
  sources,
  typeCycle,
  metaSeo,
}) {
  const { rows } = await pool.query(
    `INSERT INTO articles (domaine_id, sujet_traite_id, titre, slug, extrait, corps, sources, type_cycle, statut, meta_seo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'brouillon', $9)
     RETURNING *`,
    [domaineId, sujetTraiteId, titre, slug, extrait, corps, JSON.stringify(sources), typeCycle, JSON.stringify(metaSeo)]
  );
  return rows[0];
}
