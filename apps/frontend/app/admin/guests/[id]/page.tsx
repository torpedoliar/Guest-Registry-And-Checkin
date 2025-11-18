"use client";
import RequireAuth from '../../../../components/RequireAuth';
import { useEffect, useState } from 'react';
import { apiBase, toApiUrl } from '../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import WebcamCapture from '../../../../components/WebcamCapture';

interface Guest {
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
}

export default function EditGuestPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${apiBase()}/guests/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(async (r) => setGuest(await r.json()))
      .catch((e) => setError(e.message));
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('guestId', guest!.guestId);
      fd.append('name', guest!.name);
      fd.append('tableLocation', guest!.tableLocation);
      if (guest!.company) fd.append('company', guest!.company);
      if (guest!.notes) fd.append('notes', guest!.notes);
      if (guest!.queueNumber) fd.append('queueNumber', String(guest!.queueNumber));
      if (typeof guest!.checkedIn === 'boolean') fd.append('checkedIn', String(guest!.checkedIn));
      if (guest!.checkedInAt) fd.append('checkedInAt', guest!.checkedInAt);
      if (photo) fd.append('photo', photo);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBase()}/guests/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Perubahan tersimpan.');
      // Optional: navigate back after short delay
      setTimeout(() => router.replace('/admin/guests'), 800);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!guest) return <RequireAuth><div className="p-6 text-sm text-brand-textMuted">Loading...</div></RequireAuth>;

  return (
    <RequireAuth>
      <div className="min-h-screen p-6 md:p-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text text-shadow">Edit Tamu</h1>
          {error && <div className="text-sm text-brand-danger">{error}</div>}
          {message && <div className="text-sm text-brand-accent">{message}</div>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {guest.photoUrl && (
              <div>
                <div className="mb-1 text-sm text-brand-textMuted">Foto Saat Ini</div>
                <img src={toApiUrl(guest.photoUrl)} alt={guest.name} className="h-32 w-32 rounded object-cover" />
              </div>
            )}
            {preview && (
              <div>
                <div className="mb-1 text-sm text-brand-textMuted">Foto Baru (Preview)</div>
                <img src={preview} alt="preview" className="h-32 w-32 rounded object-cover" />
              </div>
            )}
          </div>
          <form onSubmit={save} className="space-y-4 rounded-xl border border-brand-border bg-brand-surface p-5 shadow-soft">
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Guest ID</label>
              <input
                value={guest.guestId}
                onChange={(e)=>setGuest({ ...guest!, guestId: e.target.value })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Nomor Urut (Queue)</label>
              <input
                type="number"
                min={1}
                value={guest.queueNumber}
                onChange={(e)=>setGuest({ ...guest!, queueNumber: Number(e.target.value) })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Nama</label>
              <input
                value={guest.name}
                onChange={(e)=>setGuest({ ...guest!, name: e.target.value })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Meja/Ruangan</label>
              <input
                value={guest.tableLocation}
                onChange={(e)=>setGuest({ ...guest!, tableLocation: e.target.value })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Perusahaan/Organisasi</label>
              <input
                value={guest.company||''}
                onChange={(e)=>setGuest({ ...guest!, company: e.target.value })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Catatan</label>
              <textarea
                value={guest.notes||''}
                onChange={(e)=>setGuest({ ...guest!, notes: e.target.value })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-brand-text">
                <input
                  type="checkbox"
                  checked={guest.checkedIn}
                  onChange={(e)=>setGuest({ ...guest!, checkedIn: e.target.checked })}
                />
                Sudah Check-in
              </label>
              <div>
                <label className="mb-1 block text-sm text-brand-textMuted">Waktu Check-in (ISO, opsional)</label>
                <input
                  placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                  value={guest.checkedInAt || ''}
                  onChange={(e)=>setGuest({ ...guest!, checkedInAt: e.target.value })}
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-textMuted">Foto (opsional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e)=>{ const f=e.target.files?.[0]||null; setPhoto(f); if (f) { const url=URL.createObjectURL(f); setPreview(url); } else { setPreview(null); } }}
              />
              <button
                type="button"
                onClick={()=>setWebcamOpen(true)}
                className="ml-2 inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text hover:bg-brand-surfaceMuted"
              >
                Ambil via Webcam
              </button>
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
          <WebcamCapture open={webcamOpen} onClose={()=>setWebcamOpen(false)} onCapture={(file)=>{ setPhoto(file); const url=URL.createObjectURL(file); setPreview(url); }} aspect="square" />
        </div>
      </div>
    </RequireAuth>
  );
}
