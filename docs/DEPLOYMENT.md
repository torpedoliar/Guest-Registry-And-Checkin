# Deployment Guide

Panduan ini menjelaskan cara men-deploy aplikasi Guest Registration System ke komputer lain (Production Environment), khususnya untuk sistem operasi **Windows**.

## 1. Persiapan Lingkungan (Prerequisites)

Sebelum memindahkan aplikasi, pastikan komputer target memiliki software berikut:

1.  **Node.js (v18 LTS atau lebih baru)**
    - Download & Install dari [nodejs.org](https://nodejs.org/).
2.  **PostgreSQL (v14 atau lebih baru)**
    - Download & Install dari [postgresql.org](https://www.postgresql.org/).
    - Ingat password user `postgres` yang Anda buat saat instalasi.
3.  **Git (Opsional)**
    - Jika ingin clone langsung dari repository. Jika tidak, Anda bisa copy-paste folder project.

## 2. Setup Database

1.  Buka **pgAdmin** atau terminal psql.
2.  Buat database baru bernama `guest_registry` (atau nama lain sesuai keinginan).
3.  Pastikan service PostgreSQL berjalan.

## 3. Transfer Kode Aplikasi

### Opsi A: Git Clone
```bash
git clone <repository_url>
cd guest-registration
```

### Opsi B: Copy Folder
1.  Copy seluruh folder project dari komputer lama.
2.  **PENTING**: Hapus folder `node_modules` di `apps/backend` dan `apps/frontend` sebelum copy untuk menghemat waktu/space, lalu install ulang di komputer baru.
3.  Hapus juga folder `.next` (di frontend) dan `dist` (di backend) agar build ulang bersih.

## 4. Instalasi & Konfigurasi Backend

1.  Buka terminal di folder `apps/backend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup Environment Variables:
    - Copy `.env.example` ke `.env`.
    - Edit `.env` dan sesuaikan `DATABASE_URL` dengan password database komputer baru.
    ```env
    DATABASE_URL="postgresql://postgres:PASSWORD_BARU@localhost:5432/guest_registry?schema=public"
    JWT_SECRET="rahasia_yang_aman"
    CORS_ORIGIN="http://localhost:3000"
    ```
4.  Setup Database Schema:
    ```bash
    npm run prisma:migrate
    npm run seed
    ```
5.  Build Aplikasi:
    ```bash
    npm run build
    ```

## 5. Instalasi & Konfigurasi Frontend

1.  Buka terminal di folder `apps/frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup Environment Variables:
    - Buat file `.env` (atau `.env.production`).
    - Pastikan URL backend benar.
    ```env
    BACKEND_ORIGIN="http://localhost:4000"
    ```
4.  Build Aplikasi:
    ```bash
    npm run build
    ```

## 6. Menjalankan Aplikasi (Production Mode)

Untuk performa terbaik, jangan gunakan `npm run dev`. Gunakan hasil build.

### Backend
Di terminal `apps/backend`:
```bash
npm run start:prod
```
*Backend akan berjalan di port 4000.*

### Frontend
Di terminal `apps/frontend`:
```bash
npm start
```
*Frontend akan berjalan di port 3000.*

## 7. (Opsional) Menggunakan PM2 untuk Auto-Start

Agar aplikasi berjalan otomatis di background dan restart jika crash, gunakan **PM2**.

1.  Install PM2 secara global:
    ```bash
    npm install -g pm2
    ```
2.  Jalankan Backend:
    ```bash
    cd apps/backend
    pm2 start dist/main.js --name "guest-backend"
    ```
3.  Jalankan Frontend:
    ```bash
    cd apps/frontend
    pm2 start npm --name "guest-frontend" -- start
    ```
4.  Cek status:
    ```bash
    pm2 list
    ```
5.  Simpan konfigurasi (agar jalan saat restart, butuh setup tambahan di Windows, cek dokumentasi pm2-installer).

## 8. Akses Jaringan (Firewall)

Jika aplikasi ini akan diakses dari komputer lain dalam satu jaringan (LAN):

1.  Buka **Windows Defender Firewall**.
2.  Pilih **Advanced Settings** -> **Inbound Rules** -> **New Rule**.
3.  Pilih **Port** -> **TCP**.
4.  Masukkan port: `3000, 4000`.
5.  Pilih **Allow the connection**.
6.  Beri nama (misal: "Guest App Web").

Sekarang komputer lain bisa mengakses via `http://<IP_KOMPUTER_BARU>:3000`.

## 9. Migrasi Database (Jika Menggunakan Docker)

Jika database PostgreSQL Anda berjalan di dalam Docker container, ikuti langkah ini untuk memindahkannya:

### A. Backup (Di Komputer Lama)

1.  Cek nama container database Anda:
    ```bash
    docker ps
    ```
    *Misal nama container adalah `guest-db-1`.*

2.  Lakukan dump database ke file SQL:
    ```bash
    docker exec -t guest-db-1 pg_dump -U postgres -d guest_registry > backup_guest_registry.sql
    ```
    *Ganti `guest-db-1` dengan nama container Anda, dan `guest_registry` dengan nama database Anda.*

3.  Copy file `backup_guest_registry.sql` ke komputer baru.

### B. Restore (Di Komputer Baru)

1.  Pastikan Docker container PostgreSQL di komputer baru sudah berjalan dan database kosong sudah dibuat.

2.  Copy file backup ke dalam container (opsional, atau bisa langsung pipe):
    ```bash
    cat backup_guest_registry.sql | docker exec -i nama_container_baru psql -U postgres -d guest_registry
    ```

    **ATAU** cara manual:
    1. Copy file ke container: `docker cp backup_guest_registry.sql nama_container_baru:/tmp/`
    2. Masuk ke container: `docker exec -it nama_container_baru bash`
    3. Restore: `psql -U postgres -d guest_registry < /tmp/backup_guest_registry.sql`

3.  Selesai! Data Anda sudah berpindah.
