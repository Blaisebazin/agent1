import Link from 'next/link';

export default function Nav({ domaines }) {
  return (
    <nav className="site-nav">
      <Link href="/">Flux global</Link>
      {domaines.map((d) => (
        <Link key={d.slug} href={`/domaine/${d.slug}`}>
          {d.nom}
        </Link>
      ))}
    </nav>
  );
}
