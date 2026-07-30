import { creerMessageJson } from './anthropicClient.js';
import { env } from '../config/env.js';

function buildSystemPrompt(domaine) {
  const ton = domaine.ton || 'neutre, factuel, journalistique';
  const angle = domaine.angle_editorial || `un angle éditorial pertinent pour le domaine ${domaine.nom}`;

  return `Tu es le module d'analyse et de rédaction d'un système éditorial automatisé.
À partir d'un sujet déjà retenu par le module de sélection, ton rôle est de produire une ANALYSE ARGUMENTÉE — pas un résumé ni une compilation d'actualité.

Démarche obligatoire :
1. Recherche et lis plusieurs sources indépendantes sur le sujet (au moins 3 si possible), y compris les sources déjà connues fournies
2. Identifie les points de convergence et de désaccord entre ces sources
3. Construis un point de vue argumenté, cohérent avec ${angle}
4. Rédige un article structuré et optimisé pour le référencement (titre et sous-titres clairs, mots-clés naturels)

Contraintes impératives :
- Chaque affirmation factuelle importante doit être appuyée par une source citée EXPLICITEMENT dans le texte, sous forme de lien Markdown [texte](url) pointant vers une URL présente dans le tableau "sources" que tu renvoies
- N'invente jamais de source, de citation ou de chiffre
- Le corps de l'article est en Markdown : un titre principal (#), plusieurs sous-titres (##), plusieurs paragraphes développant l'analyse
- Le ton de l'article doit être : ${ton}

Réponds UNIQUEMENT avec un bloc de code JSON (\`\`\`json ... \`\`\`) contenant un objet avec exactement ces champs :
- "titre" : titre SEO, factuel et accrocheur (pas de clickbait trompeur)
- "extrait" : 1 à 2 phrases pour la méta-description
- "corps" : le corps complet de l'article en Markdown, avec citations en liens Markdown vers les sources
- "sources" : tableau [{"titre": string, "url": string}] de toutes les sources effectivement citées dans le corps
- "mots_cles_seo" : tableau de 5 à 8 mots-clés pertinents pour le référencement

Dans les valeurs de chaîne du JSON (notamment "corps"), n'utilise jamais de guillemets droits (") pour une citation directe — utilise des guillemets français « » à la place ; réserve le caractère " exclusivement à la syntaxe JSON et aux liens Markdown.`;
}

function buildUserPrompt(domaine, sujetRetenu) {
  const sourcesConnues = (sujetRetenu.source_urls || [])
    .map((s) => `- ${s.titre} — ${s.url}`)
    .join('\n');

  return `Sujet retenu : ${sujetRetenu.sujet}
Résumé initial (issu de la veille) : ${sujetRetenu.resume}
Domaine : ${domaine.nom}

Sources déjà identifiées lors de la veille :
${sourcesConnues || 'Aucune'}

Lis ces sources et recherche-en d'autres si nécessaire pour croiser les points de vue, puis rédige l'article.`;
}

export async function redigerArticle(domaine, sujetRetenu) {
  const article = await creerMessageJson({
    system: buildSystemPrompt(domaine),
    messages: [{ role: 'user', content: buildUserPrompt(domaine, sujetRetenu) }],
    tools: [
      { type: 'web_search_20260209', name: 'web_search', max_uses: 6 },
      { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 6 },
    ],
    model: env.anthropicModelRedaction,
    maxTokens: 24000,
    effort: 'high',
    label: `redaction:${domaine.slug}`,
  });

  if (!article.titre || !article.corps || !Array.isArray(article.sources) || article.sources.length === 0) {
    throw new Error('Article généré incomplet (titre, corps ou sources manquants).');
  }

  return article;
}
