# Version History & Changelog

## Event Management System (formerly Guest Registry)

Dokumen ini mencatat riwayat pengembangan aplikasi dari awal hingga versi terkini.

---

## Timeline Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DEVELOPMENT TIMELINE                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                           │
│  v0.1.0       v0.2.0       v0.3.0       v0.4.0       v1.0.0       v1.1.0       v1.2.0       v1.3.0       │
│    │            │            │            │            │            │            │            │          │
│    ▼            ▼            ▼            ▼            ▼            ▼            ▼            ▼          │
│  ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        │
│  │ ● │────────│ ● │────────│ ● │────────│ ● │────────│ ● │────────│ ● │────────│ ● │────────│ ● │        │
│  └───┘        └───┘        └───┘        └───┘        └───┘        └───┘        └───┘        └───┘        │
│    │            │            │            │            │            │            │            │          │
│  Project     Guest        Lucky       Souvenir     Final       Security      Email        Rebrand       │
│  Setup       Mgmt         Draw        System       Release     & Perf        & UX         & Track       │
│                                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Version Details

### v1.3.0 - Event Management System Rebrand & Guest Tracking (December 2025)
**Status:** ✅ Current Version

#### Rebranding
- 🎨 **Nama Aplikasi Baru**
  - Diubah dari "Guest Registry" menjadi "Event Management System"
  - Update di semua halaman: Login, Dashboard, TopNav, About, PDF Reports

#### Guest Registration Source Tracking
- ✨ **Field `registrationSource` Baru**
  - Tracking sumber registrasi tamu dengan 3 nilai:
    - `MANUAL` - Tamu ditambahkan via admin panel (default)
    - `IMPORT` - Tamu diimport dari file Excel
    - `WALKIN` - Tamu dibuat otomatis dari halaman check-in
  - Badge oranye "Walk-in" di daftar tamu admin
  - Warna berbeda per sumber: Oranye (Walk-in), Biru (Import), Abu-abu (Manual)

- 📊 **Export dengan Registration Source**
  - Export Excel Tamu: kolom `registration_source`
  - Export Laporan Event: kolom `Sumber Registrasi` dengan label lengkap
  - Export PDF: kolom `Sumber` dengan warna berbeda per tipe

#### Email Improvements
- 🎨 **Template Email Baru**
  - Desain modern dan profesional dengan table-based layout
  - Header gradient ungu dengan nama event
  - Kartu tamu dengan warna brand
  - QR Code dalam box dengan dashed border
  - Footer yang rapi
  - Kompatibel dengan semua email client (Outlook, Gmail, dll)

- 🔧 **QR Code Fix**
  - QR Code dikirim sebagai embedded attachment dengan Content-ID (cid:qrcode)
  - Tidak lagi menggunakan base64 inline yang diblok banyak email client
  - QR Code sekarang tampil dengan benar di semua email client

- 🔧 **HTML Template Editor Fix**
  - Perbaikan warna teks di Textarea (putih dengan background semi-transparan)
  - Teks sekarang terlihat jelas di dark theme

#### Database Changes
```sql
-- New enum
enum RegistrationSource {
  MANUAL
  IMPORT
  WALKIN
}

-- Guest model update
+ registrationSource RegistrationSource @default(MANUAL)
```

#### Technical Changes
```
~ App name changed: "Guest Registry" → "Event Management System"
+ RegistrationSource enum in Prisma schema
+ registrationSource field in Guest model
+ SOURCE_CONFIG in frontend for badge styling
+ Walk-in badge in guest list (orange color)
+ formatSource() helper for Excel export
+ formatSourcePdf() helper for PDF export
+ Sumber column in PDF table
+ registration_source column in Excel exports
+ Email template redesign (table-based, modern)
+ QR Code as CID attachment (not base64)
+ generateQRCodeBuffer() for email attachment
+ Textarea component color fix for dark theme
```

---

### v1.2.0 - Email Integration & UX Improvements (December 2025)
**Status:** ✅ Previous Stable

