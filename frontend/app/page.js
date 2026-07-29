import { Fragment } from 'react';
import ArticleCard from '../components/ArticleCard.js';
import PubSlot from '../components/PubSlot.js';
import { getArticlesPublies } from '../lib/articles.js';

// Rendu à la demande plutôt qu'ISR : évite que `next build` (ex. dans un
// conteneur Docker) ait besoin d'un accès à la base de données.
export const dynamic = 'force-dynamic';

export default async function AccueilPage() {
  const articles = await getArticlesPublies({ limite: 20 });

  return (
    <div className="page-flux">
      <h1>Flux global</h1>
      {articles.length === 0 ? (
        <p>Aucun article publié pour le moment.</p>
      ) : (
        <div className="liste-articles">
          {articles.map((article, index) => (
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
