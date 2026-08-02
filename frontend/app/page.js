import { Fragment } from 'react';
import ArticleCard from '../components/ArticleCard.js';
import ArticleLead from '../components/ArticleLead.js';
import ArticleRailItem from '../components/ArticleRailItem.js';
import PubSlot from '../components/PubSlot.js';
import { getArticlesPublies } from '../lib/articles.js';

// Rendu à la demande plutôt qu'ISR : évite que `next build` (ex. dans un
// conteneur Docker) ait besoin d'un accès à la base de données.
export const dynamic = 'force-dynamic';

export default async function AccueilPage() {
  const articles = await getArticlesPublies({ limite: 20 });

  if (articles.length === 0) {
    return (
      <div className="page-flux">
        <h1>Flux global</h1>
        <p>Aucun article publié pour le moment.</p>
      </div>
    );
  }

  const [vedette, ...reste] = articles;
  const rail = reste.slice(0, 4);
  const suite = reste.slice(4);

  return (
    <div className="page-flux">
      <h1>Flux global</h1>
      <div className="layout">
        <ArticleLead article={vedette} />
        {rail.length > 0 && (
          <aside className="rail">
            <p className="rail-title">Aussi cette semaine</p>
            {rail.map((article) => (
              <ArticleRailItem key={article.id} article={article} />
            ))}
          </aside>
        )}
      </div>

      {suite.length > 0 && (
        <div className="liste-articles liste-articles-suite">
          {suite.map((article, index) => (
            <Fragment key={article.id}>
              <ArticleCard article={article} />
              {index === 2 && <PubSlot slotId="flux-global-1" />}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
