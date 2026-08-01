import Script from 'next/script';
import Link from 'next/link';
import './globals.css';
import { getDomaines } from '../lib/domaines.js';
import Nav from '../components/Nav.js';

// Rendu à la demande plutôt qu'ISR : évite que `next build` (ex. dans un
// conteneur Docker) ait besoin d'un accès à la base de données.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contexta',
  description: 'Comprendre avant de décider.',
};

export default async function RootLayout({ children }) {
  const domaines = await getDomaines();
  const clientAdsense = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="fr">
      <body>
        {clientAdsense && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientAdsense}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <header className="site-header">
          <Link href="/" className="site-title">
            Contexta
          </Link>
          <Nav domaines={domaines} />
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Contenu généré et vérifié de façon autonome à partir de sources publiques citées dans
            chaque article.
          </p>
        </footer>
      </body>
    </html>
  );
}
