# API Design (Ringkas)

Base URL: `/api` (same-origin via Next.js rewrites ke backend)

- POST `/auth/login`
  - Req: `{ "username": string, "password": string }`
  - Res: `{ "access_token": string }`

- GET `/guests` (auth)
  - Query: `q, guestId, name, table, checkedIn, page, pageSize, eventId`
  - Res: `{ data: Guest[], total: number }`

- POST `/guests` (auth, multipart optional `photo`)
- GET `/guests/:id` (auth)
- PUT `/guests/:id` (auth, multipart optional `photo`)
- DELETE `/guests/:id` (auth)
- POST `/guests/:id/checkin` (auth)
- POST `/guests/import` (auth, file csv: `file`)
  - Header kolom yang diterima: `guest_id,name,table_location,company,notes`
  - Kolom wajib: `guest_id,name,table_location`
  - `company` dan `notes` opsional
- GET `/guests/export` (auth, csv)
  - Header kolom: `guest_id,name,table_location,company,notes`
- GET `/guests/export/full` (auth, csv)
  - Header kolom lengkap: `id,queueNumber,guestId,name,photoUrl,tableLocation,company,notes,checkedIn,checkedInAt,createdAt,updatedAt,eventId`
  - Query: `eventId?` (opsional)
- GET `/guests/stats` (auth) → `{ total, checkedIn, notCheckedIn }`

- GET `/config/event` (public) → event aktif + branding
- GET `/events/active` (auth)
- PUT `/events/active` (auth)
- POST `/events/upload/logo` (auth, file `logo`)
- POST `/events/upload/background` (auth, file `background`) 
- POST `/events/purge` (auth)
  - Body: `{ resetBranding?: boolean }`
  - Efek: hapus semua tamu di event aktif; opsi reset branding ke default
 - POST `/events/preview` (auth)
   - Body: subset dari `{ overlayOpacity?: number, backgroundType?: 'NONE'|'IMAGE'|'VIDEO', backgroundImageUrl?: string, backgroundVideoUrl?: string }`
   - Efek: siarkan event SSE `preview` ke semua klien untuk live preview tema (non-persisten)
 - POST `/events/preview/clear` (auth)
   - Efek: hentikan live preview dan kembalikan ke config terakhir

- GET `/public/guests/search` (public)
  - Query: `guestId` atau `name` (partial)
  - Res: `Guest[]` (hanya milik event aktif)
- GET `/public/guests/history` (public)
  - Query: `limit?` (default 20)
  - Res: `Guest[]` (urut terbaru)
- GET `/public/stream` (public, SSE)
  - Event: `config`, `checkin`, `uncheckin`, `preview`, `ping`
