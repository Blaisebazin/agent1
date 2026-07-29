import { getPool } from './db.js';

const CHAMPS = `a.id, a.titre, a.slug, a.extrait, a.corps, a.sources, a.type_cycle,
  a.statut, a.score_confiance, a.meta_seo, a.publie_le,
  d.nom AS domaine_nom, d.slug AS domaine_slug`;

export async function getArticlesPublies({ domaineSlug, limite = 20 } = {}) {
  const pool = getPool();

  if (domaineSlug) {
    const { rows } = await pool.query(
      `SELECT ${CHAMPS}
       FROM articles a
       JOIN domaines d ON d.id = a.domaine_id
       WHERE a.statut = 'publie' AND d.slug = $1
       ORDER BY a.publie_le DESC
       LIMIT $2`,
      [domaineSlug, limite]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `SELECT ${CHAMPS}
     FROM articles a
     JOIN domaines d ON d.id = a.domaine_id
     WHERE a.statut = 'publie'
     ORDER BY a.publie_le DESC
     LIMIT $1`,
    [limite]
  );
  return rows;
}

export async function getArticleParSlug(slug) {
  const { rows } = await getPool().query(
    `SELECT ${CHAMPS}
     FROM articles a
     JOIN domaines d ON d.id = a.domaine_id
     WHERE a.slug = $1 AND a.statut = 'publie'`,
    [slug]
  );
  return rows[0] || null;
}
