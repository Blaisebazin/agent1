import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../.env') });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name} (voir backend/.env.example)`);
  }
  return value;
}

// Sonnet 5 par défaut (plutôt qu'Opus) : ~40% moins cher, qualité jugée
// suffisante sur nos tests de rédaction/vérification (cf. cahier des
// charges 10.4 — calibrage à revoir après usage réel).
const MODELE_PAR_DEFAUT = 'claude-sonnet-5';

// Un modèle par défaut global (ANTHROPIC_MODEL), avec la possibilité de le
// surcharger par tâche — pour tester un routage par coût/qualité (ex. un
// modèle moins cher sur le scan réactif, plus capable sur la rédaction).
export const env = {
  databaseUrl: required('DATABASE_URL'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || MODELE_PAR_DEFAUT,
  anthropicModelVeille: process.env.ANTHROPIC_MODEL_VEILLE || process.env.ANTHROPIC_MODEL || MODELE_PAR_DEFAUT,
  anthropicModelRedaction: process.env.ANTHROPIC_MODEL_REDACTION || process.env.ANTHROPIC_MODEL || MODELE_PAR_DEFAUT,
  anthropicModelVerification:
    process.env.ANTHROPIC_MODEL_VERIFICATION || process.env.ANTHROPIC_MODEL || MODELE_PAR_DEFAUT,
  anthropicModelScanReactif: process.env.ANTHROPIC_MODEL_SCAN_REACTIF || 'claude-haiku-4-5',
};
