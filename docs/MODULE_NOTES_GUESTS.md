# Modul: Guests

- CRUD, search/filter/pagination.
- Check-in: set `checked_in = true` dan `checked_in_at` now.
- Import CSV: minimal kolom `guest_id,name,table_location` (+ optional fields).
- Export CSV: semua kolom standar.
- Upload foto tamu (opsional) → tersaji via `/api/uploads/photos/...`.

## Update 2025-11-14
- Perbaikan upload foto pada Create/Update (frontend Edit menampilkan preview dan mengirim FormData `photo`).
- Normalisasi URL gambar di frontend dengan helper `toApiUrl()` agar path `/api/uploads/...` merujuk ke host backend.
- Penambahan kolom di halaman list tamu: Foto (thumbnail), Perusahaan, Catatan, Waktu Check-in.
- Penambahan Quick Add Guest di `/admin/dashboard` untuk input cepat (guestId, name, tableLocation, company, photo).

### Halaman Check-in Publik (`/checkin`)
- Pencarian tamu (guest_id/nama) → tombol "Check-in" → menandai tamu sebagai hadir dan menampilkan layar konfirmasi besar (foto + data lengkap).
- History check-in (10 terakhir) ter-update real-time via SSE.
- Tampilan latar mengikuti konfigurasi Event (logo, background image/video, overlay opacity) dari `/admin/settings/event`.

### Portal Actions (Admin) di `/admin/dashboard`
- Tombol Check-in Publik (by Guest ID) untuk trigger endpoint publik.
- Tombol Admin Check-in dan Uncheck-in (by Guest ID) yang memanggil endpoint admin.
- Statistik (Total/Sudah/Belum) auto-refresh via SSE saat ada check-in/uncheck-in.

## Update 2025-11-16
- Default `GET /api/public/guests/history` adalah `limit=20` jika parameter tidak diberikan (koreksi dari catatan sebelumnya yang menyebut 10).
- Real-time notifikasi untuk `checkin`/`uncheckin` dipublikasikan via SSE `/api/public/stream` dan digunakan oleh UI admin dan publik.

## Update 2025-11-16 (CSV Columns)
- Import CSV: header yang digunakan kini berupa `guest_id,name,table_location,company,notes`.
  - Kolom wajib: `guest_id`, `name`, `table_location`.
  - Kolom opsional: `company`, `notes`.
  - Kolom lain akan diabaikan.
- Export CSV: hanya berisi kolom `guest_id,name,table_location,company,notes`.

## Update 2025-11-16 (Admin UI theme)
- Halaman admin Guests diperhalus secara visual:
  - `/admin/guests`:
    - Search bar dan tombol aksi menggunakan gaya brand (radius besar, border halus, fokus dengan ring `brand.primary`).
    - Tabel tamu berada di dalam kartu dengan background terang, border lembut, dan shadow halus.
    - Status check-in ditampilkan sebagai badge (chip) dengan warna berbeda untuk "Checked-in" vs "Belum".
  - `/admin/guests/new` dan `/admin/guests/[id]`:
    - Form tamu ditampilkan sebagai kartu terpusat dengan label teks kecil, input konsisten, dan tombol utama/sekunder yang jelas.
    - Upload + preview foto menggunakan gaya tombol dan border yang sama dengan komponen lain.
- Perubahan hanya pada tampilan (frontend). Perilaku CRUD, import/export CSV, dan alur check-in tetap sama dengan sebelumnya.

## Update 2025-11-17 (Export Lengkap)
- Backend menambahkan endpoint `GET /api/guests/export/full` (auth) untuk ekspor seluruh kolom tamu: `id,queueNumber,guestId,name,photoUrl,tableLocation,company,notes,checkedIn,checkedInAt,createdAt,updatedAt,eventId`.
- Frontend menambahkan tombol "Export Event" pada halaman `/admin/guests` (bagian atas dan bawah tabel), berdampingan dengan "Export CSV" (ringkas).
- Tombol Export di halaman Event Settings dihapus agar alur konsisten.

## Update 2025-11-18 (Glassmorphism & Public Check-in UI)
- Halaman admin Guests (`/admin/guests`):
  - Tabel tamu berada di dalam kartu bertema glass gelap dengan border dan blur; teks utama menggunakan putih/putih-70 agar tetap terbaca di atas background event.
  - Kolom Search menggunakan input terang dengan teks gelap sehingga input tidak menyatu dengan warna kolom/background.
- Halaman form tamu (`/admin/guests/new` dan `/admin/guests/[id]`):
  - Form dibungkus dalam kartu glass; label menggunakan teks putih/80; komponen Input/Textarea/Button memakai varian glass sehingga tampilan konsisten dengan tema baru.
- Halaman check-in publik (`/checkin`):
  - Pencarian menggunakan satu field (Guest ID atau Nama) dengan gaya glass (panel gelap, teks putih).
  - Daftar hasil dan riwayat check-in terbaru ditampilkan dalam panel glass dengan teks putih.
  - Popup konfirmasi check-in berupa overlay full-screen glass gelap yang mengikuti konfigurasi background & overlay event; seluruh teks di dalam popup dibuat putih agar kontras.
  - Kontrol manual background/config/overlay di popup dihapus; background popup mengikuti konfigurasi Event Settings dan preview SSE.

