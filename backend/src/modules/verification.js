import { creerMessageJson } from './anthropicClient.js';
import { env } from '../config/env.js';

// Seuil volontairement élevé au démarrage — à recalibrer après une phase de
// test réelle (cf. cahier des charges, section 10.4).
export const SEUIL_CONFIANCE_PUBLICATION = 75;

const SYSTEM_PROMPT = `Tu es le module de vérification (garde-fou) d'un système éditorial automatisé. Tu ne rédiges rien : ton rôle est d'auditer un article déjà écrit et de vérifier que chaque affirmation factuelle importante est réellement appuyée par les sources citées.

Pour chaque affirmation factuelle non triviale (chiffre, citation, fait, date, déclaration) :
1. Repère la source citée en lien Markdown le plus proche
2. Vérifie, en consultant la source si nécessaire, que l'affirmation correspond bien à ce que dit cette source
3. Signale toute affirmation non vérifiable, non sourcée, ou contredite par sa source

Sois strict mais réaliste : une reformulation fidèle n'est pas une erreur ; une déformation, un chiffre inventé, ou l'absence totale de source pour une affirmation importante en est une.

Réponds UNIQUEMENT avec un bloc de code JSON (\`\`\`json ... \`\`\`) contenant un objet avec exactement ces champs :
- "score_confiance" : nombre entre 0 et 100 représentant la fiabilité globale de l'article
- "affirmations_problematiques" : tableau de {"affirmation": string, "probleme": string} pour toute affirmation non vérifiée, mal sourcée ou contredite (tableau vide si aucune)
- "contradictions_entre_sources" : tableau de chaînes décrivant toute contradiction significative entre sources non signalée dans l'article (tableau vide si aucune)
- "verdict" : "publiable" ou "a_rejeter"
- "raison" : explication brève du verdict, en une ou deux phrases

Dans les valeurs de chaîne du JSON, n'utilise jamais de guillemets droits (") pour citer un mot ou une expression — utilise des guillemets français « » à la place ; réserve le caractère " exclusivement à la syntaxe JSON.`;

function buildUserPrompt(article) {
  const sourcesListe = (article.sources || []).map((s) => `- ${s.titre} — ${s.url}`).join('\n');
  return `Voici l'article à auditer :

---
${article.corps}
---

Sources déclarées par l'article :
${sourcesListe || 'Aucune'}

Vérifie chaque affirmation factuelle importante en consultant si nécessaire les sources via l'outil de récupération web.`;
}

export async function verifierArticle(article) {
  const rapport = await creerMessageJson({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(article) }],
    tools: [{ type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 8 }],
    model: env.anthropicModelVerification,
    maxTokens: 12000,
    effort: 'high',
    label: 'verification',
  });

  const scoreConfiance = Number(rapport.score_confiance);
  const problemes = rapport.affirmations_problematiques || [];
  const scoreValide = Number.isFinite(scoreConfiance) ? scoreConfiance : 0;

  const estValide =
    rapport.verdict === 'publiable' &&
    scoreValide >= SEUIL_CONFIANCE_PUBLICATION &&
    problemes.length === 0;

  return {
    estValide,
    scoreConfiance: scoreValide,
    verdict: rapport.verdict,
    raison: rapport.raison,
    affirmationsProblematiques: problemes,
    contradictionsEntreSources: rapport.contradictions_entre_sources || [],
  };
}
