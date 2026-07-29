import { creerMessageAvecOutils, extraireTexte, extraireJson } from './anthropicClient.js';

const SYSTEM_PROMPT = `Tu es le module de veille d'un système éditorial automatisé.
Ton rôle : repérer des sujets d'actualité récents et pertinents dans un domaine donné, à l'aide de la recherche web — pas de les analyser ni de rédiger un article.
Tu dois toujours effectuer au moins une recherche web avant de répondre.
Réponds UNIQUEMENT avec un bloc de code JSON (\`\`\`json ... \`\`\`) contenant un tableau d'objets, sans aucun texte avant ou après. Chaque objet doit avoir exactement ces champs :
- "sujet" : titre court et factuel du sujet candidat
- "resume" : 2 à 3 phrases résumant l'actualité
- "nouveaute" : pourquoi ce sujet est d'actualité maintenant (événement récent, pic de couverture, etc.)
- "sources" : tableau d'objets {"titre": string, "url": string} — les sources réellement trouvées via la recherche`;

function buildUserPrompt(domaine) {
  const motsCles = (domaine.mots_cles || []).join(', ');
  return `Domaine : ${domaine.nom}
Description : ${domaine.description || 'N/A'}
Mots-clés de veille : ${motsCles || 'N/A'}

Recherche l'actualité récente (dernières 48 à 72 heures si possible) sur ce domaine, puis identifie entre 3 et 5 sujets candidats distincts et non redondants entre eux. Chaque sujet doit s'appuyer sur au moins une source trouvée par la recherche.`;
}

export async function rechercherSujets(domaine) {
  const response = await creerMessageAvecOutils({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(domaine) }],
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
    maxTokens: 4096,
    effort: 'medium',
  });

  const candidats = extraireJson(extraireTexte(response));

  if (!Array.isArray(candidats) || candidats.length === 0) {
    throw new Error('Le module de veille n\'a renvoyé aucun sujet candidat.');
  }

  return candidats;
}
