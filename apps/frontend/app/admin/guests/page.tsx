"use client";
import RequireAuth from '../../../components/RequireAuth';
import { useEffect, useState } from 'react';
import { apiFetch, toApiUrl, apiBase } from '../../../lib/api';

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

interface GuestsResponse { data: Guest[]; total: number }

export default function GuestsListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [resp, setResp] = useState<GuestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyCheckinId, setBusyCheckinId] = useState<string | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingFull, setExportingFull] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
      const data = await apiFetch<GuestsResponse>(`/guests?${params.toString()}`);
      setResp(data);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const doExport = async () => {
    try {
      setExporting(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBase()}/guests/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const m = /filename="?([^";]+)"?/i.exec(cd);
      const filename = m?.[1] || 'guests.csv';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e:any) {
      setError(e.message || 'Gagal export');
    } finally {
      setExporting(false);
    }
  };

  const doExportFull = async () => {
    try {
      setExportingFull(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBase()}/guests/export/full`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const m = /filename="?([^";]+)"?/i.exec(cd);
      const filename = m?.[1] || 'guests_full.csv';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e:any) {
      setError(e.message || 'Gagal export');
    } finally {
      setExportingFull(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  // Realtime: auto-refresh on checkin/uncheckin events
  useEffect(() => {
    const es = new EventSource(`${apiBase()}/public/stream`);
    const onChange = async () => {
      if (!loading) await load();
    };
    es.addEventListener('checkin', onChange as any);
    es.addEventListener('uncheckin', onChange as any);
    return () => { es.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markCheckedIn = async (id: string) => {
    try {
      setBusyCheckinId(id);
      await apiFetch(`/guests/${id}/checkin`, { method: 'POST' });
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal check-in');
    } finally {
      setBusyCheckinId(null);
    }
  };

  const removeGuest = async (id: string) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Hapus tamu ini?');
      if (!ok) return;
    }
    try {
      setBusyDeleteId(id);
      await apiFetch(`/guests/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus tamu');
    } finally {
      setBusyDeleteId(null);
    }
  };

  const doImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setMessage(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBase()}/guests/import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessage(`Import berhasil: ${data.created}/${data.total} dibuat.`);
      setImportFile(null);
      setPage(1);
      load();
    } catch (e: any) {
      setError(e.message || 'Gagal import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen p-6 md:p-8 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full max-w-sm rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          />
          <button
            disabled={loading}
            onClick={() => { setPage(1); load(); }}
            className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
          <a
            href="/admin/guests/new"
            className="ml-auto inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-sm font-medium text-brand-text shadow-soft hover:bg-brand-primarySoft"
          >
            + Tambah
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e)=> setImportFile(e.target.files?.[0] || null)}
          />
          <button
            disabled={!importFile || importing}
            onClick={doImport}
            className="inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface px-3 py-1 text-sm font-medium text-brand-text hover:bg-brand-surfaceMuted disabled:opacity-50"
          >
            {importing ? 'Mengimpor...' : 'Import CSV'}
          </button>
          <button
            className="ml-auto inline-flex items-center text-sm font-medium text-brand-text hover:text-brand-primary disabled:text-brand-textMuted"
            onClick={doExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            className="inline-flex items-center text-sm font-medium text-brand-text hover:text-brand-primary disabled:text-brand-textMuted ml-2"
            onClick={doExportFull}
            disabled={exportingFull}
          >
            {exportingFull ? 'Exporting...' : 'Export Event'}
          </button>
        </div>

        {message && <div className="text-sm text-brand-accent">{message}</div>}
        {error && <div className="text-sm text-brand-danger">{error}</div>}

        <div className="overflow-auto rounded-xl border border-brand-border bg-brand-surface shadow-soft">
          {loading && <div className="p-3 text-sm text-brand-textMuted">Memuat data...</div>}
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surfaceMuted text-left text-xs font-semibold uppercase tracking-wide text-brand-textMuted">
                <th className="px-3 py-2">No</th>
                <th className="px-3 py-2">Foto</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Meja</th>
                <th className="px-3 py-2">Perusahaan</th>
                <th className="px-3 py-2">Catatan</th>
                <th className="px-3 py-2">Waktu Check-in</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {resp?.data.map((g) => (
                <tr key={g.id} className="border-b border-brand-border/70 last:border-0 hover:bg-brand-surfaceMuted/60">
                  <td className="px-3 py-2 text-xs text-brand-textMuted">{g.queueNumber}</td>
                  <td className="px-3 py-2">
                    {g.photoUrl ? (
                      <img src={toApiUrl(g.photoUrl)} alt={g.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <span className="text-xs text-brand-textMuted">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-brand-text">{g.guestId}</td>
                  <td className="px-3 py-2 text-brand-text">{g.name}</td>
                  <td className="px-3 py-2 text-brand-text">{g.tableLocation}</td>
                  <td className="px-3 py-2 text-brand-textMuted">{g.company || '-'}</td>
                  <td className="px-3 py-2 text-brand-textMuted">{g.notes || '-'}</td>
                  <td className="px-3 py-2 text-brand-textMuted">{g.checkedInAt ? new Date(g.checkedInAt).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${g.checkedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {g.checkedIn ? 'Checked-in' : 'Belum'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface px-3 py-1 font-medium text-brand-text hover:bg-brand-surfaceMuted"
                        href={`/admin/guests/${g.id}`}
                      >
                        Edit
                      </a>
                      {!g.checkedIn && (
                        <button
                          disabled={busyCheckinId===g.id}
                          className="inline-flex items-center rounded-full bg-brand-primary px-3 py-1 font-medium text-white shadow-soft hover:bg-blue-600 disabled:opacity-50"
                          onClick={() => markCheckedIn(g.id)}
                        >
                          {busyCheckinId===g.id ? 'Checking...' : 'Check-in'}
                        </button>
                      )}
                      <button
                        disabled={busyDeleteId===g.id}
                        className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                        onClick={() => removeGuest(g.id)}
                      >
                        {busyDeleteId===g.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            disabled={page<=1}
            onClick={() => setPage((p)=>p-1)}
            className="inline-flex items-center rounded-lg border border-brand-border bg-brand-surface px-3 py-1 font-medium text-brand-text hover:bg-brand-surfaceMuted disabled:opacity-50"
          >
            Prev
          </button>
          <div className="text-brand-textMuted">Hal {page}</div>
          <button
            disabled={(resp?.data.length||0)<pageSize}
            onClick={() => setPage((p)=>p+1)}
            className="inline-flex items-center rounded-lg border border-brand-border bg-brand-surface px-3 py-1 font-medium text-brand-text hover:bg-brand-surfaceMuted disabled:opacity-50"
          >
            Next
          </button>
          <button
            className="ml-auto inline-flex items-center text-sm font-medium text-brand-text hover:text-brand-primary disabled:text-brand-textMuted"
            onClick={doExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            className="inline-flex items-center text-sm font-medium text-brand-text hover:text-brand-primary disabled:text-brand-textMuted ml-2"
            onClick={doExportFull}
            disabled={exportingFull}
          >
            {exportingFull ? 'Exporting...' : 'Export Event'}
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}
