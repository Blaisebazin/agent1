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

export const env = {
  databaseUrl: required('DATABASE_URL'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};
