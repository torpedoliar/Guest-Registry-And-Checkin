# All-in-One Docker Deployment

Panduan ini menjelaskan cara menjalankan seluruh aplikasi (Database, Backend, Frontend) hanya dengan satu perintah menggunakan **Docker Compose**. Ini adalah cara termudah untuk memindahkan aplikasi ke komputer baru.

## 1. Prasyarat

- Install **Docker Desktop** di komputer baru.
  - [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

> **CATATAN PENTING**: Anda **TIDAK PERLU** menginstall Node.js, PostgreSQL, atau software lain. Semua sudah tersedia di dalam Docker.

## 2. Cara Menjalankan (Opsi A: Paling Mudah)

1.  Double-click file `deploy-docker.bat` di folder root.
2.  Script akan otomatis:
    - Mengecek apakah Docker berjalan.
    - Membuild dan menjalankan container.
    - Menunggu database siap.
    - Menjalankan migrasi dan seeding data.
    - Membuka browser secara otomatis.

## 3. Cara Menjalankan (Opsi B: Manual)

1.  Copy seluruh folder project `Registrasi Tamu` ke komputer baru.
2.  Buka terminal (CMD/PowerShell) di folder root project.
3.  Jalankan perintah:

    ```bash
    docker-compose up -d --build
    ```

    *Perintah ini akan:*
    - *Mendownload image PostgreSQL.*
    - *Membuild image Backend dan Frontend dari source code.*
    - *Menjalankan ketiganya dalam jaringan virtual yang saling terhubung.*

4.  Tunggu beberapa saat hingga semua container berjalan (status `Running` di Docker Desktop).

## 3. Setup Database Pertama Kali

Karena database berjalan di dalam container baru, kita perlu melakukan migrasi schema dan seeding data awal.

1.  Jalankan perintah ini di terminal:

    ```bash
    docker exec -it guest-backend npm run prisma:migrate
    docker exec -it guest-backend npm run seed
    ```

## 4. Akses Aplikasi

- **Frontend**: Buka `http://localhost:3000`
- **Backend**: Berjalan di `http://localhost:4000`
- **Database**: Port `5432` (User: `postgres`, Pass: `password`, DB: `guest_registry`)

## 5. Menghentikan Aplikasi

```bash
docker-compose down
```

## 6. Migrasi Data Lama (Opsional)

Jika Anda ingin memindahkan data dari komputer lama:

1.  Lakukan Backup di komputer lama (lihat `docs/DEPLOYMENT.md`).
2.  Copy file `.sql` ke folder root project di komputer baru.
3.  Restore ke dalam container database baru:

    ```bash
    cat backup.sql | docker exec -i guest-db psql -U postgres -d guest_registry
    ```
