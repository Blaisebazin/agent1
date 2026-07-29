import { pool } from './client.js';

export async function getSujetsRecents(domaineId, { statut = 'retenu', joursRecents = 30 } = {}) {
  const { rows } = await pool.query(
    `SELECT sujet, resume
     FROM sujets_traites
     WHERE domaine_id = $1
       AND statut = $2
       AND created_at > now() - ($3 || ' days')::interval
     ORDER BY created_at DESC`,
    [domaineId, statut, joursRecents]
  );
  return rows;
}

export async function enregistrerSujets(lignes) {
  const inserted = [];
  for (const ligne of lignes) {
    const { rows } = await pool.query(
      `INSERT INTO sujets_traites (domaine_id, sujet, resume, score, type_cycle, statut, source_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        ligne.domaineId,
        ligne.sujet,
        ligne.resume,
        ligne.score,
        ligne.typeCycle,
        ligne.statut,
        JSON.stringify(ligne.sourceUrls || []),
      ]
    );
    inserted.push(rows[0]);
  }
  return inserted;
}
