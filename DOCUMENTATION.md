# Guest Registry & Check-in System

## Dokumentasi Lengkap Aplikasi

Aplikasi manajemen pendaftaran tamu dan check-in untuk event, dilengkapi dengan fitur lucky draw, distribusi souvenir, dan statistik real-time.

---

## Daftar Isi

1. [Overview](#overview)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Fitur Utama](#fitur-utama)
4. [Halaman & Cara Penggunaan](#halaman--cara-penggunaan)
5. [Real-time Updates](#real-time-updates)
6. [Multi-Admin Support](#multi-admin-support)
7. [API Endpoints](#api-endpoints)
8. [Instalasi & Konfigurasi](#instalasi--konfigurasi)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 14, React 18, TailwindCSS |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL |
| Real-time | Server-Sent Events (SSE) |
| Auth | JWT Token |

### Fitur Highlight

- ✅ **Check-in Tamu** - Scan QR atau input manual
- ✅ **Lucky Draw** - Undian berhadiah dengan animasi
- ✅ **Distribusi Souvenir** - Tracking pengambilan souvenir
- ✅ **Statistik Real-time** - Dashboard live update
- ✅ **Multi-Admin** - Banyak admin bisa bekerja bersamaan
- ✅ **Auto-Create Guest** - Buat tamu baru saat check-in/souvenir

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ Check-in│ │Souvenir │ │Lucky    │ │  Admin  │            │
│  │  Page   │ │  Page   │ │  Draw   │ │Dashboard│            │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘            │
│       │           │           │           │                  │
│       └───────────┴───────────┴───────────┘                  │
│                       │                                      │
│              ┌────────┴────────┐                             │
│              │   SSE Context   │ ← Real-time Updates         │
│              └────────┬────────┘                             │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    NestJS API                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │    │
│  │  │  Guests  │ │Souvenirs │ │  Prizes  │ │ Events │  │    │
│  │  │Controller│ │Controller│ │Controller│ │Controller│    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│              ┌─────────┴─────────┐                           │
│              │   Prisma ORM      │                           │
│              └─────────┬─────────┘                           │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              └──────────────────┘
```

---

## Fitur Utama

### 1. Guest Check-in

**Deskripsi:** Sistem check-in tamu dengan berbagai metode input.

**Fitur:**
- Scan QR Code menggunakan kamera
- Input manual Guest ID atau Nama
- Auto check-in saat satu hasil ditemukan
- Manual selection saat banyak hasil ditemukan
- **Auto-Create Guest** - Buat tamu baru jika tidak ditemukan (opsional)

**Alur:**
1. Admin membuka halaman `/checkin`
2. Scan QR atau input ID/Nama
3. Sistem mencari tamu di database
4. Jika 1 hasil → Auto check-in
5. Jika >1 hasil → Pilih manual
6. Jika tidak ditemukan + Auto-Create ON → Buat tamu baru & check-in

---

### 2. Souvenir Distribution

**Deskripsi:** Sistem distribusi souvenir dengan tracking inventory.

**Fitur:**
- Dropdown pilih souvenir sebelum scan
- Auto-give souvenir saat tamu ditemukan
- Tracking stok souvenir real-time
- **Auto-Create Guest** - Buat tamu baru jika tidak ditemukan (opsional)
- Pengambilan hadiah lucky draw

**Alur:**
1. Admin membuka halaman `/souvenir`
2. Pilih souvenir dari dropdown
3. Scan QR atau input ID/Nama tamu
4. Sistem otomatis memberikan souvenir
5. Stok berkurang, history tercatat

---

### 3. Lucky Draw

**Deskripsi:** Sistem undian berhadiah dengan animasi menarik.

**Fitur:**
- Manajemen hadiah dengan kategori
- Undian acak dari tamu yang sudah check-in
- Opsi allow multiple wins
- Animasi slot machine style
- Tracking pemenang & pengambilan hadiah

**Alur:**
1. Admin setup hadiah di `/admin/prizes`
2. Buka halaman `/luckydraw` saat event
3. Pilih hadiah yang akan diundi
4. Klik "Putar" untuk mulai undian
5. Animasi berjalan, pemenang ditampilkan
6. Pemenang bisa ambil hadiah di `/souvenir`

---

### 4. Statistics Dashboard

**Deskripsi:** Dashboard statistik real-time untuk monitoring event.

**Statistik yang ditampilkan:**
- Total tamu terdaftar
- Jumlah sudah check-in / belum
- Progress bar kehadiran
- Statistik per perusahaan
- **Statistik Souvenir** - Diambil vs Tersisa
- **Statistik Lucky Draw** - Diundi vs Diambil

---

## Halaman & Cara Penggunaan

### Halaman Publik

| URL | Nama | Deskripsi | Real-time |
|-----|------|-----------|-----------|
| `/` | Home | Landing page event | ❌ |
| `/checkin` | Guest Check-in | Halaman check-in tamu | ✅ |
| `/souvenir` | Souvenir Check-in | Halaman pengambilan souvenir | ✅ |
| `/luckydraw` | Lucky Draw | Halaman undian berhadiah | ✅ |
| `/show` | Display Board | Tampilan untuk layar besar | ✅ |
| `/about` | About | Informasi aplikasi | ❌ |

### Halaman Admin

| URL | Nama | Deskripsi | Real-time |
|-----|------|-----------|-----------|
| `/admin/login` | Login | Halaman login admin | ❌ |
| `/admin/dashboard` | Dashboard | Overview statistik | ✅ |
| `/admin/guests` | Guest List | Daftar & kelola tamu | ✅ |
| `/admin/guests/new` | Add Guest | Tambah tamu baru | ❌ |
| `/admin/guests/[id]` | Edit Guest | Edit detail tamu | ❌ |
| `/admin/souvenirs` | Souvenirs | Kelola inventory souvenir | ⚠️ Manual refresh |
| `/admin/prizes` | Prizes | Kelola hadiah lucky draw | ⚠️ Manual refresh |
| `/admin/statistics` | Statistics | Statistik lengkap | ✅ |
| `/admin/settings/event` | Event Settings | Konfigurasi event | ❌ |
| `/admin/settings/users` | User Management | Kelola admin users | ✅ |

---

## Cara Penggunaan Detail

### 1. Setup Event Baru

```
1. Login sebagai admin di /admin/login
2. Buka /admin/settings/event
3. Isi detail event:
   - Nama Event
   - Tanggal
   - Lokasi
   - Upload Logo (opsional)
   - Set Background Image/Video (opsional)
4. Klik "Simpan Perubahan"
```

### 2. Import Daftar Tamu

```
1. Buka /admin/guests
2. Klik tombol "Import CSV"
3. Siapkan file CSV dengan format:
   guestId,name,tableLocation,company,division
   G001,John Doe,Table 1,PT ABC,Marketing
4. Upload file CSV
5. Tamu akan ditambahkan ke database
```

### 3. Setup Souvenir

```
1. Buka /admin/souvenirs
2. Klik "Tambah Souvenir"
3. Isi detail:
   - Nama Souvenir
   - Jumlah/Stok
   - Deskripsi (opsional)
4. Klik "Simpan"
```

### 4. Setup Hadiah Lucky Draw

```
1. Buka /admin/prizes
2. Klik "Tambah Hadiah"
3. Isi detail:
   - Nama Hadiah
   - Jumlah
   - Kategori (HIBURAN/UTAMA)
   - Allow Multiple Wins (centang jika boleh menang >1x)
4. Klik "Simpan"
```

### 5. Check-in Tamu (Manual)

```
1. Buka /checkin
2. Input Guest ID atau Nama di search box
3. Tekan Enter atau klik "Cari & Check-in"
4. Jika ditemukan 1 tamu → otomatis check-in
5. Jika ditemukan >1 tamu → pilih yang benar
6. Popup konfirmasi muncul
```

### 6. Check-in Tamu (QR Scan)

```
1. Buka /checkin
2. Klik tombol "Scan QR"
3. Arahkan kamera ke QR code tamu
4. Sistem akan otomatis check-in
```

### 7. Auto-Create Guest saat Check-in

```
1. Buka /checkin
2. Klik ikon Settings (⚙️)
3. Aktifkan "Auto Buat Tamu Baru"
4. Sekarang jika tamu tidak ditemukan:
   - Sistem akan membuat tamu baru
   - Langsung check-in
   - Guest ID = input yang dimasukkan
```

### 8. Distribusi Souvenir

```
1. Buka /souvenir
2. Pilih souvenir dari dropdown
3. Input Guest ID/Nama atau Scan QR
4. Sistem otomatis memberikan souvenir
5. Popup konfirmasi muncul
```

### 9. Auto-Create Guest saat Souvenir

```
1. Buka /souvenir
2. Klik ikon Settings (⚙️)
3. Aktifkan "Auto Buat Tamu Baru"
4. Pilih souvenir dari dropdown
5. Jika tamu tidak ditemukan:
   - Sistem membuat tamu baru
   - Langsung berikan souvenir
```

### 10. Menjalankan Lucky Draw

```
1. Pastikan sudah ada hadiah di /admin/prizes
2. Pastikan ada tamu yang sudah check-in
3. Buka /luckydraw
4. Pilih hadiah yang akan diundi
5. Klik "PUTAR!"
6. Tunggu animasi selesai
7. Pemenang ditampilkan
8. Klik "PUTAR!" lagi untuk pemenang berikutnya
```

### 11. Pengambilan Hadiah Lucky Draw

```
1. Pemenang datang ke booth souvenir
2. Admin buka /souvenir
3. Input ID/Nama pemenang
4. Di bagian "Hadiah Lucky Draw", klik "Ambil Hadiah"
5. Status berubah menjadi "Sudah Diambil"
```

---

## Real-time Updates

### Cara Kerja

Aplikasi menggunakan **Server-Sent Events (SSE)** untuk real-time updates:

```
Frontend ←───────── SSE Stream ←───────── Backend
         │                                    │
         │  Event: checkin                    │
         │  Event: souvenir_given             │
         │  Event: prize_draw                 │
         └────────────────────────────────────┘
```

### Event Types

| Event | Trigger | Halaman yang Update |
|-------|---------|---------------------|
| `checkin` | Tamu check-in | Dashboard, Statistics, Show |
| `uncheckin` | Batalkan check-in | Dashboard, Statistics, Show |
| `guest-update` | Tamu ditambah/edit/hapus | Guest List, Dashboard |
| `guest_created_souvenir` | Tamu baru dibuat via souvenir | Statistics |
| `souvenir_given` | Souvenir diberikan | Statistics |
| `souvenir_removed` | Souvenir dibatalkan | Statistics |
| `souvenir_reset` | Reset souvenir | Statistics |
| `prize_draw` | Undian dilakukan | Lucky Draw, Statistics |
| `prize_reset` | Reset undian | Lucky Draw, Statistics |
| `prize_collected` | Hadiah diambil | Statistics |
| `prize_uncollected` | Pembatalan ambil hadiah | Statistics |
| `config` | Konfigurasi berubah | All pages with SSE |
| `preview` | Preview mode | All pages with SSE |

---

## Multi-Admin Support

### Cara Kerja

Sistem mendukung **banyak admin** yang bekerja bersamaan di device berbeda:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin 1 │     │  Admin 2 │     │  Admin 3 │
│ (Laptop) │     │ (Tablet) │     │ (Phone)  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   Backend    │
              │   Server     │
              └──────┬───────┘
                     │
           ┌─────────┴─────────┐
           │                   │
           ▼                   ▼
    ┌────────────┐      ┌────────────┐
    │  Database  │      │ SSE Stream │
    │ (Shared)   │      │ (Broadcast)│
    └────────────┘      └────────────┘
```

### Fitur Multi-Admin

1. **Concurrent Access** - Banyak admin bisa login bersamaan
2. **Real-time Sync** - Perubahan langsung terlihat di semua device
3. **No Conflict** - Database transaction mencegah race condition
4. **Audit Trail** - Setiap aksi tercatat siapa yang melakukan

### Tips Penggunaan Multi-Admin

```
✅ RECOMMENDED:
- Assign area berbeda untuk tiap admin (check-in, souvenir, lucky draw)
- Gunakan device yang berbeda untuk tiap fungsi
- Monitor di Statistics untuk overview real-time

⚠️ PERHATIAN:
- Jangan edit tamu yang sama bersamaan
- Koordinasi saat menjalankan lucky draw
- Cek Statistics untuk status terkini
```

---

## API Endpoints

### Public Endpoints (No Auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/config/event` | Get event configuration |
| GET | `/api/public/guests/search` | Search guests by ID/name |
| POST | `/api/public/guests/checkin` | Check-in by guest ID |
| POST | `/api/public/guests/checkin-qr` | Check-in by QR code |
| POST | `/api/public/guests/create-checkin` | Create guest & check-in |
| GET | `/api/public/guests/history` | Get recent check-ins |
| GET | `/api/public/stream` | SSE stream for real-time |

### Protected Endpoints (Require Auth)

#### Guests
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/guests` | List all guests |
| POST | `/api/guests` | Create guest |
| GET | `/api/guests/:id` | Get guest by ID |
| PATCH | `/api/guests/:id` | Update guest |
| DELETE | `/api/guests/:id` | Delete guest |
| POST | `/api/guests/:id/checkin` | Check-in guest |
| POST | `/api/guests/:id/uncheckin` | Uncheck guest |
| GET | `/api/guests/stats` | Get guest statistics |
| GET | `/api/guests/stats/company` | Get company statistics |

#### Souvenirs
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/souvenirs` | List all souvenirs |
| POST | `/api/souvenirs` | Create souvenir |
| PUT | `/api/souvenirs/:id` | Update souvenir |
| DELETE | `/api/souvenirs/:id` | Delete souvenir |
| GET | `/api/souvenirs/stats` | Get souvenir statistics |
| POST | `/api/souvenirs/give` | Give souvenir to guest |
| POST | `/api/souvenirs/give-create` | Create guest & give souvenir |
| DELETE | `/api/souvenirs/take/:guestId/:souvenirId` | Remove souvenir take |
| POST | `/api/souvenirs/:id/reset` | Reset souvenir takes |

#### Prizes
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/prizes` | List all prizes |
| POST | `/api/prizes` | Create prize |
| PUT | `/api/prizes/:id` | Update prize |
| DELETE | `/api/prizes/:id` | Delete prize |
| GET | `/api/prizes/stats` | Get prize statistics |
| POST | `/api/prizes/:id/draw` | Draw random winner |
| POST | `/api/prizes/:id/reset` | Reset prize winners |

#### Prize Collection
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/souvenirs/prizes/winners` | List all winners |
| GET | `/api/souvenirs/prizes/uncollected` | List uncollected prizes |
| GET | `/api/souvenirs/prizes/guest/:id` | Get guest's prizes |
| POST | `/api/souvenirs/prizes/collect` | Mark prize collected |
| DELETE | `/api/souvenirs/prizes/collect/:id` | Unmark collection |

#### Events
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/events/active` | Get active event |
| PUT | `/api/events/active` | Update active event |

#### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login admin |
| GET | `/api/auth/users` | List admin users |
| POST | `/api/auth/users` | Create admin user |
| DELETE | `/api/auth/users/:id` | Delete admin user |

---

## Instalasi & Konfigurasi

### Requirements

- Node.js 18+
- PostgreSQL 14+
- npm atau yarn

### Setup Backend

```bash
cd apps/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan database credentials

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

### Setup Frontend

```bash
cd apps/frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit API URL jika perlu

# Start development server
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/guestregistry"
JWT_SECRET="your-secret-key"
PORT=3001
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Troubleshooting

### Kamera QR Scanner Tidak Berfungsi

**Masalah:** Kamera tidak bisa diakses untuk scan QR

**Solusi:**
1. Pastikan menggunakan HTTPS atau localhost
2. Untuk Chrome, buka `chrome://flags`
3. Cari "Insecure origins treated as secure"
4. Tambahkan URL aplikasi
5. Restart browser

### Real-time Tidak Update

**Masalah:** Data tidak update otomatis

**Solusi:**
1. Cek koneksi SSE di console browser
2. Pastikan backend berjalan
3. Cek firewall/proxy tidak block SSE
4. Refresh halaman dan cek "Realtime" indicator

### Login Gagal

**Masalah:** Tidak bisa login admin

**Solusi:**
1. Cek username dan password
2. Pastikan backend berjalan
3. Cek database connection
4. Reset password jika perlu

### Import CSV Gagal

**Masalah:** Error saat import CSV

**Solusi:**
1. Cek format CSV (harus ada header)
2. Pastikan encoding UTF-8
3. Cek kolom wajib: guestId, name, tableLocation
4. Hapus karakter special

---

## Changelog

### v1.0.0 (Current)
- Initial release
- Guest check-in dengan QR & manual
- Lucky draw system
- Souvenir distribution
- Statistics dashboard
- Multi-admin support
- Auto-create guest feature
- Real-time updates via SSE

---

## Credits

Developed with ❤️ using:
- Next.js
- NestJS
- Prisma
- TailwindCSS
- Lucide Icons

---

*Dokumentasi ini terakhir diperbarui pada November 2025*
