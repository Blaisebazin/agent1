import { demarrerOrchestrateur } from './orchestrateur/scheduler.js';

demarrerOrchestrateur()
  .then(() => {
    console.log('Orchestrateur démarré — en attente des prochains cycles planifiés.');
  })
  .catch((err) => {
    console.error("Échec du démarrage de l'orchestrateur :", err);
    process.exit(1);
  });
