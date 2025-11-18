"use client";
import { useEffect, useMemo, useState } from 'react';
import { apiBase, toApiUrl } from '../lib/api';
import { usePathname } from 'next/navigation';

type EventConfig = {
  backgroundType: 'NONE' | 'IMAGE' | 'VIDEO';
  backgroundImageUrl?: string | null;
  backgroundVideoUrl?: string | null;
  overlayOpacity: number;
  logoUrl?: string | null;
};

export default function ThemeBackground() {
  const [cfg, setCfg] = useState<EventConfig | null>(null);
  const [override, setOverride] = useState<Partial<EventConfig> | null>(null);
  const pathname = usePathname();

  // Exclude pages that manage their own background
  const excluded = pathname?.startsWith('/show') || pathname?.startsWith('/checkin');

  useEffect(() => {
    if (excluded) return;
    let es: EventSource | null = null;
    (async () => {
      try {
        const r = await fetch(`${apiBase()}/config/event`);
        if (r.ok) setCfg(await r.json());
      } catch {}
      es = new EventSource(`${apiBase()}/public/stream`);
      const onConfig = (e: MessageEvent) => {
        try { const data = JSON.parse((e as any).data); setCfg(data); } catch {}
      };
      const onPreview = (e: MessageEvent) => {
        try { const data = JSON.parse((e as any).data); setOverride(data || null); } catch {}
      };
      es.addEventListener('config', onConfig as any);
      es.addEventListener('preview', onPreview as any);
    })();
    return () => { if (es) es.close(); };
  }, [excluded]);

  // Live preview override (e.g., from settings page)
  useEffect(() => {
    if (excluded) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<Partial<EventConfig> | null>;
      setOverride(ev.detail || null);
    };
    window.addEventListener('theme:preview', handler as any);
    return () => window.removeEventListener('theme:preview', handler as any);
  }, [excluded]);

  const overlayOpacity = override?.overlayOpacity ?? cfg?.overlayOpacity ?? 0;
  const effectiveType = (override?.backgroundType as EventConfig['backgroundType'] | undefined) ?? cfg?.backgroundType;
  const effectiveImage = override?.backgroundImageUrl ?? cfg?.backgroundImageUrl;
  const effectiveVideo = override?.backgroundVideoUrl ?? cfg?.backgroundVideoUrl;
  const overlayStyle = useMemo(() => ({
    backgroundColor: `rgba(0,0,0,${overlayOpacity})`
  }), [overlayOpacity]);

  if (excluded) return null;

  return (
    <div aria-hidden className="pointer-events-none">
      {effectiveType === 'IMAGE' && effectiveImage && (
        <div className="fixed inset-0 -z-10 bg-center bg-cover" style={{ backgroundImage: `url(${toApiUrl(effectiveImage)})` }} />
      )}
      {effectiveType === 'VIDEO' && effectiveVideo && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video className="fixed inset-0 -z-10 w-full h-full object-cover" src={toApiUrl(effectiveVideo)} muted loop autoPlay playsInline />
      )}
      {(effectiveType === 'IMAGE' || effectiveType === 'VIDEO') && (
        <div className="fixed inset-0 -z-10" style={overlayStyle} />
      )}
    </div>
  );
}
