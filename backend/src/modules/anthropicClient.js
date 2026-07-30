import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

export const client = new Anthropic({ apiKey: env.anthropicApiKey });

// Tarifs approximatifs (USD par million de tokens) pour l'estimation de coût
// affichée dans les logs — à ajuster si les tarifs changent.
const TARIFS_PAR_MODELE = {
  'claude-opus-5': { entree: 5, sortie: 25 },
  'claude-sonnet-5': { entree: 3, sortie: 15 },
  'claude-haiku-4-5': { entree: 1, sortie: 5 },
};

function estimerCout(modele, usage) {
  const tarif = TARIFS_PAR_MODELE[modele];
  if (!tarif) return null;
  return (usage.input_tokens * tarif.entree + usage.output_tokens * tarif.sortie) / 1_000_000;
}

function nouveauUsageCumule() {
  return { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
}

function accumulerUsage(cumul, usage) {
  cumul.input_tokens += usage?.input_tokens || 0;
  cumul.output_tokens += usage?.output_tokens || 0;
  cumul.cache_creation_input_tokens += usage?.cache_creation_input_tokens || 0;
  cumul.cache_read_input_tokens += usage?.cache_read_input_tokens || 0;
}

function loggerUsage(label, modele, usage) {
  const cout = estimerCout(modele, usage);
  console.log(
    `[usage] ${label} (${modele}) — entrée: ${usage.input_tokens} · sortie: ${usage.output_tokens} · ` +
      `cache écrit: ${usage.cache_creation_input_tokens} · cache lu: ${usage.cache_read_input_tokens}` +
      (cout !== null ? ` · coût estimé: $${cout.toFixed(4)}` : ' · coût estimé: N/A (modèle inconnu)')
  );
}

async function appelerModele({ model, system, tools, maxTokens, effort, messages }) {
  return client.messages
    .stream({
      model,
      max_tokens: maxTokens,
      system,
      tools,
      output_config: { effort },
      messages,
    })
    .finalMessage();
}

export async function creerMessageAvecOutils({
  system,
  messages,
  tools,
  model = env.anthropicModel,
  maxTokens = 4096,
  effort = 'medium',
  label = 'appel',
}) {
  const usageCumule = nouveauUsageCumule();

  let historique = messages;
  let response = await appelerModele({ model, system, tools, maxTokens, effort, messages: historique });
  accumulerUsage(usageCumule, response.usage);

  let continuations = 0;
  while (response.stop_reason === 'pause_turn' && continuations < 3) {
    historique = [...historique, { role: 'assistant', content: response.content }];
    response = await appelerModele({ model, system, tools, maxTokens, effort, messages: historique });
    accumulerUsage(usageCumule, response.usage);
    continuations += 1;
  }

  loggerUsage(label, model, usageCumule);

  if (response.stop_reason === 'refusal') {
    throw new Error(`Requête refusée par les garde-fous du modèle (catégorie : ${response.stop_details?.category ?? 'inconnue'})`);
  }

  if (response.stop_reason === 'max_tokens') {
    throw new Error(
      `Réponse tronquée : la limite de max_tokens (${maxTokens}) a été atteinte avant la fin de la génération. Augmenter maxTokens pour cet appel.`
    );
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

const CONSIGNE_CORRECTION_JSON =
  "Le bloc JSON ci-dessus n'a pas pu être analysé (JSON invalide). Renvoie EXACTEMENT le même contenu, sous forme d'un unique bloc ```json ... ``` valide, sans aucun texte avant ou après. N'utilise jamais de guillemets droits (\") à l'intérieur des valeurs de chaîne pour citer un mot ou une expression — utilise des guillemets français « » à la place ; réserve le caractère \" exclusivement à la syntaxe JSON.";

// Appelle le modèle et extrait un JSON structuré depuis la réponse finale.
// En cas de JSON mal formé (fréquent quand l'article/l'audit cite des
// guillemets droits à l'intérieur d'une chaîne), tente une unique
// correction avant d'abandonner.
export async function creerMessageJson({
  system,
  messages,
  tools,
  model = env.anthropicModel,
  maxTokens = 4096,
  effort = 'medium',
  label = 'appel',
}) {
  const response = await creerMessageAvecOutils({ system, messages, tools, model, maxTokens, effort, label });

  try {
    return extraireJson(extraireTexte(response));
  } catch (erreur) {
    console.warn(`[${label}] JSON invalide (${erreur.message.slice(0, 200)}) — tentative de correction...`);

    const historiqueCorrection = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: CONSIGNE_CORRECTION_JSON },
    ];

    const reponseCorrigee = await creerMessageAvecOutils({
      system,
      messages: historiqueCorrection,
      tools: [],
      model,
      maxTokens,
      effort: 'low',
      label: `${label}:correction`,
    });

    return extraireJson(extraireTexte(reponseCorrigee));
  }
}
