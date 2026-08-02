import Link from 'next/link';
import CycleBadge from './CycleBadge.js';
import { couleurDomaine } from '../lib/domaineCouleur.js';

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticleLead({ article, afficherDomaine = true }) {
  const nbSources = Array.isArray(article.sources) ? article.sources.length : 0;

  return (
    <article className="lead" style={{ '--domaine-couleur': couleurDomaine(article.domaine_slug) }}>
      {afficherDomaine && <span className="eyebrow">{article.domaine_nom} — analyse</span>}
      <h2>
        <Link href={`/article/${article.slug}`}>{article.titre}</Link>
      </h2>
      <p className="dek">{article.extrait}</p>
      <div className="byline">
        <CycleBadge typeCycle={article.type_cycle} />
        {nbSources > 0 && (
          <span>
            {nbSources} source{nbSources > 1 ? 's' : ''} croisée{nbSources > 1 ? 's' : ''}
          </span>
        )}
        <time dateTime={article.publie_le}>{formatDate(article.publie_le)}</time>
      </div>
    </article>
  );
}
