import { creerMessageJson } from '../modules/anthropicClient.js';
import { env } from '../config/env.js';

// Seuil volontairement élevé au démarrage — à recalibrer après une phase de
// test réelle (cf. cahier des charges, section 5 et 10.4).
export const SEUIL_DECLENCHEMENT_REACTIF = 80;

const CRITERES_PAR_DOMAINE = {
  geopolitique: `- Événement soudain à fort impact (conflit, attentat, coup d'État, rupture diplomatique majeure)
- Couverture simultanée par plusieurs agences de presse internationales majeures (Reuters, AFP, AP) en moins de quelques heures
- Implication directe d'une puissance majeure (États-Unis, Chine, UE, Russie) ou d'une organisation internationale (ONU, OTAN)`,
  economie: `- Mouvement de marché significatif (indice boursier, taux de change, matière première) au-delà d'un seuil de variation
- Décision de banque centrale (taux directeur) non anticipée par le marché
- Annonce majeure d'entreprise (faillite, fusion-acquisition, résultats très en écart des attentes)
- Publication de données macroéconomiques (inflation, emploi) en rupture avec les prévisions`,
  'intelligence-artificielle': `- Lancement d'un nouveau modèle par un acteur majeur (OpenAI, Anthropic, Google, Meta, etc.)
- Décision réglementaire (UE, États-Unis, Chine) impactant le secteur
- Incident ou controverse significative (sécurité, biais, usage détourné)
- Levée de fonds ou rachat de grande ampleur dans le secteur`,
};

const CRITERES_PAR_DEFAUT = `- Nombre de sources indépendantes traitant le sujet dans une fenêtre de temps courte, nettement supérieur au volume de mentions habituel du sujet
- Mots-clés ou angle inhabituels par rapport à la couverture normale du domaine`;

function buildSystemPrompt(domaine) {
  const criteres = CRITERES_PAR_DOMAINE[domaine.slug] || CRITERES_PAR_DEFAUT;

  return `Tu es le module de scan réactif d'un système éditorial automatisé. Ton rôle : détecter, pour un domaine donné, un sujet d'actualité "chaud" — un événement assez significatif pour justifier une publication immédiate, hors du cycle quotidien normal.

Un sujet est "chaud" s'il correspond clairement à au moins un des critères suivants pour ce domaine :
${criteres}

Recherche l'actualité des 30 à 60 dernières minutes sur ce domaine. La grande majorité des scans ne détecteront rien de chaud — c'est normal et attendu, ne force pas une réponse positive faute de mieux.

Réponds UNIQUEMENT avec un bloc de code JSON (\`\`\`json ... \`\`\`) contenant un objet avec exactement ces champs :
- "sujet_chaud_detecte" : booléen
- "score" : nombre entre 0 et 100 (0 = rien de notable, 100 = événement majeur incontestable au regard des critères ci-dessus)
- "justification" : explication brève du score, en citant le(s) critère(s) concerné(s)
- "titre_sujet" : titre court du sujet si détecté, sinon null
- "resume" : résumé en 2-3 phrases si détecté, sinon null
- "sources" : tableau [{"titre": string, "url": string}] si détecté, sinon null

N'utilise jamais de guillemets droits (") à l'intérieur des valeurs de chaîne pour citer un mot ou une expression — utilise des guillemets français « » à la place ; réserve le caractère " exclusivement à la syntaxe JSON.`;
}

function buildUserPrompt(domaine) {
  return `Domaine : ${domaine.nom}
Description : ${domaine.description || 'N/A'}

Effectue le scan maintenant.`;
}

export async function detecterSujetChaud(domaine) {
  const rapport = await creerMessageJson({
    system: buildSystemPrompt(domaine),
    messages: [{ role: 'user', content: buildUserPrompt(domaine) }],
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }],
    model: env.anthropicModelScanReactif,
    maxTokens: 2048,
    effort: 'low',
    label: `scan-reactif:${domaine.slug}`,
  });

  const score = Number(rapport.score);

  return {
    sujetChaudDetecte: Boolean(rapport.sujet_chaud_detecte),
    score: Number.isFinite(score) ? score : 0,
    justification: rapport.justification || '',
    titreSujet: rapport.titre_sujet || null,
    resume: rapport.resume || null,
    sources: rapport.sources || null,
  };
}