#### Email Integration
- ✨ **Email Column in Guest Data**
  - Kolom email di form tambah/edit tamu
  - Import XLSX mendukung kolom email (email, Email, EMAIL, E-mail)
  - Export XLSX menyertakan kolom email
  - Export PDF menyertakan kolom Email dalam tabel
  - Tampilan email dengan icon di halaman daftar tamu

- ✨ **Send Email Button**
  - Tombol kirim email di action column (icon pesawat)
  - Hanya muncul jika tamu memiliki alamat email
  - Link ke Email Settings di halaman pengaturan event

#### User Experience
- 🔧 **User-Friendly Error Messages**
  - Fungsi `parseErrorMessage()` untuk translasi error ke bahasa Indonesia
  - 12+ mapping error messages (Event not found, Invalid credentials, dll)
  - Implementasi di 11 file frontend untuk konsistensi
  - Error JSON raw tidak lagi ditampilkan ke user

- 🔧 **NestJS Route Fix**
  - Perbaikan route conflict `PUT /events/active` vs `PUT /events/:id`
  - Route spesifik dideklarasikan sebelum route dengan parameter
  - Mengatasi error "Event not found" saat upload background/logo

#### Technical Changes
```
+ parseErrorMessage() function in lib/api.ts
+ Email field in Guest create/edit forms
+ Email column in XLSX import/export
+ Email column in PDF export
+ Send Email button in guest list
+ Route ordering fix in events.controller.ts
+ Error handling updates in 11 frontend files:
  - app/admin/events/page.tsx
  - app/admin/events/calendar/page.tsx
  - app/admin/prizes/page.tsx
  - app/admin/souvenirs/page.tsx
  - app/admin/guests/new/page.tsx
  - app/admin/guests/[id]/page.tsx
  - app/admin/dashboard/page.tsx
  - app/checkin/page.tsx
  - app/souvenir/page.tsx
  - app/show/page.tsx
  - lib/hooks/use-guests.ts
```

---

### v1.1.0 - Performance, Security & UI Improvements (December 2025)
**Status:** ✅ Previous Stable

#### Event Management
- ✨ **Kanban View untuk Events**
  - Toggle antara List View dan Kanban View
  - 3 kolom: Akan Datang, Sedang Aktif, Selesai
  - Drag & drop untuk aktivasi event
  - Visual feedback saat drag
  - Quick actions di setiap card (edit, clone, delete, activate)
  - Event categorization berdasarkan tanggal

#### Security & Performance
- 🔒 **Rate Limiting**
  - Global rate limiter dengan 3 tier protection
  - Short: 10 requests/second
  - Medium: 50 requests/10 seconds
  - Long: 200 requests/minute
  - Menggunakan `@nestjs/throttler`

- 📝 **Centralized Logging System**
  - Winston logger dengan daily rotate files
  - Log levels: error, warn, info, debug
  - Admin endpoint untuk view logs
  - File retention: 14 hari (app), 30 hari (error)

- 📊 **Comprehensive Audit Trail**
  - Tracking semua aksi admin (login, CRUD, check-in, dll)
  - Audit log viewer di admin dashboard
  - Filter by action, user, date range
  - Statistics per action type

- 🗄️ **Database Optimizations**
  - Connection pooling configuration
  - Query optimization untuk large datasets
  - Cursor-based pagination (GET /guests/cursor)
  - Improved health check dengan DB stats

#### New Features
- ✨ **Email Notification System**
  - Kirim undangan email ke tamu dengan QR code
  - Konfigurasi SMTP (Gmail, SendGrid, dll)
  - Custom email template dengan placeholder
  - Bulk email sending ke multiple tamu
  - Email log tracking (sent/failed)
  - Custom message dari Administrator
  - Informasi lengkap: nama event, tanggal, waktu, lokasi, QR code

- ✨ **System Monitor Dashboard** (`/admin/system`)
  - Real-time health status (CPU, Memory, DB)
  - Log viewer dengan filter dan search
  - Audit trail viewer
  - Uptime dan version info

