# Desain Database (Ringkas)

Entitas utama: `AdminUser`, `Event`, `Guest` (+ opsional `AuditLog`).

- AdminUser: kredensial admin (username unik, password hashed).
- Event: konfigurasi event & branding (logo, background image/video, overlay, checkinPopupTimeoutMs, isActive).
- Guest: data tamu terkait satu event (guest_id unik per event, pencarian by name/guest_id).
- AuditLog (opsional): mencatat aktivitas admin.

Prisma schema lengkap ada di `apps/backend/prisma/schema.prisma`.
