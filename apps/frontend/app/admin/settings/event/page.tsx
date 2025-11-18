"use client";
import RequireAuth from '../../../../components/RequireAuth';
import { useEffect, useRef, useState } from 'react';
import { apiBase, toApiUrl } from '../../../../lib/api';

interface EventConfig {
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
}

export default function EventSettingsPage() {
  const [cfg, setCfg] = useState<EventConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [purging, setPurging] = useState(false);
  const [broadcastPreview, setBroadcastPreview] = useState(false);
  const previewTimer = useRef<any>(null);

  const tokenHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  useEffect(() => {
    fetch(`${apiBase()}/events/active`, { headers: tokenHeader() })
      .then(async (r) => setCfg(await r.json()))
      .catch((e) => setError(e.message));
  }, []);

  // Clear live preview override on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('theme:preview', { detail: null }));
      }
      // also clear broadcast preview on server
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        fetch(`${apiBase()}/events/preview/clear`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{});
      }
    };
  }, []);

  const schedulePreview = (payload: Partial<EventConfig>) => {
    // local UI preview
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('theme:preview', { detail: payload }));
    }
    // broadcast via SSE to all clients when enabled
    if (!broadcastPreview) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      fetch(`${apiBase()}/events/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload as any),
      }).catch(()=>{});
    }, 150);
  };

  const save = async () => {
    if (!cfg) return;
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`${apiBase()}/events/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(tokenHeader()||{}) },
        body: JSON.stringify({
          name: cfg.name,
          date: cfg.date || undefined,
          location: cfg.location || undefined,
          backgroundType: cfg.backgroundType,
          backgroundImageUrl: cfg.backgroundImageUrl || undefined,
          backgroundVideoUrl: cfg.backgroundVideoUrl || undefined,
          overlayOpacity: cfg.overlayOpacity,
          checkinPopupTimeoutMs: cfg.checkinPopupTimeoutMs ?? 5000,
        })
      });
      if (!res.ok) setError(await res.text());
      else {
        setMessage('Tersimpan.');
        // Clear preview override after successful save
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('theme:preview', { detail: null }));
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          fetch(`${apiBase()}/events/preview/clear`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{});
        }
      }
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (kind: 'logo' | 'background', file: File) => {
    const fd = new FormData();
    fd.append(kind, file);
    try {
      if (kind === 'logo') setUploadingLogo(true); else setUploadingBg(true);
      const res = await fetch(`${apiBase()}/events/upload/${kind}`, {
        method: 'POST',
        headers: tokenHeader(),
        body: fd,
      });
      if (!res.ok) return setError(await res.text());
      const updated = await res.json();
      setCfg(updated);
      setMessage(`${kind === 'logo' ? 'Logo' : 'Background'} terunggah.`);
    } catch (e: any) {
      setError(e.message || 'Gagal upload');
    } finally {
      if (kind === 'logo') setUploadingLogo(false); else setUploadingBg(false);
    }
  };

  const purge = async (resetBranding: boolean) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(resetBranding ? 'Hapus semua tamu dan reset branding?' : 'Hapus semua tamu pada event aktif?');
      if (!ok) return;
    }
    setError(null);
    setMessage(null);
    setPurging(true);
    try {
      const res = await fetch(`${apiBase()}/events/purge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(tokenHeader()||{}) },
        body: JSON.stringify({ resetBranding })
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage(resetBranding ? 'Tamu terhapus dan branding direset.' : 'Tamu terhapus.');
      const r = await fetch(`${apiBase()}/events/active`, { headers: tokenHeader() });
      if (r.ok) setCfg(await r.json());
    } catch (e: any) {
      setError(e.message || 'Gagal purge');
    } finally {
      setPurging(false);
    }
  };

  

  if (!cfg) return <RequireAuth><div className="p-6 text-sm text-brand-textMuted">Loading...</div></RequireAuth>;

  return (
    <RequireAuth>
      <div className="min-h-screen p-6 md:p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-shadow-lg">Event Settings</h1>
          {error && <div className="text-sm text-brand-danger">{error}</div>}
          {message && <div className="text-sm text-brand-accent">{message}</div>}

          <div className="space-y-6 rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft">
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm text-brand-textMuted">Event Name</label>
                <input
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                  value={cfg.name}
                  onChange={(e)=>setCfg({...cfg, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-brand-textMuted">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                    value={cfg.date?.slice(0,10) || ''}
                    onChange={(e)=>setCfg({...cfg, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-brand-textMuted">Location</label>
                  <input
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                    value={cfg.location || ''}
                    onChange={(e)=>setCfg({...cfg, location: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg bg-brand-surfaceMuted/60 p-4">
              <div>
                <label className="mb-1 block text-sm text-brand-textMuted">Overlay Opacity ({cfg.overlayOpacity})</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={cfg.overlayOpacity}
                  onChange={(e)=>{ const v = Number(e.target.value); setCfg({...cfg, overlayOpacity: v}); schedulePreview({ overlayOpacity: v }); }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-brand-textMuted">Check-in Popup Timeout (detik)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={Math.round(((cfg.checkinPopupTimeoutMs ?? 5000) / 1000))}
                    onChange={(e)=>{
                      const seconds = Number(e.target.value) || 5;
                      setCfg({ ...cfg, checkinPopupTimeoutMs: seconds * 1000 });
                    }}
                  />
                  <div className="w-10 text-sm text-brand-textMuted">{Math.round(((cfg.checkinPopupTimeoutMs ?? 5000) / 1000))}s</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-medium text-brand-text">Logo</div>
                {cfg.logoUrl && <img src={toApiUrl(cfg.logoUrl)} className="mb-2 h-16" alt="logo" />}
                <input
                  disabled={uploadingLogo}
                  type="file"
                  accept="image/*"
                  onChange={(e)=>{ const f=e.target.files?.[0]; if(f) upload('logo', f); }}
                />
                {uploadingLogo && <div className="text-sm text-brand-textMuted">Mengunggah logo...</div>}
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-brand-text">Background</div>
                <div className="mb-2 flex flex-wrap gap-3 text-sm">
                  {(['NONE','IMAGE','VIDEO'] as const).map((t)=> (
                    <label key={t} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bgtype"
                        checked={cfg.backgroundType===t}
                        onChange={()=>{ setCfg({...cfg, backgroundType: t}); schedulePreview({ backgroundType: t }); }}
                      />
                      <span className="text-brand-textMuted">{t}</span>
                    </label>
                  ))}
                </div>
                {cfg.backgroundType==='IMAGE' && cfg.backgroundImageUrl && (
                  <img src={toApiUrl(cfg.backgroundImageUrl)} className="mb-2 h-24 w-full rounded object-cover" />
                )}
                {cfg.backgroundType==='VIDEO' && cfg.backgroundVideoUrl && (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={toApiUrl(cfg.backgroundVideoUrl)} className="mb-2 h-32 w-full rounded object-cover" controls loop muted />
                )}
                <input
                  disabled={uploadingBg}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e)=>{ const f=e.target.files?.[0]; if(f) upload('background', f); }}
                />
                {uploadingBg && <div className="text-sm text-brand-textMuted">Mengunggah background...</div>}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Save'}
                </button>
                <button
                  onClick={()=>purge(false)}
                  disabled={purging}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-surfaceMuted disabled:opacity-50"
                >
                  {purging ? 'Memproses...' : 'Purge Guests'}
                </button>
                <button
                  onClick={()=>purge(true)}
                  disabled={purging}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {purging ? 'Memproses...' : 'Purge + Reset Branding'}
                </button>
                
                <label className="ml-auto flex items-center gap-2 text-xs md:text-sm text-brand-textMuted">
                  <input
                    type="checkbox"
                    checked={broadcastPreview}
                    onChange={(e)=>{
                      const on = e.target.checked; setBroadcastPreview(on);
                      if (on && cfg) {
                        schedulePreview({
                          overlayOpacity: cfg.overlayOpacity,
                          backgroundType: cfg.backgroundType,
                          backgroundImageUrl: cfg.backgroundImageUrl,
                          backgroundVideoUrl: cfg.backgroundVideoUrl,
                        });
                      } else {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                        if (token) fetch(`${apiBase()}/events/preview/clear`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{});
                        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('theme:preview', { detail: null }));
                      }
                    }}
                  />
                  Live Preview (broadcast)
                </label>
                <button
                  type="button"
                  onClick={()=>{ const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; if (token) fetch(`${apiBase()}/events/preview/clear`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{}); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('theme:preview', { detail: null })); }}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-xs md:text-sm font-medium text-brand-text hover:bg-brand-surfaceMuted"
                >
                  Stop Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
