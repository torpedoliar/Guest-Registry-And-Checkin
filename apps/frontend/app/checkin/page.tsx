"use client";
import { useEffect, useMemo, useState } from "react";
import { apiBase, toApiUrl } from "../../lib/api";

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
  notes?: string | null;
  checkedIn: boolean;
  checkedInAt?: string | null;
};

export default function CheckinPage() {
  const [cfg, setCfg] = useState<EventConfig | null>(null);
  const [preview, setPreview] = useState<Partial<EventConfig> | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Guest[]>([]);
  const [selected, setSelected] = useState<Guest | null>(null);
  const [checkedGuest, setCheckedGuest] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Guest[]>([]);
  // Overlay customization (popup only)
  const [bgMode, setBgMode] = useState<'CONFIG'|'NONE'|'IMAGE'|'VIDEO'>('CONFIG');
  const [overlayOverride, setOverlayOverride] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [unchecking, setUnchecking] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    fetch(`${apiBase()}/config/event`).then(async (r) => setCfg(await r.json()));
  }, []);

  const effectiveOverlay = overlayOverride ?? preview?.overlayOpacity ?? cfg?.overlayOpacity ?? 0.5;
  const overlayStyle = useMemo(() => ({
    backgroundColor: `rgba(0,0,0,${effectiveOverlay})`,
  }), [effectiveOverlay]);

  const doSearch = async () => {
    setError(null);
    setSelected(null);
    setCheckedGuest(null);
    const params = new URLSearchParams();
    if (!q.trim()) return;
    // gunakan q untuk keduanya agar mendukung ID atau Nama
    params.set('guestId', q.trim());
    params.set('name', q.trim());
    setSearching(true);
    try {
      const res = await fetch(`${apiBase()}/public/guests/search?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data);
      // auto check-in hasil pertama bila ada
      if (data.length > 0) {
        await doCheckin(data[0]);
      } else {
        setError('Tamu tidak ditemukan');
      }
    } catch (e: any) {
      setError(e.message || 'Gagal mencari tamu');
    } finally {
      setSearching(false);
    }
  };

  const doCheckin = async (g: Guest) => {
    setError(null);
    // Public check-in by guestId
    setChecking(true);
    setCheckingId(g.id);
    try {
      const res = await fetch(`${apiBase()}/public/guests/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: g.guestId })
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setCheckedGuest(updated);
      setSelected(updated);
      // refresh history
      refreshHistory();
      // Auto reset setelah timeout terkonfigurasi
      const ms = cfg?.checkinPopupTimeoutMs ?? 5000;
      setTimeout(() => setCheckedGuest(null), ms);
    } catch (e: any) {
      setError(e.message || 'Gagal check-in');
    } finally {
      setChecking(false);
      setCheckingId(null);
    }
  };

  const doUncheckin = async (g: Guest) => {
    setError(null);
    // For security, uncheckin tetap admin endpoint; tampilkan pesan jika gagal (tanpa login)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setUnchecking(true);
    try {
      const res = await fetch(`${apiBase()}/guests/${g.id}/uncheckin`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error('Gagal membatalkan check-in (butuh login admin)');
      const updated = await res.json();
      setCheckedGuest(null);
      setSelected(updated);
      refreshHistory();
    } catch (e: any) {
      setError(e.message || 'Gagal membatalkan check-in');
    } finally {
      setUnchecking(false);
    }
  };

  const refreshHistory = async () => {
    try {
      const r = await fetch(`${apiBase()}/public/guests/history?limit=10`);
      if (r.ok) setHistory(await r.json());
    } catch {}
  };

  useEffect(() => { refreshHistory(); }, []);

  // Realtime: subscribe to server-sent events for config changes & history updates
  useEffect(() => {
    const es = new EventSource(`${apiBase()}/public/stream`);
    const onConfig = (e: MessageEvent) => {
      try { const data = JSON.parse((e as any).data); setCfg(data); } catch {}
    };
    const onPreview = (e: MessageEvent) => {
      try { const data = JSON.parse((e as any).data); setPreview(data || null); } catch {}
    };
    const onChange = () => { refreshHistory(); };
    es.addEventListener('config', onConfig as any);
    es.addEventListener('preview', onPreview as any);
    es.addEventListener('checkin', onChange as any);
    es.addEventListener('uncheckin', onChange as any);
    return () => { es.close(); };
  }, []);

  // Detect auth (admin logged in) to conditionally show admin-only actions
  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      setIsAuth(!!localStorage.getItem('token'));
    };
    check();
    const onStorage = (e: StorageEvent) => { if (e.key === 'token') check(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Effective background mode for page (not popup): always follow config
  const pageBgType = (preview?.backgroundType as EventConfig['backgroundType'] | undefined) ?? cfg?.backgroundType;
  const pageBgImage = preview?.backgroundImageUrl ?? cfg?.backgroundImageUrl;
  const pageBgVideo = preview?.backgroundVideoUrl ?? cfg?.backgroundVideoUrl;

  return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background */}
        {pageBgType === 'IMAGE' && pageBgImage && (
          <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${toApiUrl(pageBgImage)})` }} />
        )}
        {pageBgType === 'VIDEO' && pageBgVideo && (
          <video className="absolute inset-0 w-full h-full object-cover" src={toApiUrl(pageBgVideo)} muted loop autoPlay playsInline />
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

        {/* Search (single input: ID atau Nama) */}
        <div className="relative z-10 p-6 flex flex-col items-center gap-4">
          <div className="w-full max-w-3xl">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            onKeyDown={(e)=>{ if (e.key === 'Enter' && !searching && !checking) { e.preventDefault(); doSearch(); } }}
            placeholder="Masukkan Guest ID atau Nama, lalu tekan Enter"
            className="w-full rounded-lg border border-brand-border bg-white/90 px-3 py-3 text-black disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            disabled={searching || checking}
            autoFocus
          />
          {error && <div className="text-red-300 mt-2">{error}</div>}
          <div className="mt-3">
            <button disabled={searching || checking} onClick={doSearch} className="rounded-lg bg-brand-primary px-6 py-3 text-lg font-semibold text-white shadow-soft hover:bg-blue-600 disabled:opacity-50">{searching ? 'Mencari...' : (checking ? 'Check-in...' : 'Cari & Check-in')}</button>
          </div>
        </div>
        </div>

        {/* Results */}
        <div className="relative z-10 p-6 flex justify-center">
          <div className="w-full max-w-5xl rounded-xl border border-brand-border bg-white/95 p-4 shadow-card">
            {!results.length && <div className="text-center text-gray-600">Masukkan Guest ID atau Nama lalu tekan Enter</div>}
            {!!results.length && (
              <div className="space-y-2">
                {results.map((g) => (
                  <div key={g.id} className={`flex items-center justify-between rounded border p-3 ${selected?.id===g.id ? 'border-brand-primary' : 'border-brand-border'}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
                        {g.photoUrl ? <img src={toApiUrl(g.photoUrl)} className="h-full w-full object-cover" /> : <div className="text-xs text-gray-400 flex items-center justify-center h-full">No Photo</div>}
                      </div>
                      <div>
                        <div className="font-semibold">{g.name} <span className="text-gray-500">({g.guestId})</span></div>
                        <div className="text-sm text-gray-600">Meja/Ruangan: {g.tableLocation} {g.company ? `• ${g.company}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 font-medium text-brand-text hover:bg-brand-surfaceMuted" onClick={() => setSelected(g)} disabled={checking}>Pilih</button>
                      <button className="rounded-full bg-brand-primary px-3 py-1 font-medium text-white shadow-soft disabled:opacity-50 hover:bg-blue-600" disabled={checking} onClick={() => doCheckin(g)}>{checking && checkingId===g.id ? 'Check-in...' : 'Check-in'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="relative z-10 p-6 flex justify-center">
          <div className="w-full max-w-5xl rounded-xl border border-brand-border bg-white/90 p-4 shadow-soft">
            <div className="font-semibold mb-2">Riwayat Check-in Terbaru</div>
            {!history.length && <div className="text-gray-500 text-sm">Belum ada</div>}
            {!!history.length && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 rounded border border-brand-border p-2">
                    <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden">
                      {h.photoUrl ? <img src={toApiUrl(h.photoUrl)} className="h-full w-full object-cover" /> : <div className="text-[10px] text-gray-400 flex items-center justify-center h-full">No Photo</div>}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{h.name} <span className="text-gray-500">({h.guestId})</span></div>
                      <div className="text-gray-600">Queue {h.queueNumber} • {h.tableLocation}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation full display */}
        {checkedGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-brand-border bg-white/95 shadow-card grid grid-cols-1 md:grid-cols-[320px_1fr]">
              <div className="bg-brand-surfaceMuted flex items-center justify-center">
                {checkedGuest.photoUrl ? (
                  <img src={toApiUrl(checkedGuest.photoUrl)} alt={checkedGuest.name} className="w-full h-full object-cover" />
                ): (
                  <div className="text-gray-400 p-8">No Photo</div>
                )}
              </div>
              <div className="p-6 md:p-10 space-y-3">
                {/* Popup background controls */}
                <div className="flex items-center justify-end gap-2">
                  <div className="text-xs text-brand-textMuted">Background:</div>
                  <select
                    className="border border-brand-border rounded px-2 py-1 text-sm"
                    value={bgMode}
                    onChange={(e)=> setBgMode(e.target.value as any)}
                  >
                    <option value="CONFIG">Config</option>
                    <option value="NONE">None</option>
                    {cfg?.backgroundImageUrl && <option value="IMAGE">Image</option>}
                    {cfg?.backgroundVideoUrl && <option value="VIDEO">Video</option>}
                  </select>
                  <div className="text-xs text-brand-textMuted">Overlay:</div>
                  <input type="range" min={0} max={1} step={0.05} value={effectiveOverlay} onChange={(e)=> setOverlayOverride(Number(e.target.value))} />
                </div>
                <div className="text-green-700 text-xl font-bold">CHECK-IN BERHASIL</div>
                <div className="text-sm text-brand-textMuted">Queue</div>
                <div className="text-5xl md:text-7xl font-extrabold">{checkedGuest.queueNumber}</div>
                <div className="text-sm text-brand-textMuted">Guest ID</div>
                <div className="text-2xl md:text-3xl font-semibold">{checkedGuest.guestId}</div>
                <div className="text-sm text-brand-textMuted">Nama</div>
                <div className="text-3xl md:text-5xl font-bold">{checkedGuest.name}</div>
                <div className="text-sm text-brand-textMuted">Meja / Ruangan</div>
                <div className="text-2xl md:text-3xl">{checkedGuest.tableLocation}</div>
                {checkedGuest.company && (
                  <div>
                    <div className="text-sm text-brand-textMuted">Perusahaan</div>
                    <div className="text-xl md:text-2xl">{checkedGuest.company}</div>
                  </div>
                )}
                {checkedGuest.notes && (
                  <div>
                    <div className="text-sm text-brand-textMuted">Catatan</div>
                    <div className="text-base md:text-lg text-brand-text">{checkedGuest.notes}</div>
                  </div>
                )}
                <div className="pt-4 flex items-center gap-3">
                  <button className="rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-surfaceMuted" onClick={()=> setCheckedGuest(null)}>Tutup</button>
                  {isAuth && (
                    <button disabled={unchecking} className="bg-red-600 text-white rounded px-4 py-2 disabled:opacity-50" onClick={()=> doUncheckin(checkedGuest)}>{unchecking ? 'Membatalkan...' : 'Batal Check-in'}</button>
                  )}
                </div>
              </div>
            </div>

            {/* Popup-specific background override rendering */}
            {(() => {
              const mode = bgMode === 'CONFIG' ? cfg?.backgroundType : bgMode;
              return (
                <>
                  {mode === 'IMAGE' && cfg?.backgroundImageUrl && (
                    <div className="absolute inset-0 -z-10 bg-center bg-cover" style={{ backgroundImage: `url(${toApiUrl(cfg.backgroundImageUrl)})` }} />
                  )}
                  {mode === 'VIDEO' && cfg?.backgroundVideoUrl && (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video className="absolute inset-0 -z-10 w-full h-full object-cover" src={toApiUrl(cfg.backgroundVideoUrl)} muted loop autoPlay playsInline />
                  )}
                  {mode === 'NONE' && (
                    <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: 0.2 }} />
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
  );
}
