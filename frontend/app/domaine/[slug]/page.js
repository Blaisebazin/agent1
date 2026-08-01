import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import ArticleCard from '../../../components/ArticleCard.js';
import PubSlot from '../../../components/PubSlot.js';
import { getDomaineParSlug } from '../../../lib/domaines.js';
import { getArticlesPublies } from '../../../lib/articles.js';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const domaine = await getDomaineParSlug(slug);
  if (!domaine) return {};
  return {
    title: `${domaine.nom} — Contexta`,
    description: domaine.description || undefined,
  };
}

export default async function DomainePage({ params }) {
  const { slug } = await params;
  const domaine = await getDomaineParSlug(slug);
  if (!domaine) notFound();

  const articles = await getArticlesPublies({ domaineSlug: slug, limite: 20 });

  return (
    <div className="page-flux">
      <h1>{domaine.nom}</h1>
      {domaine.description && <p className="domaine-description">{domaine.description}</p>}
      {articles.length === 0 ? (
        <p>Aucun article publié pour ce domaine pour le moment.</p>
      ) : (
        <div className="liste-articles">
          {articles.map((article, index) => (
            <Fragment key={article.id}>
              <ArticleCard article={article} afficherDomaine={false} />
              {index === 2 && <PubSlot slotId="domaine-1" />}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
