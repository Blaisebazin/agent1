import Link from 'next/link';
import CycleBadge from './CycleBadge.js';
import { couleurDomaine } from '../lib/domaineCouleur.js';

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticleCard({ article, afficherDomaine = true }) {
  const nbSources = Array.isArray(article.sources) ? article.sources.length : 0;

  return (
    <article className="article-card" style={{ '--domaine-couleur': couleurDomaine(article.domaine_slug) }}>
      <div className="article-card-meta">
        {afficherDomaine && <span className="domaine-tag">{article.domaine_nom}</span>}
        <CycleBadge typeCycle={article.type_cycle} />
        <time dateTime={article.publie_le}>{formatDate(article.publie_le)}</time>
      </div>
      <h2>
        <Link href={`/article/${article.slug}`}>{article.titre}</Link>
      </h2>
      {nbSources > 0 && (
        <p className="sources-signature">
          {nbSources} source{nbSources > 1 ? 's' : ''} croisée{nbSources > 1 ? 's' : ''}
        </p>
      )}
      <p>{article.extrait}</p>
    </article>
  );
}
