# HOW TO START – Sistem Registrasi Tamu

Panduan singkat untuk menjalankan backend (API) dan frontend (Next.js) di lingkungan pengembangan lokal.

## 0. Quick Start (Windows)

- **Option A — One-Click Start**
  - Double-click `start-dev.bat` di folder root.
  - Skrip akan membuka 2 jendela (Backend & Frontend), meng-install dependencies jika perlu, lalu membuka browser ke `http://localhost:3000/admin/login`.
  - Pastikan Node.js >= 18 terpasang. Untuk database, siapkan `.env` backend dan jalankan migrasi/seed sesuai Bagian 3 (pertama kali setup).

- **Option B — Manual (ringkas)**
  - Backend: `cd apps/backend && npm install && npm run prisma:migrate && npm run prisma:generate && npm run seed && npm run dev`
  - Frontend: `cd apps/frontend && npm install && npm run dev`

- **Akses dari perangkat lain (LAN)**
  - Dari perangkat lain, buka: `http://<IP_PC>:3000` (atau `.../admin/login`).
  - Jika tidak bisa diakses, pastikan firewall Windows mengizinkan Node.js/port 3000 & 4000. Anda bisa menjalankan Next dev dengan `npx next dev -H 0.0.0.0 -p 3000`.
  - Jika backend di host/port berbeda, set `BACKEND_ORIGIN` atau `NEXT_PUBLIC_API_BASE_URL` di `apps/frontend/.env`.

## 1. Prasyarat

- Node.js LTS (>= 18)
- npm (bundled dengan Node.js)
- Database PostgreSQL lokal atau remote

## 2. Clone & Struktur Proyek

Struktur utama monorepo:

- `apps/backend` → NestJS + Prisma (API & database)
- `apps/frontend` → Next.js App Router + Tailwind CSS (UI)
- `docs/` → Dokumentasi proyek

Pastikan dependency sudah ter-install di masing-masing aplikasi.

## 3. Konfigurasi Backend (NestJS)

Masuk ke folder backend:

```bash
cd apps/backend
```

1. Salin/isi file `.env` (sesuaikan dengan environment Anda):

   Contoh variabel penting:

   - `DATABASE_URL=postgresql://user:password@localhost:5432/guest_registry`
   - `JWT_SECRET=your-secret-key`
   - `CORS_ORIGIN=http://localhost:3000`  (alamat frontend saat dev)

2. Install dependency backend:

```bash
npm install
```

3. Jalankan migrasi Prisma dan generate client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

4. Jalankan seed data awal (opsional tapi direkomendasikan):

```bash
npm run seed
```

5. Jalankan server backend (mode development):

```bash
npm run dev
```

Secara default backend berjalan di port yang didefinisikan di `src/main.ts` (umumnya `http://localhost:4000`). Endpoint API tersedia di bawah prefix `/api`.

## 4. Konfigurasi Frontend (Next.js)

Masuk ke folder frontend:

```bash
cd apps/frontend
```

1. Buat file `.env` jika diperlukan.

   Secara default, frontend memanggil API via same-origin path `/api` dan diproksikan ke backend oleh Next.js (rewrites). Anda dapat menyesuaikan target backend saat dev/host berbeda dengan:

   - `BACKEND_ORIGIN=http://localhost:4000` (opsional; untuk mengarahkan rewrites target backend)
   - `NEXT_PUBLIC_API_BASE_URL` (opsional; fallback pada SSR/build jika diperlukan), contoh: `http://localhost:4000/api`

2. Install dependency frontend:

```bash
npm install
```

3. Jalankan server Next.js (mode development):

```bash
npm run dev
```

Secara default frontend berjalan di `http://localhost:3000`.

## 5. URL Penting

- **Publik**
  - `http://localhost:3000/show` → layar display tamu
  - `http://localhost:3000/checkin` → halaman check-in publik
  - `http://localhost:3000/about` → informasi proyek & teknologi

- **Admin**
  - `http://localhost:3000/admin/login` → login admin
  - `http://localhost:3000/admin/dashboard` → dashboard & Portal Actions
  - `http://localhost:3000/admin/guests` → manajemen tamu (list, import/export, edit)
  - `http://localhost:3000/admin/settings/event` → pengaturan event & branding

## 6. Alur Start Cepat (Ringkas)

1. Jalankan backend:
   - `cd apps/backend`
   - `npm install`
   - `npm run prisma:migrate`
   - `npm run prisma:generate`
   - `npm run seed`
   - `npm run dev`

2. Jalankan frontend:
   - `cd apps/frontend`
   - `npm install`
   - salin & isi `.env` jika perlu
   - `npm run dev`

3. Buka browser ke `http://localhost:3000/admin/login` untuk login admin atau `http://localhost:3000/show` untuk layar publik.

## 7. One-Click Start (Windows)

Gunakan skrip berikut di folder root proyek:

- `start-dev.bat` → cocok untuk double-click (jendela CMD, tidak memerlukan PowerShell).
- `start-dev.ps1` → jalankan manual via PowerShell.

Kedua skrip akan:

- Membuka 2 jendela terminal terpisah untuk backend dan frontend (CMD untuk `.bat`, PowerShell untuk `.ps1`).
- Meng-install dependency jika `node_modules` belum ada.
- Menjalankan backend di port 4000 dan frontend di port 3000.
- Membuka browser ke `http://localhost:3000/admin/login`.

Catatan:

- Jika backend berjalan di host/port berbeda, set `BACKEND_ORIGIN` (untuk rewrites proxy) atau `NEXT_PUBLIC_API_BASE_URL` (fallback SSR/build) di `apps/frontend/.env`.
- Akses LAN: jika perangkat lain tidak bisa membuka `http://<IP_PC>:3000`, jalankan Next Dev dengan host terbuka: `npx next dev -H 0.0.0.0 -p 3000` dan izinkan port di Windows Firewall.
- Jika Windows memblokir eksekusi PowerShell scripts, jalankan `.bat` atau jalankan PowerShell sebagai Administrator dan set kebijakan (opsional):

  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

## 8. Troubleshooting

- **Port sudah dipakai (EADDRINUSE)**
  - Tutup proses yang memakai port 3000/4000 atau ubah port (`PORT` untuk backend, `-p` untuk Next). Cek dengan `netstat -ano | findstr :3000`.
- **Tidak bisa diakses dari perangkat lain (LAN)**
  - Jalankan Next dev dengan `-H 0.0.0.0`, pastikan firewall mengizinkan Node.js untuk Private Network. Akses via `http://<IP_PC>:3000`.
- **Gagal koneksi database**
  - Periksa `DATABASE_URL` di `apps/backend/.env`, pastikan PostgreSQL berjalan, lalu jalankan `npm run prisma:migrate` dan `npm run prisma:generate`.
- **Prisma Client belum tergenerate**
  - Jalankan `npm run prisma:generate` di `apps/backend` setelah install deps.
