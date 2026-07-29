import Link from 'next/link';
import CycleBadge from './CycleBadge.js';

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticleCard({ article, afficherDomaine = true }) {
  return (
    <article className="article-card">
      <div className="article-card-meta">
        {afficherDomaine && <span className="domaine-tag">{article.domaine_nom}</span>}
        <CycleBadge typeCycle={article.type_cycle} />
        <time dateTime={article.publie_le}>{formatDate(article.publie_le)}</time>
      </div>
      <h2>
        <Link href={`/article/${article.slug}`}>{article.titre}</Link>
      </h2>
      <p>{article.extrait}</p>
    </article>
  );
}
