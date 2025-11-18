# Guest Registration App

Monorepo: NestJS (backend) + Next.js (frontend) + Prisma (PostgreSQL).

## Setup Cepat
1) Backend
```
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```
Env: salin `.env.example` ke `.env` dan isi `DATABASE_URL`, `JWT_SECRET`.

2) Frontend (akan ditambahkan setelah backend siap)
```
cd apps/frontend
npm install
npm run dev
```

## Default
- Backend: http://localhost:4000/api
- Uploads: http://localhost:4000/api/uploads
- Frontend API base: otomatis menggunakan `window.location.origin + '/api'` kecuali `NEXT_PUBLIC_API_BASE_URL` diset.

## Dokumentasi URL
- Lihat daftar halaman dan endpoint lengkap di `docs/url.md`.
