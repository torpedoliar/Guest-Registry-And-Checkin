"use client";
import RequireAuth from '../../../components/RequireAuth';
import { useEffect, useState } from 'react';
import { apiFetch, apiBase } from '../../../lib/api';
import WebcamCapture from '../../../components/WebcamCapture';

type Stats = { total: number; checkedIn: number; notCheckedIn: number };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Quick add form state
  const [guestId, setGuestId] = useState('');
  const [name, setName] = useState('');
  const [tableLocation, setTableLocation] = useState('');
  const [company, setCompany] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Portal actions state
  const [publicGuestId, setPublicGuestId] = useState('');
  const [adminGuestId, setAdminGuestId] = useState('');
  const [busyPublic, setBusyPublic] = useState(false);
  const [busyAdminCheck, setBusyAdminCheck] = useState(false);
  const [busyAdminUncheck, setBusyAdminUncheck] = useState(false);

  useEffect(() => {
    apiFetch<Stats>('/guests/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  // Realtime refresh stats when check-in/uncheckin occurs
  useEffect(() => {
    const es = new EventSource(`${apiBase()}/public/stream`);
    const onChange = async () => {
      try { const s = await apiFetch<Stats>('/guests/stats'); setStats(s); } catch {}
    };
    es.addEventListener('checkin', onChange as any);
    es.addEventListener('uncheckin', onChange as any);
    return () => { es.close(); };
  }, []);

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return (
    <RequireAuth>
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-shadow-lg">Dashboard</h1>
          {error && <div className="text-brand-danger text-sm">{error}</div>}

          {stats && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card title="Total Tamu" value={stats.total} />
              <Card title="Sudah Check-in" value={stats.checkedIn} />
              <Card title="Belum Check-in" value={stats.notCheckedIn} />
            </div>
          )}

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-brand-textMuted">
            <a
              className="inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-sm font-medium text-brand-text shadow-soft hover:bg-brand-primarySoft"
              href="/admin/guests"
            >
              Kelola Tamu
            </a>
            <span className="text-brand-border">•</span>
            <a
              className="inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-sm font-medium text-brand-text shadow-soft hover:bg-brand-primarySoft"
              href="/admin/guests/new"
            >
              Tambah Tamu (Halaman Penuh)
            </a>
            <span className="text-brand-border">•</span>
            <a
              className="inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-sm font-medium text-brand-text shadow-soft hover:bg-brand-primarySoft"
              href="/checkin"
              target="_blank"
            >
              Halaman Check-in Publik
            </a>
            <span className="text-brand-border">•</span>
            <a
              className="inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-sm font-medium text-brand-text shadow-soft hover:bg-brand-primarySoft"
              href="/show"
              target="_blank"
            >
              Layar Display
            </a>
          </div>

          {/* Portal Actions */}
          <div className="max-w-2xl rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft">
            <div className="mb-3 text-lg font-semibold text-brand-text">Portal Actions</div>
            {error && <div className="mb-2 text-sm text-brand-danger">{error}</div>}
            {message && <div className="mb-2 text-sm text-brand-accent">{message}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Public Check-in (by Guest ID)</div>
              <div className="flex gap-2">
                <input
                  value={publicGuestId}
                  onChange={(e)=>setPublicGuestId(e.target.value)}
                  placeholder="Guest ID"
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
                <button disabled={busyPublic || !publicGuestId} onClick={async ()=>{
                  setError(null); setMessage(null); setBusyPublic(true);
                  try {
                    const res = await fetch(`${apiBase()}/public/guests/checkin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestId: publicGuestId }) });
                    if (!res.ok) throw new Error(await res.text());
                    setMessage('Check-in publik berhasil.');
                    setPublicGuestId('');
                  } catch(e:any) { setError(e.message||'Gagal check-in publik'); } finally { setBusyPublic(false); }
                }} className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50">{busyPublic ? 'Memproses...' : 'Check-in'}</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Admin Check-in (by Guest ID)</div>
              <div className="flex gap-2">
                <input
                  value={adminGuestId}
                  onChange={(e)=>setAdminGuestId(e.target.value)}
                  placeholder="Guest ID"
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
                <button disabled={busyAdminCheck || !adminGuestId} onClick={async ()=>{
                  setError(null); setMessage(null); setBusyAdminCheck(true);
                  try {
                    // Find by guestId using public search (exact first)
                    const r = await fetch(`${apiBase()}/public/guests/search?guestId=${encodeURIComponent(adminGuestId)}`);
                    if (!r.ok) throw new Error(await r.text());
                    const arr = await r.json();
                    const g = arr && arr[0];
                    if (!g) throw new Error('Guest tidak ditemukan');
                    await apiFetch(`/guests/${g.id}/checkin`, { method: 'POST' });
                    setMessage(`Check-in admin berhasil untuk ${g.name}`);
                  } catch(e:any) { setError(e.message||'Gagal check-in admin'); } finally { setBusyAdminCheck(false); }
                }} className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50">{busyAdminCheck ? 'Memproses...' : 'Check-in'}</button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="text-sm font-medium">Admin Uncheck-in (by Guest ID)</div>
              <div className="flex gap-2">
                <input value={adminGuestId} onChange={(e)=>setAdminGuestId(e.target.value)} placeholder="Guest ID" className="border rounded p-2 w-full" />
                <button disabled={busyAdminUncheck || !adminGuestId} onClick={async ()=>{
                  setError(null); setMessage(null); setBusyAdminUncheck(true);
                  try {
                    const r = await fetch(`${apiBase()}/public/guests/search?guestId=${encodeURIComponent(adminGuestId)}`);
                    if (!r.ok) throw new Error(await r.text());
                    const arr = await r.json(); const g = arr && arr[0];
                    if (!g) throw new Error('Guest tidak ditemukan');
                    await apiFetch(`/guests/${g.id}/uncheckin`, { method: 'POST' });
                    setMessage(`Uncheck-in admin berhasil untuk ${g.name}`);
                  } catch(e:any) { setError(e.message||'Gagal uncheck-in admin'); } finally { setBusyAdminUncheck(false); }
                }} className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50">{busyAdminUncheck ? 'Memproses...' : 'Uncheck-in'}</button>
              </div>
            </div>
          </div>
          </div>

          {/* Quick Add Guest */}
          <div className="max-w-2xl rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft">
            <div className="mb-3 text-lg font-semibold text-brand-text">Quick Add Guest</div>
            {message && <div className="mb-2 text-sm text-brand-accent">{message}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setMessage(null);
              setSaving(true);
              try {
                const fd = new FormData();
                fd.append('guestId', guestId);
                fd.append('name', name);
                fd.append('tableLocation', tableLocation);
                if (company) fd.append('company', company);
                if (photo) fd.append('photo', photo);
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const res = await fetch(`${apiBase()}/guests`, {
                  method: 'POST',
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                  body: fd,
                });
                if (!res.ok) throw new Error(await res.text());
                // Clear fields
                setGuestId('');
                setName('');
                setTableLocation('');
                setCompany('');
                setPhoto(null);
                setMessage('Tamu berhasil ditambahkan.');
                // refresh stats
                apiFetch<Stats>('/guests/stats').then(setStats).catch(() => {});
              } catch (e: any) {
                setError(e.message || 'Gagal menambahkan tamu');
              } finally {
                setSaving(false);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Guest ID</label>
              <input
                value={guestId}
                onChange={(e)=>setGuestId(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Nama</label>
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Meja/Ruangan</label>
              <input
                value={tableLocation}
                onChange={(e)=>setTableLocation(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Perusahaan/Organisasi (opsional)</label>
              <input
                value={company}
                onChange={(e)=>setCompany(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-brand-textMuted">Foto (opsional)</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e)=>setPhoto(e.target.files?.[0]||null)} />
              <button
                type="button"
                onClick={()=>setWebcamOpen(true)}
                className="ml-2 inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text hover:bg-brand-surfaceMuted"
              >
                Ambil via Webcam
              </button>
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="preview" className="h-20 w-20 object-cover rounded" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Tambah Tamu'}
              </button>
            </div>
          </form>
          <WebcamCapture open={webcamOpen} onClose={()=>setWebcamOpen(false)} onCapture={(file)=>{ setPhoto(file); }} aspect="square" />
        </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-4 shadow-soft">
      <div className="text-sm text-brand-textMuted">{title}</div>
      <div className="text-3xl font-semibold text-brand-text">{value}</div>
    </div>
  );
}
