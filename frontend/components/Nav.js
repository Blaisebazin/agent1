'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ domaines }) {
  const pathname = usePathname();

  function estActif(href) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  return (
    <nav className="site-nav">
      <Link href="/" className={estActif('/') ? 'is-current' : undefined}>
        Flux global
      </Link>
      {domaines.map((d) => {
        const href = `/domaine/${d.slug}`;
        return (
          <Link key={d.slug} href={href} className={estActif(href) ? 'is-current' : undefined}>
            {d.nom}
          </Link>
        );
      })}
      <Link href="/apropos" className={estActif('/apropos') ? 'is-current' : undefined}>
        À propos
      </Link>
    </nav>
  );
}
