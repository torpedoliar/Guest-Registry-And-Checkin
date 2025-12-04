"use client";
import RequireAuth from '../../../components/RequireAuth';
import { useEffect, useState, useRef, useCallback } from 'react';
import { apiFetch, toApiUrl, apiBase } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Edit, Trash2, CheckCircle, Gift, X, AlertTriangle, Users, Tag } from 'lucide-react';
import { useSSE } from '../../../lib/sse-context';

type GuestCategory = 'REGULAR' | 'VIP' | 'VVIP' | 'MEDIA' | 'SPONSOR' | 'SPEAKER' | 'ORGANIZER';

const CATEGORY_CONFIG: Record<GuestCategory, { label: string; color: string; bg: string; border: string }> = {
  REGULAR: { label: 'Regular', color: 'text-gray-300', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
  VIP: { label: 'VIP', color: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  VVIP: { label: 'VVIP', color: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  MEDIA: { label: 'Media', color: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  SPONSOR: { label: 'Sponsor', color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  SPEAKER: { label: 'Speaker', color: 'text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
  ORGANIZER: { label: 'Organizer', color: 'text-cyan-300', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
};

interface Guest {
  id: string;
  queueNumber: number;
  guestId: string;
  name: string;
  photoUrl?: string | null;
  tableLocation: string;
  company?: string | null;
  department?: string | null;
  division?: string | null;
  notes?: string | null;
  category: GuestCategory;
  checkedIn: boolean;
  checkedInAt?: string | null;
  souvenirTaken: boolean;
}

interface GuestsResponse { data: Guest[]; total: number }

interface ImportResult {
  created: number;
  skipped: number;
  total: number;
  duplicates: Array<{ guestId: string; name: string; reason: string }>;
}

export default function GuestsListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [resp, setResp] = useState<GuestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyCheckinId, setBusyCheckinId] = useState<string | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingFull, setExportingFull] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<GuestCategory | ''>('');

  const [eventCfg, setEventCfg] = useState<any>(null);
  const { addEventListener, removeEventListener } = useSSE();

  // Use refs to avoid stale closures in SSE callbacks
  const pageRef = useRef(page);
  const qRef = useRef(q);
  pageRef.current = page;
  qRef.current = q;

  useEffect(() => {
    fetch(`${apiBase()}/config/event`).then(r => r.json()).then(setEventCfg).catch(() => { });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: qRef.current, page: String(pageRef.current), pageSize: String(pageSize) });
      const data = await apiFetch<GuestsResponse>(`/guests?${params.toString()}`);
      setResp(data);
      // Clear selection when loading new data
      setSelectedIds(new Set());
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const toggleSouvenir = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/guests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ souvenirTaken: !current })
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal update souvenir');
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
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errData = await res.json();
          throw new Error(errData.message || errData.error || 'Gagal export');
        }
        throw new Error(await res.text() || 'Gagal export');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const m = /filename="?([^";]+)"?/i.exec(cd);
      const filename = m?.[1] || 'data_tamu.xlsx';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Export data tamu berhasil!');
    } catch (e: any) {
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
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errData = await res.json();
          throw new Error(errData.message || errData.error || 'Gagal export laporan');
        }
        throw new Error(await res.text() || 'Gagal export laporan');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const m = /filename="?([^";]+)"?/i.exec(cd);
      const filename = m?.[1] || 'laporan_event.xlsx';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Export laporan event berhasil!');
    } catch (e: any) {
      setError(e.message || 'Gagal export laporan');
    } finally {
      setExportingFull(false);
    }
  };

  const doExportPdf = async () => {
    try {
      setExportingPdf(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBase()}/guests/export/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errData = await res.json();
          throw new Error(errData.message || errData.error || 'Gagal export PDF');
        }
        throw new Error(await res.text() || 'Gagal export PDF');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const m = /filename="?([^";]+)"?/i.exec(cd);
      const filename = m?.[1] || 'laporan_event.pdf';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Export PDF berhasil!');
    } catch (e: any) {
      setError(e.message || 'Gagal export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  // Realtime: auto-refresh on checkin/uncheckin events or event changes
  useEffect(() => {
    const onChange = async () => {
      await load();
    };
    const onEventChange = async () => {
      // Reset to page 1 and reload when event changes
      setPage(1);
      await load();
    };
    addEventListener('checkin', onChange);
    addEventListener('uncheckin', onChange);
    addEventListener('guest-update', onChange);
    addEventListener('event_change', onEventChange);
    return () => {
      removeEventListener('checkin', onChange);
      removeEventListener('uncheckin', onChange);
      removeEventListener('guest-update', onChange);
      removeEventListener('event_change', onEventChange);
    };
  }, [load, addEventListener, removeEventListener]);

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
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBase()}/guests/import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errData = await res.json();
          throw new Error(errData.message || errData.error || 'Gagal import');
        }
        throw new Error(await res.text() || 'Gagal import');
      }
      const data: ImportResult = await res.json();
      setImportResult(data);
      if (data.skipped > 0) {
        setMessage(`Import selesai: ${data.created} dibuat, ${data.skipped} dilewati (duplikat/error).`);
      } else {
        setMessage(`Import berhasil: ${data.created}/${data.total} dibuat.`);
      }
      setImportFile(null);
      setPage(1);
      load();
    } catch (e: any) {
      setError(e.message || 'Gagal import');
    } finally {
      setImporting(false);
    }
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (!resp?.data) return;
    if (selectedIds.size === resp.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(resp.data.map(g => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const doBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ok = window.confirm(`Hapus ${selectedIds.size} tamu yang dipilih?`);
    if (!ok) return;

    setBulkActionLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ deleted: number }>('/guests/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      setMessage(`${res.deleted} tamu berhasil dihapus.`);
      setSelectedIds(new Set());
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus tamu');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const doBulkUpdate = async () => {
    if (selectedIds.size === 0 || !bulkCategory) return;

    setBulkActionLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ updated: number }>('/guests/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ 
          ids: Array.from(selectedIds),
          category: bulkCategory,
        }),
      });
      setMessage(`${res.updated} tamu berhasil diperbarui.`);
      setSelectedIds(new Set());
      setShowBulkEditModal(false);
      setBulkCategory('');
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui tamu');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const doBulkCheckin = async (checkedIn: boolean) => {
    if (selectedIds.size === 0) return;
    const action = checkedIn ? 'check-in' : 'batalkan check-in';
    const ok = window.confirm(`${action} ${selectedIds.size} tamu yang dipilih?`);
    if (!ok) return;

    setBulkActionLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ updated: number }>('/guests/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ 
          ids: Array.from(selectedIds),
          checkedIn,
        }),
      });
      setMessage(`${res.updated} tamu berhasil di-${action}.`);
      setSelectedIds(new Set());
      await load();
    } catch (e: any) {
      setError(e.message || `Gagal ${action}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const [qrGuest, setQrGuest] = useState<Guest | null>(null);

  return (
    <RequireAuth>
      <div className="min-h-screen p-6 md:p-8 mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="w-full max-w-sm text-brand-text placeholder:text-brand-textMuted"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                load();
              }
            }}
            placeholder="Search..."
          />
          <Button
            size="sm"
            disabled={loading}
            onClick={() => { setPage(1); load(); }}
          >
            {loading ? 'Mencari...' : 'Cari'}
          </Button>
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
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={!importFile || importing}
            onClick={doImport}
          >
            {importing ? 'Mengimpor...' : 'Import Excel'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={doExport}
            disabled={exporting}
            title="Export data tamu untuk import ulang"
          >
            {exporting ? 'Exporting...' : 'Export Data Tamu'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-2"
            onClick={doExportFull}
            disabled={exportingFull}
            title="Export laporan lengkap event (termasuk check-in, souvenir, hadiah)"
          >
            {exportingFull ? 'Exporting...' : 'Export Laporan Event'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-2"
            onClick={doExportPdf}
            disabled={exportingPdf}
          >
            {exportingPdf ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-sm text-blue-300 font-medium">
              {selectedIds.size} tamu dipilih
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowBulkEditModal(true)}
              disabled={bulkActionLoading}
            >
              <Tag size={14} className="mr-1" />
              Ubah Kategori
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => doBulkCheckin(true)}
              disabled={bulkActionLoading}
            >
              <CheckCircle size={14} className="mr-1" />
              Check-in
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={doBulkDelete}
              disabled={bulkActionLoading}
            >
              <Trash2 size={14} className="mr-1" />
              Hapus
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              <X size={14} className="mr-1" />
              Batal
            </Button>
          </div>
        )}

        {message && <div className="text-sm text-brand-accent">{message}</div>}
        {error && <div className="text-sm text-brand-danger">{error}</div>}

        {/* Import Result with Duplicates Warning */}
        {importResult && importResult.duplicates.length > 0 && (
          <Card variant="glass" className="p-4 border-amber-500/30 bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-medium text-amber-300 mb-2">
                  {importResult.skipped} data dilewati karena duplikat
                </h4>
                <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                  {importResult.duplicates.slice(0, 10).map((d, i) => (
                    <div key={i} className="text-amber-200/80">
                      • <span className="font-mono">{d.guestId}</span> - {d.name} ({d.reason})
                    </div>
                  ))}
                  {importResult.duplicates.length > 10 && (
                    <div className="text-amber-200/60 italic">
                      ... dan {importResult.duplicates.length - 10} lainnya
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setImportResult(null)}
                  className="mt-3 text-xs text-amber-400 hover:text-amber-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </Card>
        )}

        <Card variant="glass" className="overflow-hidden p-0">
          {loading && <div className="p-3 text-sm text-white/80">Memuat data...</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 bg-white/5 text-left text-xs font-semibold uppercase tracking-wide text-white/70">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={!!(resp?.data && resp.data.length > 0 && selectedIds.size === resp.data.length)}
                      onChange={toggleSelectAll}
                      className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Foto</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Meja</th>
                  <th className="px-4 py-3">Perusahaan</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Waktu Check-in</th>
                  {eventCfg?.enableSouvenir && <th className="px-4 py-3 text-center">Souvenir</th>}
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {resp?.data.map((g) => {
                  const cat = CATEGORY_CONFIG[g.category] || CATEGORY_CONFIG.REGULAR;
                  return (
                    <tr key={g.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(g.id) ? 'bg-blue-500/10' : ''}`}>
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(g.id)}
                          onChange={() => toggleSelect(g.id)}
                          className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-white/70 align-middle">{g.queueNumber}</td>
                      <td className="px-4 py-3 align-middle">
                        {g.photoUrl ? (
                          <img src={toApiUrl(g.photoUrl)} alt={g.name} className="h-10 w-10 rounded-full object-cover border border-white/20" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40 border border-white/10">
                            <Users size={16} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white/80 align-middle">{g.guestId}</td>
                      <td className="px-4 py-3 text-white font-medium align-middle">
                        {g.name}
                        {g.notes && (
                          <div className="text-xs text-amber-300/80 mt-1 px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 max-w-xs truncate">
                            {g.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cat.bg} ${cat.color} border ${cat.border}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white align-middle">{g.tableLocation}</td>
                      <td className="px-4 py-3 text-white/70 align-middle">{g.company || '-'}</td>
                      <td className="px-4 py-3 text-white/70 align-middle">{g.division || '-'}</td>
                      <td className="px-4 py-3 text-white/70 align-middle">{g.department || '-'}</td>
                      <td className="px-4 py-3 text-white/70 text-xs align-middle">
                        {g.checkedInAt ? new Date(g.checkedInAt).toLocaleString('id-ID', { hour12: false }) : '-'}
                      </td>
                      {eventCfg?.enableSouvenir && (
                        <td className="px-4 py-3 align-middle text-center">
                          <button
                            onClick={() => toggleSouvenir(g.id, g.souvenirTaken)}
                            className={`p-1.5 rounded-full transition-colors ${g.souvenirTaken ? 'bg-brand-primary text-white' : 'bg-white/10 text-white/30 hover:bg-white/20'}`}
                            title={g.souvenirTaken ? 'Sudah ambil souvenir' : 'Belum ambil souvenir'}
                          >
                            <Gift size={16} />
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-3 align-middle text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${g.checkedIn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                          {g.checkedIn ? 'Checked-in' : 'Belum'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Tampilkan QR"
                            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setQrGuest(g)}
                          >
                            <QrCode size={18} />
                          </button>
                          <a
                            title="Edit Tamu"
                            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 transition-colors"
                            href={`/admin/guests/${g.id}`}
                          >
                            <Edit size={18} />
                          </a>
                          {!g.checkedIn && (
                            <button
                              title="Check-in Manual"
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300 transition-colors disabled:opacity-50"
                              disabled={busyCheckinId === g.id}
                              onClick={() => markCheckedIn(g.id)}
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            title="Hapus Tamu"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors disabled:opacity-50"
                            disabled={busyDeleteId === g.id}
                            onClick={() => removeGuest(g.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <div className="text-brand-textMuted">Hal {page}</div>
          <Button
            size="sm"
            variant="secondary"
            disabled={(resp?.data.length || 0) < pageSize}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
          {resp && (
            <div className="text-brand-textMuted ml-auto">
              Total: {resp.total} tamu
            </div>
          )}
        </div>

        {/* QR Modal */}
        {qrGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setQrGuest(null)}>
            <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold text-gray-900">QR Code: {qrGuest.name}</h3>
              <div className="mb-4 flex justify-center">
                <QRCodeSVG value={qrGuest.id} size={200} />
              </div>
              <p className="mb-6 text-sm text-gray-500">Scan code ini di Kiosk Check-in</p>
              <Button onClick={() => setQrGuest(null)}>Tutup</Button>
            </div>
          </div>
        )}

        {/* Bulk Edit Modal */}
        {showBulkEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowBulkEditModal(false)}>
            <div className="w-full max-w-md rounded-xl bg-slate-900 border border-white/20 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
                <Tag size={20} className="text-blue-400" />
                Ubah Kategori ({selectedIds.size} tamu)
              </h3>
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">Pilih Kategori Baru</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as GuestCategory[]).map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setBulkCategory(cat)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          bulkCategory === cat 
                            ? `${cfg.bg} ${cfg.border} ring-2 ring-blue-500` 
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => { setShowBulkEditModal(false); setBulkCategory(''); }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={doBulkUpdate}
                  disabled={!bulkCategory || bulkActionLoading}
                  className="flex-1"
                >
                  {bulkActionLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