- ✨ **Professional PDF Reports**
  - Guest report dengan statistik lengkap
  - Attendance summary per kategori/company
  - Styled table dengan pagination
  - Endpoint: `/reports/guests/pdf`

- ✨ **Enhanced Error Handling**
  - React Error Boundary di root layout
  - Graceful error recovery dengan retry
  - User-friendly error messages
  - Collapsible error details untuk debugging

- ✨ **Loading States Improvement**
  - Skeleton components untuk semua halaman
  - SkeletonDashboard, SkeletonForm, SkeletonDetail
  - SkeletonChart untuk chart placeholders
  - Consistent loading UX across app

#### Technical Changes
```
+ @nestjs/throttler for rate limiting
+ winston & winston-daily-rotate-file for logging
+ GET  /admin/logs/files - List log files
+ GET  /admin/logs/content - Read log entries
+ GET  /admin/logs/stats - Log statistics
+ GET  /admin/audit - Audit log entries
+ GET  /admin/audit/stats - Audit statistics
+ GET  /admin/audit/actions - Available actions
+ GET  /health - Enhanced health check (DB, memory)
+ GET  /health/live - Kubernetes liveness probe
+ GET  /health/ready - Kubernetes readiness probe
+ GET  /health/db - Database connection stats
+ GET  /guests/cursor - Cursor-based pagination
+ GET  /reports/guests/pdf - PDF report generation
+ GET  /reports/attendance/summary - Attendance stats
+ /admin/system page for system monitoring
+ ErrorBoundary component
+ Enhanced Skeleton components
+ Audit logging on auth (login success/failed)
+ Kanban view for events with drag-drop
+ View toggle (List/Kanban) on events page
```

---

### v1.0.0 - Final Release (November 2025)
**Status:** ✅ Previous Stable

#### New Features
- ✨ **Auto-Create Guest pada Check-in**
  - Setting toggle untuk membuat tamu baru otomatis
  - Jika tamu tidak ditemukan, langsung buat dan check-in
  - Tersimpan di localStorage per device

- ✨ **Auto-Create Guest pada Souvenir**
  - Setting toggle di halaman souvenir
  - Buat tamu baru dan berikan souvenir sekaligus
  - Endpoint baru: `POST /api/souvenirs/give-create`

- ✨ **Statistics Dashboard Enhancement**
  - Chart statistik souvenir (diambil vs tersisa)
  - Chart statistik lucky draw (diundi vs diambil)
  - Real-time updates untuk semua statistik

- ✨ **Complete SSE Real-time**
  - Semua halaman operasional menggunakan SSE
  - Event types lengkap untuk souvenir dan prize
  - Live indicator di setiap halaman

- ✨ **Professional About Page**
  - Redesign dengan UI modern
  - Feature cards, tech stack badges
  - Architecture section

- 📄 **Complete Documentation**
  - `DOCUMENTATION.md` - User guide lengkap
  - `TECHNICAL_BLUEPRINT.md` - Technical architecture
  - `CHANGELOG.md` - Version history

#### Technical Changes
```
+ POST /api/public/guests/create-checkin
+ POST /api/souvenirs/give-create
+ GET /api/souvenirs/stats
+ GET /api/prizes/stats
+ SSE events: souvenir_given, souvenir_removed, prize_collected, etc.
+ Auto-create guest feature on checkin page
+ Auto-create guest feature on souvenir page
+ Statistics page with souvenir & prize charts
+ About page redesign
```

---

### v0.4.0 - Souvenir & Prize Collection System
**Status:** ✅ Completed

#### New Features
- ✨ **Souvenir Check-in Page** (`/souvenir`)
  - Dropdown selector untuk pilih souvenir
  - Search/scan tamu untuk berikan souvenir
  - Auto-give saat single result
  - Manual selection saat multiple results
  - Settings modal untuk konfigurasi

- ✨ **Prize Collection System**
  - Tracking pengambilan hadiah lucky draw
  - Pemenang bisa ambil hadiah di halaman souvenir
  - Status collected/uncollected
  - Admin tracking siapa yang memberikan

