# Guest Registration App

Monorepo: NestJS (backend) + Next.js (frontend) + Prisma (PostgreSQL).

## Apa itu proyek ini?

Aplikasi registrasi & check-in tamu untuk acara/event. Panitia bisa mengelola data tamu, melakukan check-in, dan menampilkan layar display publik yang real-time dan bisa diakses dari banyak perangkat (laptop, tablet, TV/layar besar).

## Fitur Utama

- **Manajemen tamu**: tambah/edit/hapus tamu, import CSV, export CSV (ringkas & lengkap), statistik.
- **Check-in real-time**: check-in dari halaman admin maupun halaman publik `/checkin`, dengan update langsung ke layar display.
- **Branding event**: atur nama event, logo, background image/video, dan overlay untuk tampilan layar display.
- **Layar display publik**: halaman `/show` untuk menampilkan daftar/history tamu yang baru check-in.
- **UI glassmorphism modern**: tema visual konsisten (Tailwind + CSS variables) untuk halaman admin dan publik dengan efek blur/transparansi dan kontras teks yang dioptimalkan untuk layar besar.
- **Akses multi-perangkat**: frontend memanggil API via path same-origin `/api`, sehingga bisa diakses lewat IP lokal (LAN) tanpa konfigurasi rumit.

## Flow Penggunaan (Sudut Pandang Panitia)

1. **Setup awal**
   - Siapkan database PostgreSQL.
   - Salin `apps/backend/.env.example` menjadi `.env` dan isi `DATABASE_URL`, `JWT_SECRET`, dan `CORS_ORIGIN`.
   - Jalankan migrasi & seed untuk membuat schema dan data awal admin/tamu.

2. **Menjalankan aplikasi di lokal**
   - Cara paling cepat (Windows): double-click `start-dev.bat` di folder root.
   - Atau jalankan backend & frontend secara manual (lihat bagian *Cara Menjalankan* di bawah).

3. **Konfigurasi event & branding**
   - Buka `http://localhost:3000/admin/login` dan login sebagai admin.
   - Atur event aktif, logo, background image/video, dan overlay di `/admin/settings/event`.

4. **Menyiapkan tamu**
   - Import data tamu dari CSV di halaman `/admin/guests`.
   - Tambah/edit tamu secara manual bila diperlukan.

5. **Saat hari-H acara**
   - Gunakan `/admin/dashboard` untuk memantau statistik dan melakukan check-in cepat.
   - Gunakan `/checkin` sebagai halaman check-in publik (tanpa login) di meja registrasi.
   - Tampilkan `/show` di layar besar/TV sebagai display tamu yang baru check-in.

6. **Setelah acara**
   - Export data tamu (ringkas atau penuh) untuk laporan atau arsip.
   - Opsional: purge tamu & reset branding di `/admin/settings/event` untuk event berikutnya.

## Flowchart Aplikasi (Tingkat Tinggi)

```mermaid
flowchart LR
  A[Admin Login (/admin/login)]
  B[Konfigurasi Event & Branding (/admin/settings/event)]
  C[Kelola & Import Tamu (/admin/guests)]
  D[Monitoring & Quick Actions (/admin/dashboard)]
  E[Check-in Publik (/checkin)]
  F[Layar Display Publik (/show)]
  G[Export Data Setelah Event]

  A --> B --> C
  C --> D
  C --> E --> F
  C --> G
```

## Arsitektur & Struktur Folder

Monorepo yang berisi backend (NestJS) dan frontend (Next.js) dalam satu repo.

```text
/ (root)
  apps/
    backend/    # API NestJS + Prisma + uploads
    frontend/   # Next.js App Router + Tailwind (UI)
  docs/         # Dokumentasi proyek (API, arsitektur, URL, dsb.)
  start-dev.*   # Skrip start cepat untuk Windows
```

Detail arsitektur dan aliran data dijelaskan di `docs/ARCHITECTURE.md`.

## Cara Menjalankan (Development Lokal)

### Opsi A — One-Click (Windows)

- Double-click `start-dev.bat` di folder root.
- Skrip akan menjalankan backend dan frontend, serta membuka browser ke `http://localhost:3000/admin/login`.
- Pastikan Node.js >= 18 dan PostgreSQL sudah siap, dengan `.env` backend terisi benar.

### Opsi B — Manual

**Backend**

```bash
cd apps/backend
npm install
npm run prisma:migrate
npm run prisma:generate
npm run seed
npm run dev
```

**Frontend**

```bash
cd apps/frontend
npm install
npm run dev
```

Flow manual ini dijelaskan lebih detail di `docs/HOW_TO_START.md`.

## URL Penting

- **Publik**
  - `http://localhost:3000/show` → layar display tamu
  - `http://localhost:3000/checkin` → halaman check-in publik
  - `http://localhost:3000/about` → informasi proyek & teknologi

- **Admin**
  - `http://localhost:3000/admin/login` → login admin
  - `http://localhost:3000/admin/dashboard` → dashboard & Portal Actions
  - `http://localhost:3000/admin/guests` → manajemen tamu (list, import/export, edit)
  - `http://localhost:3000/admin/settings/event` → pengaturan event & branding

Daftar URL lebih lengkap ada di `docs/url.md`.

## Konfigurasi Environment (Ringkas)

- **Backend (`apps/backend/.env`)**
  - `DATABASE_URL` → koneksi PostgreSQL
  - `JWT_SECRET` → secret untuk JWT admin
  - `CORS_ORIGIN` → origin frontend saat development (mis. `http://localhost:3000`)

- **Frontend (`apps/frontend/.env`)**
  - Default: memanggil API via same-origin `/api` dan diproksikan ke backend melalui Next.js rewrites.
  - `BACKEND_ORIGIN` → opsional, target backend untuk rewrites (mis. `http://localhost:4000`).
  - `NEXT_PUBLIC_API_BASE_URL` → opsional, fallback base URL API (mis. `http://localhost:4000/api`).

## Dokumentasi Lebih Lanjut

- `docs/HOW_TO_START.md` → panduan start lengkap + troubleshooting.
- `docs/ARCHITECTURE.md` → arsitektur sistem dan aliran data.
- `docs/API.md` → ringkasan endpoint API.
- `docs/url.md` → dokumentasi URL frontend & API.
