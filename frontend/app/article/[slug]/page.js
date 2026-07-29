import { notFound } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import CycleBadge from '../../../components/CycleBadge.js';
import PubSlot from '../../../components/PubSlot.js';
import { getArticleParSlug } from '../../../lib/articles.js';

export const revalidate = 300;
export const dynamicParams = true;

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function corpsEnHtmlSecurise(corpsMarkdown) {
  const html = marked.parse(corpsMarkdown || '');
  return DOMPurify.sanitize(html);
}

// Coupe le corps en deux au niveau d'un paragraphe médian pour insérer un
// emplacement publicitaire au milieu de l'article sans casser une phrase.
function couperAuMilieu(html) {
  const paragraphes = html.split('</p>');
  if (paragraphes.length < 3) {
    return [html, ''];
  }
  const milieu = Math.floor(paragraphes.length / 2);
  const avant = paragraphes.slice(0, milieu).join('</p>') + '</p>';
  const apres = paragraphes.slice(milieu).join('</p>');
  return [avant, apres];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleParSlug(slug);
  if (!article) return {};

  const metaSeo = article.meta_seo || {};
  return {
    title: metaSeo.titre_seo || article.titre,
    description: metaSeo.description || article.extrait,
    keywords: Array.isArray(metaSeo.mots_cles) ? metaSeo.mots_cles.join(', ') : undefined,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleParSlug(slug);
  if (!article) notFound();

  const [corpsAvant, corpsApres] = couperAuMilieu(corpsEnHtmlSecurise(article.corps));
  const sources = Array.isArray(article.sources) ? article.sources : [];

  return (
    <article className="page-article">
      <div className="article-meta">
        <span className="domaine-tag">{article.domaine_nom}</span>
        <CycleBadge typeCycle={article.type_cycle} />
        <time dateTime={article.publie_le}>{formatDate(article.publie_le)}</time>
      </div>

      <h1>{article.titre}</h1>
      <p className="article-extrait">{article.extrait}</p>

      <PubSlot slotId="article-haut" />

      {/* Contenu généré par le pipeline éditorial, assaini avant injection (voir corpsEnHtmlSecurise). */}
      <div className="article-corps" dangerouslySetInnerHTML={{ __html: corpsAvant }} />
      {corpsApres && <PubSlot slotId="article-milieu" />}
      {corpsApres && <div className="article-corps" dangerouslySetInnerHTML={{ __html: corpsApres }} />}

      {sources.length > 0 && (
        <section className="article-sources">
          <h2>Sources</h2>
          <ul>
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                  {s.titre}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PubSlot slotId="article-bas" />
    </article>
  );
}