- ✨ **Souvenir Inventory Management** (`/admin/souvenirs`)
  - CRUD souvenir
  - Stock tracking
  - Reset functionality

#### Technical Changes
```
+ Souvenir model in database
+ SouvenirTake model for tracking
+ PrizeCollection model
+ SouvenirsController & SouvenirsService
+ /souvenir page with full functionality
+ /admin/souvenirs management page
+ Prize collection endpoints
```

---

### v0.3.0 - Lucky Draw System
**Status:** ✅ Completed

#### New Features
- ✨ **Lucky Draw Page** (`/luckydraw`)
  - Prize selector
  - Slot machine animation
  - Random winner selection
  - Confetti celebration effect
  - Winner display with photo

- ✨ **Prize Management** (`/admin/prizes`)
  - CRUD hadiah
  - Kategori hadiah (HIBURAN/UTAMA)
  - Quantity management
  - Allow multiple wins option
  - Winner list per hadiah
  - Reset winners functionality

- ✨ **Eligible Candidates Logic**
  - Default: hanya tamu yang belum pernah menang
  - Optional: boleh menang lebih dari 1x (per hadiah)
  - Filter hanya tamu yang sudah check-in

#### Technical Changes
```
+ Prize model in database
+ PrizeWinner model
+ PrizesController & PrizesService
+ /luckydraw page with animation
+ /admin/prizes management page
+ SSE events: prize_draw, prize_reset
```

---

### v0.2.0 - Guest Management & Check-in
**Status:** ✅ Completed

#### New Features
- ✨ **Guest Check-in Page** (`/checkin`)
  - Search by Guest ID or Name
  - QR Code scanning (Html5Qrcode)
  - Auto check-in for single result
  - Manual selection for multiple results
  - Confirmation popup
  - Check-in history

- ✨ **Display Board** (`/show`)
  - Event branding display
  - Real-time check-in counter
  - Recent check-ins list
  - Welcome popup for new check-ins
  - Background image/video support

- ✨ **Guest Management** (`/admin/guests`)
  - Guest list with pagination
  - Search & filter
  - Add/Edit/Delete guest
  - Photo upload
  - Import CSV
  - Export CSV
  - Check-in/Uncheck-in controls

- ✨ **Statistics Page** (`/admin/statistics`)
  - Total guests counter
  - Check-in progress
  - Company statistics
  - Pie chart visualization
  - Bar chart per company

- ✨ **Real-time Updates (SSE)**
  - Server-Sent Events implementation
  - Live check-in updates
  - Config change broadcasts
  - SSE Context provider

#### Technical Changes
```
+ Guest model with full fields
+ GuestsController & GuestsService
+ PublicController for public endpoints
+ SSE implementation (sse.ts)
+ /checkin page
+ /show display page
+ /admin/guests with CRUD
+ /admin/statistics with charts
+ Import/Export CSV functionality
+ QR Code scanner integration
```

---

### v0.1.0 - Project Foundation
**Status:** ✅ Completed

#### New Features
- ✨ **Monorepo Setup**
  - Frontend (Next.js 14 with App Router)
  - Backend (NestJS 10)
  - Shared configuration

- ✨ **Database Setup**
  - PostgreSQL configuration
  - Prisma ORM setup
  - Initial schema (Event, User)

- ✨ **Authentication System**
  - JWT-based authentication
  - Login page (`/admin/login`)
  - Auth guard for protected routes
  - User management (`/admin/settings/users`)

- ✨ **Event Configuration** (`/admin/settings/event`)
  - Event name, date, location
  - Logo upload
  - Background image/video
  - Overlay opacity control
  - Live preview

- ✨ **Admin Dashboard** (`/admin/dashboard`)
  - Basic statistics
  - Quick actions
  - Event info display

- ✨ **UI Foundation**
  - TailwindCSS setup
  - Glass morphism design
  - Responsive layout
  - Dark theme
  - Lucide icons

