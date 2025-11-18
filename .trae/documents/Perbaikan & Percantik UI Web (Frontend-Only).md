## Tujuan
- Mempercantik dan menyelaraskan UI seluruh halaman tanpa mengubah logic backend.
- Meningkatkan konsistensi, aksesibilitas, responsivitas, dan rasa brand menggunakan Tailwind yang sudah ada.

## Ruang Lingkup
- Halaman: `/` root, `/about`, `/checkin`, `/show`, `/admin/login`, `/admin/dashboard`, `/admin/guests`, `/admin/guests/new`, `/admin/guests/[id]`, `/admin/settings/event`.
- Komponen shared: `TopNav`, `ThemeBackground`, serta lib UI baru untuk elemen dasar.
- Styles global: `app/globals.css`, `tailwind.config.ts` (tanpa mengubah token warna kecuali perlu minor extend UI).

## Pendekatan Teknis
- Tetap di App Router Next.js + Tailwind; tidak menambah dependensi eksternal.
- Buat mini design system di `apps/frontend/components/ui/*` (berbasis Tailwind) agar styling konsisten:
  1. Button, Input, Textarea, Select, Label, Badge
  2. Card, Modal/Dialog, Table (wrapper), Pagination, Alert (success/error/empty)
  3. FormRow dan FormSection untuk grid form yang rapi
- Terapkan komponen UI baru secara bertahap pada tiap halaman, mempertahankan API call yang ada.
- Perbaiki semantic HTML (nav/main/section), fokus ring, states disabled, dan responsivitas.

## Perubahan Utama per Bagian
### Layout & Global
- `app/layout.tsx`: tambah `main` wrapper dengan container responsif, jaga `ThemeBackground` dan `TopNav` tetap ada.
- `app/globals.css`: tambah util kelas kecil (spacing/typography helper), perbaiki kontras default, pertahankan `@tailwind` dan kelas `text-shadow`.
- `components/TopNav.tsx`:
  - Ubah jadi `<nav>` semantik; tambah area brand (logo jika tersedia dari config via `ThemeBackground` tetap terpisah).
  - Perbaiki active/hover states, spacing, responsivitas (stack di mobile), dan tombol logout agar serasi.
- `components/ThemeBackground.tsx`: hanya polish minor (z-index, overlay layering) tanpa mengubah alur SSE.

### Admin Login (`app/admin/login/page.tsx`)
- Gunakan `Card`, `Input`, `Button`, dan `Alert` untuk error.
- Tambah heading dan deskripsi singkat; tingkatkan kontras; center vertikal yang rapi; responsif.

### Dashboard (`app/admin/dashboard/page.tsx`)
- Gunakan `Card` untuk statistik dengan ikon/warna lembut; grid responsif.
- Rapikan "Portal Actions" (chip/aksi cepat) dengan `Button` dan `Badge`.
- "Quick Add Guest": grid form konsisten via `FormRow`, tombol webcam jadi sekunder; preview foto lebih rapih.

### Guests List (`app/admin/guests/page.tsx`)
- Table wrapper dengan header sticky, zebra/hover states halus, kolom right-align untuk aksi.
- Tambah `EmptyState` saat tidak ada data; `Skeleton` singkat saat loading.
- Pagination komponen; tombol aksi konsisten (Edit/Check-in/Delete) dengan ukuran seragam.
- Import/Export: tombol terstruktur; file input diberi label tombol upload.

### New Guest (`app/admin/guests/new/page.tsx`) & Edit Guest (`app/admin/guests/[id]/page.tsx`)
- Terapkan `FormSection` (Info Dasar, Foto, Status) dengan `Input/Select/Checkbox` konsisten.
- Preview foto dalam `Card` kecil; tombol webcam serasi; tombol utama/sekunder konsisten.

### Event Settings (`app/admin/settings/event/page.tsx`)
- Kelompokkan form: Profil Event, Background & Overlay, Advanced.
- Radio `NONE/IMAGE/VIDEO` ditata jadi segmented control; slider overlay dengan nilai terformat.
- Status upload (logo/background) lebih jelas; `Alert` untuk pesan/error.
- Live preview toggle diposisikan dan diberi tooltip singkat.

### Halaman Publik
- Check-in (`app/checkin/page.tsx`):
  - Input besar (ID/Nama) dengan CTA “Cari & Check-in”, error inline `Alert`.
  - Kartu hasil lebih rapih: foto, identitas, aksi “Pilih” dan “Check-in”.
  - Popup konfirmasi: typografi tegas, kontrol overlay di pojok kanan, tombol batal check-in (admin) konsisten.
- Display (`app/show/page.tsx`):
  - Brand header lebih rapih; kartu display tamu dengan hierarki tipografi jelas.
  - Transisi muncul/hilang lembut (fade/scale) tanpa mengubah SSE.

## Aksesibilitas & Responsivitas
- Focus ring and keyboard navigation per komponen input/aksi.
- Kontras warna mengikuti `brand.*` yang ada; fallback ke Slate/Gray untuk teks muted.
- Mobile-first: stack layout di <md, grid dua/empat kolom di md/lg.

## Verifikasi
- Jalankan dev: frontend `apps/frontend` port `3000`, backend `apps/backend` port `4000` (mengikuti `start-dev.bat`).
- Uji manual seluruh halaman, termasuk SSE preview dan event check-in/uncheck-in.
- Cek Lighthouse dasar (aksesibilitas/kontras) dan audit fokus keyboard.

## Dampak terhadap Backend
- Tidak ada perubahan endpoint, payload, atau SSE; semua perubahan UI murni presentational.

## Estimasi & Urutan Eksekusi
1. Buat komponen UI dasar (`components/ui/*`) dan integrasi di Login.
2. Refactor `TopNav` dan Layout global.
3. Terapkan ke Dashboard dan Guests List (termasuk pagination & empty state).
4. Terapkan ke New/Edit Guest.
5. Perapihan Event Settings.
6. Perapihan Check-in & Display.

## Catatan Keamanan
- Tidak menambahkan lib baru; tidak menyentuh token selain yang sudah dipakai UI.
- Hindari logging sensitif; tidak mengubah rewrite/proxy.

Silakan konfirmasi rencana ini. Setelah disetujui, saya akan mulai menerapkan perubahan UI secara bertahap sesuai urutan di atas, lalu memverifikasi setiap halaman berjalan normal tanpa perubahan backend.