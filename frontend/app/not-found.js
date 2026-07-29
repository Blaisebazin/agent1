import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-flux">
      <h1>Page introuvable</h1>
      <p>Le contenu demandé n&apos;existe pas ou n&apos;est plus disponible.</p>
      <p>
        <Link href="/">Retour au flux global</Link>
      </p>
    </div>
  );
}