#### Technical Changes
```
+ Next.js 14 project initialization
+ NestJS project initialization
+ Prisma schema setup
+ Event model
+ User model
+ AuthModule with JWT
+ ConfigModule for event settings
+ Basic UI components
+ API proxy configuration (next.config.js)
```

---

## Feature Evolution

### Check-in Feature

```
v0.2.0                    v0.4.0                    v1.0.0
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ Basic       │          │ + Souvenir  │          │ + Auto      │
│ Check-in    │    →     │   at same   │    →     │   Create    │
│ + QR Scan   │          │   station   │          │   Guest     │
└─────────────┘          └─────────────┘          └─────────────┘
```

### Statistics Feature

```
v0.2.0                    v0.4.0                    v1.0.0
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ Guest       │          │ + Company   │          │ + Souvenir  │
│ Stats       │    →     │   Stats     │    →     │ + Prize     │
│ Only        │          │   Chart     │          │   Charts    │
└─────────────┘          └─────────────┘          └─────────────┘
```

### Real-time Feature

```
v0.2.0                    v0.4.0                    v1.0.0
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ checkin     │          │ + prize_draw│          │ + souvenir  │
│ uncheckin   │    →     │ + prize_    │    →     │   events    │
│ config      │          │   reset     │          │ + complete  │
└─────────────┘          └─────────────┘          └─────────────┘
```

---

## Database Schema Evolution

### v0.1.0 - Initial Schema
```sql
Event
User
```

### v0.2.0 - Guest Management
```sql
Event
User
Guest (new)
```

### v0.3.0 - Lucky Draw
```sql
Event
User
Guest
Prize (new)
PrizeWinner (new)
```

### v0.4.0 - Souvenir System
```sql
Event
User
Guest
Prize
PrizeWinner
PrizeCollection (new)
Souvenir (new)
SouvenirTake (new)
```

### v1.0.0 - Final Schema
```sql
Event
├── Guest
│   ├── SouvenirTake
│   └── PrizeWinner
│       └── PrizeCollection
├── Souvenir
│   └── SouvenirTake
├── Prize
│   └── PrizeWinner
│       └── PrizeCollection
└── (linked)

User (standalone)
```

### v1.3.0 - Registration Source Tracking
```sql
+ enum RegistrationSource {
    MANUAL    -- Guest added via admin panel
    IMPORT    -- Guest imported from Excel
    WALKIN    -- Guest auto-created from check-in
  }

Guest
├── + registrationSource RegistrationSource @default(MANUAL)
├── SouvenirTake
└── PrizeWinner
    └── PrizeCollection
```

---

## API Evolution

### v0.1.0
```
POST   /api/auth/login
GET    /api/config/event
PUT    /api/events/active
GET    /api/auth/users
POST   /api/auth/users
DELETE /api/auth/users/:id
```

### v0.2.0
```
+ GET    /api/guests
+ POST   /api/guests
+ GET    /api/guests/:id
+ PATCH  /api/guests/:id
+ DELETE /api/guests/:id
+ POST   /api/guests/:id/checkin
+ POST   /api/guests/:id/uncheckin
+ GET    /api/guests/stats
+ GET    /api/guests/stats/company
+ GET    /api/public/guests/search
+ POST   /api/public/guests/checkin
+ POST   /api/public/guests/checkin-qr
+ GET    /api/public/guests/history
+ GET    /api/public/stream (SSE)
```

### v0.3.0
```
+ GET    /api/prizes
+ POST   /api/prizes
+ PUT    /api/prizes/:id
+ DELETE /api/prizes/:id
+ POST   /api/prizes/:id/draw
+ POST   /api/prizes/:id/reset
```

### v0.4.0
```
+ GET    /api/souvenirs
+ POST   /api/souvenirs
+ PUT    /api/souvenirs/:id
+ DELETE /api/souvenirs/:id
+ POST   /api/souvenirs/:id/reset
+ POST   /api/souvenirs/give
+ DELETE /api/souvenirs/take/:guestId/:souvenirId
+ GET    /api/souvenirs/guest/:guestId
+ GET    /api/souvenirs/prizes/winners
+ GET    /api/souvenirs/prizes/uncollected
+ GET    /api/souvenirs/prizes/guest/:guestId
+ POST   /api/souvenirs/prizes/collect
+ DELETE /api/souvenirs/prizes/collect/:prizeWinnerId
```

