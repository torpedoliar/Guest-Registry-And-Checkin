# Modul: Display /show

- Menerima event check-in secara real-time via SSE (`checkin`) dan menampilkan popup tamu yang baru hadir.
- Tampilkan: `queueNumber`, `guestId`, `name`, `photo`, `tableLocation`/room, `company`.
- Optimasi layar besar: teks besar, kontras, overlay gelap di atas background.
- Auto-hide popup mengikuti konfigurasi `checkinPopupTimeoutMs` dari Event Settings.

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

## Update 2025-11-18
- Halaman `/show` tidak lagi memiliki form pencarian manual; seluruh tampilan tamu digerakkan oleh event SSE `checkin` dari backend.
- Popup tamu pada `/show` menggunakan tema glassmorphism gelap (card `bg-slate-900/85` dengan border putih transparan dan teks putih) agar tetap terbaca di atas background image/video yang variatif.
