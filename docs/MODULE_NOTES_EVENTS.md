# Modul: Events & Branding

- Event aktif tunggal (flag `isActive = true`).
- Branding: `logoUrl`, background `image`/`video` + overlay opacity.
- Endpoint publik `/config/event` untuk frontend show.
- Upload logo/background via endpoint admin.

## Update 2025-11-14
- Upload background kini mendeteksi tipe file:
  - Jika mimetype `video/*` → set `backgroundType=VIDEO`, `backgroundVideoUrl` diisi, `backgroundImageUrl` dikosongkan.
  - Selain itu → set `backgroundType=IMAGE`, `backgroundImageUrl` diisi, `backgroundVideoUrl` dikosongkan.
- Preview di admin settings menggunakan normalisasi URL (`toApiUrl`) dan menampilkan preview video jika tipe VIDEO.
- Branding (logo + background + overlay) sekarang digunakan secara global melalui komponen `ThemeBackground` di layout, sehingga seluruh halaman mengikuti tema event.
- Halaman `/show` dan `/checkin` mengelola latar sendiri, namun tetap menerima pembaruan real-time tema melalui SSE event `config`.
- Real-time: setiap perubahan konfigurasi event (PUT/UPLOAD/PURGE) akan memancarkan event `config` pada SSE `/public/stream` sehingga UI memperbarui tema tanpa refresh.
- Cache: `GET /config/event` diberi `Cache-Control: public, max-age=30`; uploads disajikan dengan cache panjang (ETag, immutable) di `/api/uploads`.

## Update 2025-11-16
- Dokumentasikan endpoint `POST /api/events/purge` (Admin) untuk purge tamu aktif dan opsi `resetBranding`. Pastikan tercermin di `docs/API.md`.
- Konfirmasi: setiap PUT/UPLOAD/PURGE memancarkan SSE event `config` agar tema sinkron di UI secara real-time.
- Rencana keamanan: tambahkan validasi mimetype/ukuran + whitelist ekstensi pada upload `logo`/`background`.
- Konfigurasi baru: `checkinPopupTimeoutMs` (ms) untuk mengatur durasi auto-close popup konfirmasi check-in pada `/checkin` dan `/show`.

## Update 2025-11-16 (Event Settings UI theme)
- Halaman `/admin/settings/event` kini mengikuti tema UI admin berbasis Tailwind tokens:
  - Kartu utama: `rounded-xl`, `border-brand-border`, `bg-brand-surface`, `shadow-soft`.
  - Input teks (nama, tanggal, lokasi): radius besar + ring fokus `brand.primary`.
  - Slider overlay/timeout dikelompokkan dalam section `surfaceMuted` untuk hierarki visual.
  - Bagian upload logo/background menampilkan preview (gambar/video) di dalam blok yang konsisten.
  - Tombol aksi: primary (Save), secondary (Purge Guests), destructive (Purge + Reset Branding), serta kontrol Live Preview/Stop Preview.
- Perubahan hanya pada tampilan (frontend). Endpoint dan logika backend tidak berubah.

## Update 2025-11-18 (Glassmorphism UI)
- Konfigurasi event (logo, background image/video, overlay, `checkinPopupTimeoutMs`) kini terintegrasi dengan tema UI glassmorphism di halaman publik:
  - `/checkin`: panel pencarian, hasil, riwayat, dan popup konfirmasi menggunakan panel glass gelap di atas background event.
  - `/show`: kartu popup tamu menggunakan card glass gelap dengan teks putih di atas background event.
- Tidak ada perubahan kontrak API; seluruh perubahan bersifat frontend (tema/visual) dan tetap mengonsumsi endpoint `config`, `preview`, dan SSE `config`/`preview`/`checkin`.