### v1.0.0
```
+ POST   /api/public/guests/create-checkin
+ POST   /api/souvenirs/give-create
+ GET    /api/souvenirs/stats
+ GET    /api/prizes/stats
```

### v1.1.0
```
+ GET    /api/admin/logs/files
+ GET    /api/admin/logs/content
+ GET    /api/admin/logs/stats
+ GET    /api/admin/audit
+ GET    /api/admin/audit/stats
+ GET    /api/admin/audit/actions
+ GET    /api/health (enhanced)
+ GET    /api/health/live
+ GET    /api/health/ready
+ GET    /api/health/db
+ GET    /api/guests/cursor
+ GET    /api/reports/guests/pdf
+ GET    /api/reports/checkin/pdf
+ GET    /api/reports/attendance/summary
```

### v1.2.0
```
+ POST   /api/email/send (send email to guest)
+ POST   /api/email/send-bulk (send bulk emails)
+ GET    /api/email/settings
+ PUT    /api/email/settings
+ POST   /api/email/test
+ GET    /api/email/logs
~ Enhanced error handling with parseErrorMessage()
~ Email field in guest import/export
```

### v1.3.0
```
~ App name: Guest Registry → Event Management System
+ RegistrationSource enum (MANUAL, IMPORT, WALKIN)
+ registrationSource field in Guest model
+ registration_source column in Excel exports
+ Sumber Registrasi column in full Excel report
+ Sumber column in PDF export
~ Email template redesign (modern, table-based)
~ QR Code as CID attachment (better compatibility)
~ Textarea color fix for dark theme
```

---

## Page Evolution

| Page | v0.1.0 | v0.2.0 | v0.3.0 | v0.4.0 | v1.0.0 | v1.1.0 | v1.2.0 | v1.3.0 |
|------|--------|--------|--------|--------|--------|--------|--------|--------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/checkin` | - | ✅ | ✅ | ✅ | ✅+ | ✅ | ✅+ | ✅ |
| `/show` | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/luckydraw` | - | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/souvenir` | - | - | - | ✅ | ✅+ | ✅ | ✅+ | ✅ |
| `/about` | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ | ✅ | ✅~ |
| `/admin/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅~ |
| `/admin/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/guests` | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅+ |
| `/admin/guests/new` | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/guests/[id]` | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/events` | - | - | - | - | - | ✅ | ✅+ | ✅ |
| `/admin/events/calendar` | - | - | - | - | - | ✅ | ✅+ | ✅ |
| `/admin/statistics` | - | ✅ | ✅ | ✅ | ✅+ | ✅ | ✅ | ✅ |
| `/admin/prizes` | - | - | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/souvenirs` | - | - | - | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/system` | - | - | - | - | - | ✅ | ✅ | ✅ |
| `/admin/settings/event` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/settings/email` | - | - | - | - | - | ✅ | ✅ | ✅+ |
| `/admin/settings/users` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ = Available, ✅+ = Enhanced, ✅~ = Rebranded, - = Not available

---

## Contributors

- **Developer:** Yohanes Octavian Rizky
- **AI Assistant:** Claude (Anthropic) via Windsurf IDE

---

## Future Roadmap (Planned)

### v1.4.0 (Planned)
- [ ] Email notification untuk pemenang lucky draw
- [ ] Print badge/ticket
- [ ] Bulk check-in
- [ ] Guest self-registration
- [ ] Multiple event support (parallel events)
- [ ] Event templates

### v1.5.0 (Planned)
- [ ] Analytics & reporting dashboard
- [ ] Data visualization enhancements
- [ ] Export to multiple formats
- [ ] Scheduled reports

### v2.0.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] Offline support with sync
- [ ] Cloud deployment options
- [ ] Multi-tenant support

---

*Changelog - Last Updated: December 4, 2025 (v1.3.0)*
