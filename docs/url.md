# Dokumentasi URL

Catatan: Semua endpoint API berada di bawah prefix `/api` (same-origin). Frontend menggunakan host saat ini (IP/domain) dan diproksikan ke backend melalui Next.js rewrites. Backend origin dapat diatur via ENV `BACKEND_ORIGIN` (opsional). `NEXT_PUBLIC_API_BASE_URL` tetap didukung untuk fallback SSR/build.

## Halaman Publik
- `/` → redirect ke `/show`
- `/show` → Layar display publik (branding gambar/video + overlay). Real-time via SSE `config`.
- `/checkin` → Halaman check-in publik (tanpa login). Cari tamu (ID/Nama), check-in, tampilkan konfirmasi, history real-time.
- `/about` → Informasi proyek, pembuat (Yohanes Octavian Rizky), teknologi, fitur.

## Halaman Admin (Perlu Login JWT)
- `/admin/login` → Form login admin.
- `/admin/dashboard` → Statistik tamu (Total/Sudah/Belum check-in), Portal Actions (Check-in/Uncheck-in cepat), Quick Add Guest. Real-time via SSE.
- `/admin/guests` → Daftar tamu (pencarian/paginasi), Import CSV, Export CSV (ringkas), Export Event (lengkap), Edit/Check-in/Delete. Real-time refresh saat check-in.
- `/admin/guests/new` → Tambah tamu.
- `/admin/guests/[id]` → Edit tamu (foto, data, status check-in).
- `/admin/settings/event` → Pengaturan event & branding (logo, background image/video, overlay opacity). Tombol Purge Guests dan Purge + Reset Branding.

Semua halaman (kecuali `/show` dan `/checkin` yang mengelola sendiri) mengikuti tema global (branding) melalui komponen ThemeBackground.

## Static Uploads
- `/api/uploads/...` → Berkas upload (foto tamu, logo, background). Disajikan dengan cache (ETag, immutable, max-age 30 hari).

## API: Auth
- `POST /api/auth/login`
  - Body: `{ username, password }`
  - Res: `{ access_token }` (JWT 12 jam)

## API: Event & Branding
- `GET /api/config/event` (Publik)
  - Cache-Control: `public, max-age=30`
- `GET /api/events/active` (Admin)
- `PUT /api/events/active` (Admin)
  - Body: `{ name, date?, location?, backgroundType, backgroundImageUrl?, backgroundVideoUrl?, overlayOpacity }`
- `POST /api/events/upload/logo` (Admin, multipart: field `logo`)
- `POST /api/events/upload/background` (Admin, multipart: field `background`)
  - Otomatis deteksi image/video
- `POST /api/events/purge` (Admin)
  - Body opsional: `{ resetBranding: boolean }`

## API: Guests (Admin)
- `GET /api/guests` → Query: `q?`, `name?`, `guestId?`, `table?`, `checkedIn? (true|false)`, `page?`, `pageSize?`
- `GET /api/guests/stats`
- `GET /api/guests/:id`
- `POST /api/guests` (multipart: field `photo` opsional) → Body form fields: `guestId`, `name`, `tableLocation`, `company?`, `notes?`, `queueNumber?`, `checkedIn?`, `checkedInAt?`
- `PUT /api/guests/:id` (multipart: field `photo` opsional)
- `DELETE /api/guests/:id`
- `POST /api/guests/:id/checkin`
- `POST /api/guests/:id/uncheckin`
- `POST /api/guests/import` (multipart: field `file` CSV)
- `GET /api/guests/export` (CSV, ringkas)
- `GET /api/guests/export/full` (CSV, lengkap semua kolom)

## API: Publik (Tanpa Login)
- `GET /api/public/guests/search?guestId&name`
  - Cocok persis `guestId` diprioritaskan; jika tidak ada → contains (id/nama)
- `POST /api/public/guests/checkin` → Body: `{ guestId }`
- `GET /api/public/guests/history?limit=10`
- `GET /api/public/stream` (SSE)
  - Event: `config`, `checkin`, `uncheckin`, `ping`

## Lingkungan (ENV)
- Frontend: same-origin `/api` via rewrites. Opsional: `BACKEND_ORIGIN` untuk menentukan target backend rewrites. `NEXT_PUBLIC_API_BASE_URL` tetap didukung untuk fallback SSR/build.
- Backend: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (opsional). SSE tidak dikompresi.

## Catatan Real-time
- SSE dipakai untuk menyebarkan perubahan konfigurasi event (tema) dan perubahan status check-in, agar halaman `/show`, `/checkin`, `/admin/dashboard`, `/admin/guests`, dan layout global mengikuti secara langsung tanpa refresh.
