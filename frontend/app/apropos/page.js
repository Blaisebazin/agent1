export const metadata = {
  title: 'À propos — Contexta',
  description: 'La méthode derrière Contexta : veille, sélection, analyse croisée, vérification.',
};

export default function AproposPage() {
  return (
    <div className="page-apropos">
      <div className="apropos-intro">
        <div className="portrait-block">
          <div className="portrait-frame">
            <img
              src="/images/blaise-apropos.jpg"
              alt="Portrait de Blaise Bazinga"
              width="480"
              height="600"
            />
          </div>
          <p className="portrait-caption">
            <strong>Blaise Bazinga</strong>
            Fondateur et éditeur de Contexta
          </p>
        </div>

        <div className="apropos-texte">
          <span className="eyebrow">À propos</span>
          <h1>Un site que j&apos;édite, une méthode que je peux expliquer</h1>
          <p>
            Contexta croise des sources publiques sur cinq domaines — numérique, écosystème
            entrepreneurial, économie, géopolitique, intelligence artificielle — pour en tirer des
            analyses qui tiennent la route, pas de simples résumés d&apos;actualité.
          </p>
          <p>
            Les articles sont rédigés par un système que j&apos;ai conçu et que je supervise, pas
            écrits à la main un par un. Je préfère le dire clairement ici plutôt que de le laisser
            dans des mentions légales que personne ne lit.
          </p>
        </div>
      </div>

      <div className="methode">
        <p className="methode-titre">La méthode, en quatre étapes</p>
        <div className="methode-grille">
          <div className="methode-etape">
            <span className="num">1</span>
            <h3>Une veille continue</h3>
            <p>Les sources publiques des cinq domaines sont suivies en continu, jour après jour.</p>
          </div>
          <div className="methode-etape">
            <span className="num">2</span>
            <h3>Un choix assumé</h3>
            <p>
              Tous les sujets ne se valent pas. On retient ceux qui méritent une explication, pas
              ceux qui font le plus de bruit.
            </p>
          </div>
          <div className="methode-etape">
            <span className="num">3</span>
            <h3>Une analyse croisée</h3>
            <p>
              Chaque article s&apos;appuie sur plusieurs sources indépendantes, confrontées entre
              elles avant d&apos;être écrites.
            </p>
          </div>
          <div className="methode-etape">
            <span className="num">4</span>
            <h3>Une vérification avant publication</h3>
            <p>
              Avant mise en ligne, chaque texte est recontrôlé pour sa cohérence et sa fidélité aux
              sources citées.
            </p>
          </div>
        </div>
      </div>

      <div className="disclosure">
        <strong>Une erreur, une imprécision&nbsp;?</strong> Chaque article cite ses sources en bas
        de page. Si l&apos;une d&apos;elles vous semble mal interprétée, c&apos;est signalable et
        corrigible — ce n&apos;est pas gravé dans le marbre.
      </div>
    </div>
  );
}
