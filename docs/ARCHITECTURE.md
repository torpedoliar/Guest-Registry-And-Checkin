# Arsitektur Sistem Registrasi Tamu

- Frontend: Next.js + TypeScript + Tailwind CSS (App Router). Halaman admin dan publik `/show`.
- Backend: NestJS + TypeScript + Prisma (PostgreSQL). Autentikasi JWT untuk admin. Upload file disajikan via `/api/uploads`.
- Database: PostgreSQL (ORM: Prisma). Model inti: `Event`, `Guest`, `AdminUser`, opsional `AuditLog`.

## Aliran Data
- Admin → login (JWT) → kelola tamu (CRUD, import/export, check-in) → atur event & branding.
- Publik `/show` → cari tamu by `guest_id`/`name` → tampilkan detail + foto + lokasi + brand event.

## Struktur Folder (Monorepo)
```
/ (root)
  apps/
    backend/
      src/
      prisma/
      uploads/
    frontend/
  docs/
```

## Prinsip Desain
- Type-safe, validasi di backend (DTO) dan frontend (form).
- Responsif penuh, UX sederhana.
- Konfigurasi event (logo, background image/video, overlay) tersentral.
- Akses lintas perangkat: Frontend selalu memanggil API same-origin di path `/api`, diproksikan ke backend melalui Next.js rewrites. Target backend dapat ditentukan via ENV `BACKEND_ORIGIN` saat development/host berbeda.
- Real-time melalui Server-Sent Events (SSE) pada `/api/public/stream` untuk events: `config`, `checkin`, `uncheckin`, `preview`.

## Halaman Tambahan
- `/about` menjelaskan ringkasan proyek, pembuat (Yohanes Octavian Rizky), teknologi yang digunakan, dan fitur utama.
