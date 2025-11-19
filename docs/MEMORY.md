# MEMORY: Ringkasan Perubahan Proyek

## Inisialisasi (v0.1.0)
- Struktur monorepo dibuat: `apps/backend`, `apps/frontend`, `docs`.
- Backend: NestJS + Prisma dengan modul `auth`, `events`, `guests`, `public`, dan `prisma` service.
- Prisma schema ditulis (AdminUser, Event, Guest, AuditLog) + seed script.
- Uploads folder disiapkan dan disajikan via `/api/uploads`.
- API Auth, Events (config & uploads), Guests (CRUD, search, pagination, check-in, import/export CSV), Public search.
- Frontend: Next.js + Tailwind diinisialisasi. Halaman admin: login, dashboard, guests list, tambah guest. Util `apiFetch` dan guard `RequireAuth` dibuat.
- Dokumen arsitektur, API, DB, dan catatan modul disiapkan.

## Catatan
- Dependency belum di-install. Jalankan `npm install` di backend & frontend lalu `prisma migrate dev` dan `npm run seed` (backend).
- Lint error saat ini karena dependency belum terpasang dan Prisma Client belum di-generate.

## Update (v0.2.0 - 2025-11-14)
- Perbaikan unggah foto di halaman Edit Tamu (preview dan pengiriman FormData `photo`), serta normalisasi URL agar foto tampil dari `/api/uploads` via helper `toApiUrl()`.
- Penambahan kolom di daftar tamu: Foto (thumbnail), Perusahaan, Catatan, Waktu Check-in.
- Penambahan field di Edit Tamu: Nomor Urut (queueNumber), toggle Sudah Check-in + input waktu Check-in (ISO), dan pesan sukses setelah simpan.
- Quick Add Guest pada `/admin/dashboard` untuk input cepat tamu.
- Backend DTO (Create/Update) diperketat: konversi otomatis `queueNumber` (string→number), `checkedIn` (string→boolean) untuk dukung multipart form.

## Update (v0.3.0 - 2025-11-16)
- Analisis struktur proyek + pembuatan SWF (A1–A4, D1–D3). Tidak ada perubahan kode (documentation-only).
- CHANGELOG ditambah entri v0.3.0.
- Discrepancy yang dicatat:
  - API `POST /api/events/purge` tersedia di backend namun belum ada di `docs/API.md` (ditambahkan ke catatan modul EVENTS).
  - Default `GET /api/public/guests/history` adalah `limit=20` (dokumen sebelumnya menyebut 10; dikoreksi di catatan modul GUESTS).
- Rencana peningkatan keamanan & kualitas:
  - Rate limiting pada endpoint login.
  - Pertimbangan migrasi penyimpanan token ke cookies httpOnly + strategi refresh/rotation.
  - Validasi mimetype/ukuran file upload (logo/background/foto) + whitelist ekstensi.

## Update (v0.3.1 - 2025-11-16)
- Penambahan konfigurasi timeout popup check-in `checkinPopupTimeoutMs` (default 5000 ms) pada Event Settings; tervalidasi (1–60 detik) dan disimpan di DB.
- Display `/show` sekarang mendengar SSE `checkin` dan menampilkan popup otomatis, auto-close mengikuti konfigurasi timeout.
- Slider Overlay di Settings menampilkan preview langsung tanpa Save via event `theme:preview`.
- Perbaikan Save Settings gagal karena format tanggal: backend kini menerima `YYYY-MM-DD` dan mengonversi ke Date.
- Dokumentasi diperbarui (API/DB_SCHEMA/MODULE_NOTES_DISPLAY/MODULE_NOTES_EVENTS).
- Keputusan: penghapusan `docs/CHANGELOG.md`; seluruh progres akan dicatat di `MEMORY.md` serta `MODULE_NOTES_*.md` sesuai fitur.

## Update (v0.3.2 - 2025-11-16)
- Live Preview tema (overlay & background) real-time di Settings:
  - Local preview pada halaman Settings (client event `theme:preview`).
  - Opsi "Live Preview (broadcast)" untuk menyiarkan via SSE ke semua klien (`/public/stream` event `preview`).
  - Tombol "Stop Preview" dan auto-clear setelah Save.
- Backend: endpoint baru `POST /api/events/preview` dan `POST /api/events/preview/clear` untuk siaran preview non-persisten.
- Frontend: `/show` dan `/checkin` mendengarkan event SSE `preview` dan menerapkan overlay/background secara sementara.

