"use client";
import RequireAuth from '../../../../components/RequireAuth';
import { useState } from 'react';
import { apiBase, apiFetch } from '../../../../lib/api';
import { useRouter } from 'next/navigation';
import WebcamCapture from '../../../../components/WebcamCapture';

export default function NewGuestPage() {
  const [guestId, setGuestId] = useState('');
  const [name, setName] = useState('');
  const [tableLocation, setTableLocation] = useState('');
  const [company, setCompany] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('guestId', guestId);
      fd.append('name', name);
      fd.append('tableLocation', tableLocation);
      if (company) fd.append('company', company);
      if (photo) fd.append('photo', photo);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBase()}/guests`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      setMessage('Tamu berhasil dibuat.');
      setTimeout(()=> router.replace('/admin/guests'), 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen p-6 md:p-8">
        <div className="mx-auto max-w-xl space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-shadow-lg">Tambah Tamu</h1>
          {error && <div className="text-sm text-brand-danger">{error}</div>}
          {message && <div className="text-sm text-brand-accent">{message}</div>}
          <form onSubmit={submit} className="space-y-4 rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft">
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Guest ID</label>
              <input
                value={guestId}
                onChange={(e)=>setGuestId(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Nama</label>
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Meja/Ruangan</label>
              <input
                value={tableLocation}
                onChange={(e)=>setTableLocation(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Perusahaan/Organisasi</label>
              <input
                value={company}
                onChange={(e)=>setCompany(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Foto (opsional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e)=>{
                  const f = e.target.files?.[0]||null; setPhoto(f);
                  if (f) { const url = URL.createObjectURL(f); setPreview(url); } else { setPreview(null); }
                }}
              />
              <button
                type="button"
                onClick={()=>setWebcamOpen(true)}
                className="ml-2 inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text hover:bg-brand-surfaceMuted"
              >
                Ambil via Webcam
              </button>
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="preview" className="h-20 w-20 rounded object-cover" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={()=>router.back()}
                className="inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-surfaceMuted"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
        <WebcamCapture open={webcamOpen} onClose={()=>setWebcamOpen(false)} onCapture={(file)=>{ setPhoto(file); const url = URL.createObjectURL(file); setPreview(url); }} aspect="square" />
      </div>
    </RequireAuth>
  );
}
