import Link from 'next/link';
import { couleurDomaine } from '../lib/domaineCouleur.js';

export default function ArticleRailItem({ article, afficherDomaine = true }) {
  const nbSources = Array.isArray(article.sources) ? article.sources.length : 0;
  const rythme = article.type_cycle === 'reactif' ? 'sujet chaud' : 'veille quotidienne';

  return (
    <div className="rail-item" style={{ '--domaine-couleur': couleurDomaine(article.domaine_slug) }}>
      {afficherDomaine && <span className="domaine-tag">{article.domaine_nom}</span>}
      <h3>
        <Link href={`/article/${article.slug}`}>{article.titre}</Link>
      </h3>
      <span className="meta">
        {nbSources > 0 ? `${nbSources} source${nbSources > 1 ? 's' : ''} · ${rythme}` : rythme}
      </span>
    </div>
  );
}