## Update (v0.3.3 - 2025-11-16)
- Menambahkan `docs/HOW_TO_START.md` sebagai panduan quickstart untuk menjalankan backend (NestJS + Prisma) dan frontend (Next.js + Tailwind) di lingkungan lokal.
- Menyatukan tema UI admin menggunakan token Tailwind: TopNav, Dashboard, halaman Guests (`/admin/guests`, `/admin/guests/new`, `/admin/guests/[id]`), dan Event Settings (`/admin/settings/event`) kini memakai pola kartu/input/tombol yang konsisten.
- Menambahkan skrip one-click start untuk Windows: `start-dev.ps1` dan `start-dev.bat` di root proyek.
- Perubahan bersifat frontend-only (styling/layout). Kontrak API dan logika backend tidak diubah.

## Update (v0.4.0 - 2025-11-17)
- Perbaikan akses lintas perangkat (LAN):
  - Frontend kini SELALU memanggil API via same-origin path `/api` dari browser (menghindari `localhost`/IP hardcode).
  - Next.js menambahkan rewrites untuk mem-proxy `/api/*` ke backend. Backend origin dapat diatur via ENV `BACKEND_ORIGIN` (opsional). `NEXT_PUBLIC_API_BASE_URL` tetap didukung untuk fallback SSR/build.
  - Dokumen diperbarui: `docs/url.md`, `docs/HOW_TO_START.md`, `docs/ARCHITECTURE.md`.
- Fitur Export lengkap:
  - Backend: endpoint baru `GET /api/guests/export/full` (auth) mengekspor SEMUA kolom tamu (id, queueNumber, guestId, name, photoUrl, tableLocation, company, notes, checkedIn, checkedInAt, createdAt, updatedAt, eventId).
  - Frontend: tombol "Export Event" dipindahkan ke halaman Guests (atas & bawah), berdampingan dengan "Export CSV". Tombol export di Settings dihapus.
  - Dokumen diperbarui: `docs/API.md`, `docs/MODULE_NOTES_GUESTS.md`.
- Peningkatan keterbacaan UI:
  - Tambah utilitas `.text-shadow`, `.text-shadow-md`, `.text-shadow-lg` dan diterapkan pada header (Dashboard, Event Settings, Tambah Tamu, Edit Tamu) serta header brand di `/show` dan `/checkin`.
  - Catatan di `docs/MODULE_NOTES_DISPLAY.md` ditambah.
- Halaman baru: `/about` berisi informasi proyek dan teknologi (dibuat oleh Yohanes Octavian Rizky).

## Update (v0.5.0 - 2025-11-18)
- Glassmorphism theme di frontend:
  - Tailwind: palet warna brand semantik (Option 1), shadow glass, dan transisi yang lebih halus.
  - Global CSS: variabel CSS untuk warna dan level glass, utilitas `.glass-card`, `.glass-input`, dan panel glass lain.
  - Komponen UI inti (`Button`, `Card`, `Input`, `Select`, `Textarea`, `Label`) mendukung varian `glass`.
- Redesign halaman admin:
  - `/admin/login`, `/admin/dashboard`, `/admin/guests`, `/admin/guests/new`, `/admin/guests/[id]`, dan `/admin/settings/event` memakai layout kartu & form glass yang konsisten.
- Redesign halaman publik:
  - `/checkin`: satu field pencarian (Guest ID atau Nama) dengan gaya glass; daftar hasil & riwayat dalam panel glass; popup konfirmasi full-screen bertema glass gelap dengan teks putih kontras. Kontrol manual background/config/overlay di popup dihapus.
  - `/show`: tidak lagi memiliki form pencarian manual; menampilkan kartu glass tamu yang baru check-in berdasarkan event SSE `checkin`.
- Peningkatan keterbacaan teks:
  - Penyesuaian warna teks agar tidak abu-abu di atas background glass (form, tabel guests, popup check-in, display), diganti menjadi putih/putih-80 atau brand text tergantung konteks.
- Dokumentasi:
  - README diperbarui dengan deskripsi fitur terbaru dan flowchart aplikasi.
  - `docs/ARCHITECTURE.md`, `docs/MODULE_NOTES_GUESTS.md`, `docs/MODULE_NOTES_DISPLAY.md`, dan `docs/MODULE_NOTES_EVENTS.md` diperbarui agar sesuai dengan alur publik dan tema glass terbaru.

