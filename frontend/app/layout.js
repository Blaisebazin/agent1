import Script from 'next/script';
import Link from 'next/link';
import './globals.css';
import { getDomaines } from '../lib/domaines.js';
import Nav from '../components/Nav.js';

export const revalidate = 300;

export const metadata = {
  title: 'Veille & Analyse',
  description:
    "Analyses argumentées générées à partir d'une veille automatisée, croisant plusieurs sources par sujet.",
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
            Veille &amp; Analyse
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
