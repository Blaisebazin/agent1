import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

export const client = new Anthropic({ apiKey: env.anthropicApiKey });

export async function creerMessageAvecOutils({ system, messages, tools, maxTokens = 4096, effort = 'medium' }) {
  let historique = messages;
  let response = await client.messages.create({
    model: env.anthropicModel,
    max_tokens: maxTokens,
    system,
    tools,
    output_config: { effort },
    messages: historique,
  });

  let continuations = 0;
  while (response.stop_reason === 'pause_turn' && continuations < 3) {
    historique = [...historique, { role: 'assistant', content: response.content }];
    response = await client.messages.create({
      model: env.anthropicModel,
      max_tokens: maxTokens,
      system,
      tools,
      output_config: { effort },
      messages: historique,
    });
    continuations += 1;
  }

  if (response.stop_reason === 'refusal') {
    throw new Error(`Requête refusée par les garde-fous du modèle (catégorie : ${response.stop_details?.category ?? 'inconnue'})`);
  }

  return response;
}

export function extraireTexte(response) {
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

export function extraireJson(texte) {
  const fenced = texte.match(/```(?:json)?\s*([\s\S]*?)```/);
  const brut = fenced ? fenced[1] : texte;

  const premiereAccolade = brut.indexOf('{');
  const premierCrochet = brut.indexOf('[');
  const debuts = [premiereAccolade, premierCrochet].filter((i) => i !== -1);
  if (debuts.length === 0) {
    throw new Error(`Impossible de trouver du JSON dans la réponse : ${texte.slice(0, 500)}`);
  }
  const debut = Math.min(...debuts);
  const caractereFermant = brut[debut] === '{' ? '}' : ']';
  const fin = brut.lastIndexOf(caractereFermant);
  if (fin === -1) {
    throw new Error(`JSON mal formé dans la réponse : ${texte.slice(0, 500)}`);
  }
  return JSON.parse(brut.slice(debut, fin + 1));
}
