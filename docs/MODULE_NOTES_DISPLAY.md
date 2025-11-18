# Modul: Display /show

- Search by `guest_id` atau partial `name`.
- Tampilkan: queue_number, guest_id, name, photo, table/room, company.
- Optimasi layar besar: teks besar, kontras, overlay gelap di atas background.
- Auto reset ke standby setelah beberapa detik (opsional, dapat ditambah nanti).

## Update 2025-11-14
- Normalisasi URL aset (logo, background image/video, foto tamu) di frontend dengan helper `toApiUrl()` agar path `/api/uploads/...` diarahkan ke host backend (`NEXT_PUBLIC_API_BASE_URL`).
- Pastikan akses halaman publik via Frontend: `http://localhost:3000/show` (bukan port API 4000).

## Update 2025-11-16
- Sinkron check-in: `/show` subscribe ke SSE `checkin`; saat ada check-in, popup konfirmasi ditampilkan otomatis.
- Auto-close popup mengikuti konfigurasi `checkinPopupTimeoutMs` dari Event Settings.

## Update 2025-11-17
- Peningkatan keterbacaan teks header (judul event dan subjudul tanggal/lokasi) di atas background gambar/video:
  - Tambah utilitas CSS `text-shadow`, `text-shadow-md`, `text-shadow-lg`.
  - Terapkan `text-shadow-lg` pada judul dan `text-shadow` pada subjudul di `/show` dan `/checkin`.
  - Tujuan: mencegah teks terlihat "mati" saat background terang atau ramai.
