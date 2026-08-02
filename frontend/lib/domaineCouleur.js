const COULEURS = {
  numerique: '#4f6f95',
  ecosysteme: '#b1631c',
  economie: '#9c7a2c',
  geopolitique: '#77506d',
  'intelligence-artificielle': '#5b5a96',
};

const COULEUR_DEFAUT = '#6b6b66';

export function couleurDomaine(slug) {
  return COULEURS[slug] || COULEUR_DEFAUT;
}
