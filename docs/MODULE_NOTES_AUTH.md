# Modul: Auth

- Login admin (username + password hashed) → JWT 12 jam.
- Guard: `JwtAuthGuard` untuk proteksi endpoint admin.
- Penyimpanan token di frontend pada localStorage (sederhana, dapat ditingkatkan ke cookies httpOnly).

## URL Terkait
- Halaman login admin: `/admin/login`
- Endpoint login API: `POST /api/auth/login` → body `{ username, password }` → response `{ access_token }`

## Catatan
- JWT bersifat stateless, sehingga multi-session admin (login di banyak device sekaligus) didukung.
- Token disimpan di `localStorage` dan dikirim sebagai header `Authorization: Bearer <token>` untuk endpoint admin.

## Update 2025-11-16
- Rencana keamanan:
  - Tambahkan rate limiting pada endpoint login untuk mitigasi brute-force.
  - Pertimbangkan migrasi penyimpanan token ke cookies httpOnly + strategi refresh/rotation.
  - Audit durasi JWT (12 jam) dan kebutuhan logout global/blacklist bila diperlukan.
