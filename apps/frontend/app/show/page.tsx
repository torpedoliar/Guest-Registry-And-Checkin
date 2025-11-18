"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiBase, toApiUrl } from '../../lib/api';

type EventConfig = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  backgroundType: 'NONE' | 'IMAGE' | 'VIDEO';
  backgroundImageUrl?: string | null;
  backgroundVideoUrl?: string | null;
  overlayOpacity: number;
  checkinPopupTimeoutMs?: number;
};

type Guest = {
  id: string;
  queueNumber: number;
  guestId: string;
  name: string;
  photoUrl?: string | null;
  tableLocation: string;
  company?: string | null;
};

export default function ShowPage() {
  const [cfg, setCfg] = useState<EventConfig | null>(null);
  const [preview, setPreview] = useState<Partial<EventConfig> | null>(null);
  const [guestId, setGuestId] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState<Guest[]>([]);
  const [selected, setSelected] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiBase()}/config/event`).then(async (r) => setCfg(await r.json()));
  }, []);

  // Keep latest timeout in a ref for use inside SSE handler
  const timeoutMsRef = useRef<number>(5000);
  useEffect(() => { timeoutMsRef.current = cfg?.checkinPopupTimeoutMs ?? 5000; }, [cfg?.checkinPopupTimeoutMs]);

  useEffect(() => {
    const es = new EventSource(`${apiBase()}/public/stream`);
    const onConfig = (e: MessageEvent) => {
      try { const data = JSON.parse((e as any).data); setCfg(data); } catch {}
    };
    const onPreview = (e: MessageEvent) => {
      try { const data = JSON.parse((e as any).data); setPreview(data || null); } catch {}
    };
    const onCheckin = (e: MessageEvent) => {
      try {
        const g = JSON.parse((e as any).data);
        setSelected(g);
        // Auto close after configured timeout
        const ms = timeoutMsRef.current;
        window.setTimeout(() => setSelected(null), ms);
      } catch {}
    };
    es.addEventListener('config', onConfig as any);
    es.addEventListener('preview', onPreview as any);
    es.addEventListener('checkin', onCheckin as any);
    return () => { es.close(); };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const ms = cfg?.checkinPopupTimeoutMs ?? 5000;
    const t = setTimeout(() => setSelected(null), ms);
    return () => clearTimeout(t);
  }, [selected, cfg?.checkinPopupTimeoutMs]);

  const effectiveOverlay = preview?.overlayOpacity ?? cfg?.overlayOpacity ?? 0.5;
  const effectiveType = (preview?.backgroundType as EventConfig['backgroundType'] | undefined) ?? cfg?.backgroundType;
  const effectiveImage = preview?.backgroundImageUrl ?? cfg?.backgroundImageUrl;
  const effectiveVideo = preview?.backgroundVideoUrl ?? cfg?.backgroundVideoUrl;
  const overlayStyle = useMemo(() => ({
    backgroundColor: `rgba(0,0,0,${effectiveOverlay})`,
  }), [effectiveOverlay]);

  const doSearch = async () => {
    setError(null);
    setSelected(null);
    const params = new URLSearchParams();
    if (guestId) params.set('guestId', guestId);
    if (name) params.set('name', name);
    if (!guestId && !name) return;
    const res = await fetch(`${apiBase()}/public/guests/search?${params.toString()}`);
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    const data = await res.json();
    setResults(data);
    setSelected(data[0] ?? null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      {effectiveType === 'IMAGE' && effectiveImage && (
        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${toApiUrl(effectiveImage)})` }} />
      )}
      {effectiveType === 'VIDEO' && effectiveVideo && (
        <video className="absolute inset-0 w-full h-full object-cover" src={toApiUrl(effectiveVideo)} muted loop autoPlay playsInline />
      )}
      <div className="absolute inset-0" style={overlayStyle} />

      {/* Header brand */}
      <div className="relative z-10 p-6 flex items-center gap-4">
        {cfg?.logoUrl && <img src={toApiUrl(cfg.logoUrl)} className="h-12 w-auto" alt="logo" />}
        <div className="text-white">
          <div className="text-2xl md:text-4xl font-bold text-shadow-lg">{cfg?.name || 'Event'}</div>
          {(cfg?.date || cfg?.location) && (
            <div className="text-sm md:text-base opacity-80 text-shadow">{[cfg?.date?.slice(0,10), cfg?.location].filter(Boolean).join(' • ')}</div>
          )}
        </div>
      </div>

      {/* Search box */}
      <div className="relative z-10 p-6 flex flex-col items-center gap-4">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={guestId}
            onChange={(e)=>setGuestId(e.target.value)}
            placeholder="Cari by Guest ID"
            className="px-4 py-3 rounded-lg border border-brand-border bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="Cari by Nama"
            className="px-4 py-3 rounded-lg border border-brand-border bg-white/90 text-black md:col-span-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <button onClick={doSearch} className="rounded-lg bg-brand-primary text-white px-6 py-3 text-lg font-semibold shadow-soft hover:bg-blue-600">Cari</button>
        {error && <div className="text-red-300">{error}</div>}
      </div>

      {/* Display card */}
      <div className="relative z-10 p-6 flex justify-center">
        {!selected && (
          <div className="text-white/90 text-2xl md:text-4xl font-medium">Silakan cari tamu berdasarkan Guest ID atau Nama</div>
        )}
        {selected && (
          <div className="w-full max-w-5xl bg-white/95 rounded-xl border border-brand-border shadow-card grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden">
            <div className="bg-brand-surfaceMuted flex items-center justify-center">
              {selected.photoUrl ? (
                <img src={toApiUrl(selected.photoUrl)} alt={selected.name} className="w-full h-full object-cover" />
              ): (
                <div className="text-gray-400 p-8">No Photo</div>
              )}
            </div>
            <div className="p-6 md:p-10 space-y-3">
              <div className="text-sm text-brand-textMuted">Queue</div>
              <div className="text-5xl md:text-7xl font-extrabold">{selected.queueNumber}</div>
              <div className="text-sm text-brand-textMuted">Guest ID</div>
              <div className="text-2xl md:text-3xl font-semibold">{selected.guestId}</div>
              <div className="text-sm text-brand-textMuted">Nama</div>
              <div className="text-3xl md:text-5xl font-bold">{selected.name}</div>
              <div className="text-sm text-brand-textMuted">Meja / Ruangan</div>
              <div className="text-2xl md:text-3xl">{selected.tableLocation}</div>
              {selected.company && (
                <div>
                  <div className="text-sm text-brand-textMuted">Perusahaan</div>
                  <div className="text-xl md:text-2xl">{selected.company}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
