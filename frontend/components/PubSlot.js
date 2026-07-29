'use client';

import { useEffect } from 'react';

const CLIENT_ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export default function PubSlot({ slotId, format = 'auto' }) {
  useEffect(() => {
    if (!CLIENT_ADSENSE || !slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense peut échouer silencieusement (script non chargé, bloqueur de pub, etc.)
    }
  }, [slotId]);

  if (!CLIENT_ADSENSE || !slotId) {
    return (
      <div className="pub-slot pub-slot-placeholder" aria-hidden="true">
        Emplacement publicitaire
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle pub-slot"
      style={{ display: 'block' }}
      data-ad-client={CLIENT_ADSENSE}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
