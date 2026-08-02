const VARIABLES = {
  numerique: 'var(--domaine-numerique)',
  ecosysteme: 'var(--domaine-ecosysteme)',
  economie: 'var(--domaine-economie)',
  geopolitique: 'var(--domaine-geopolitique)',
  'intelligence-artificielle': 'var(--domaine-intelligence-artificielle)',
};

const COULEUR_DEFAUT = 'var(--couleur-muted)';

export function couleurDomaine(slug) {
  return VARIABLES[slug] || COULEUR_DEFAUT;
}
