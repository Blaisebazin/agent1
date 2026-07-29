import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

const client = new Anthropic({ apiKey: env.anthropicApiKey });

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

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1) {
    throw new Error(`Impossible de trouver un tableau JSON dans la réponse : ${text.slice(0, 500)}`);
  }
  return JSON.parse(raw.slice(start, end + 1));
}

export async function rechercherSujets(domaine) {
  let messages = [{ role: 'user', content: buildUserPrompt(domaine) }];
  let response = await client.messages.create({
    model: env.anthropicModel,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
    output_config: { effort: 'medium' },
    messages,
  });

  let continuations = 0;
  while (response.stop_reason === 'pause_turn' && continuations < 3) {
    messages = [...messages, { role: 'assistant', content: response.content }];
    response = await client.messages.create({
      model: env.anthropicModel,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
      output_config: { effort: 'medium' },
      messages,
    });
    continuations += 1;
  }

  if (response.stop_reason === 'refusal') {
    throw new Error(`Recherche refusée par les garde-fous du modèle (catégorie : ${response.stop_details?.category ?? 'inconnue'})`);
  }

  const texte = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const candidats = extractJson(texte);

  if (!Array.isArray(candidats) || candidats.length === 0) {
    throw new Error('Le module de veille n\'a renvoyé aucun sujet candidat.');
  }

  return candidats;
}
