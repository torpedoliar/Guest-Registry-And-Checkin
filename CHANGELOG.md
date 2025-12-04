# Version History & Changelog

## Guest Registration & Check-in System

Dokumen ini mencatat riwayat pengembangan aplikasi dari awal hingga versi terkini.

---

## Timeline Overview

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT TIMELINE                                         │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  v0.1.0       v0.2.0       v0.3.0       v0.4.0       v1.0.0       v1.1.0             │
│    │            │            │            │            │            │                 │
│    ▼            ▼            ▼            ▼            ▼            ▼                 │
│  ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐              │
│  │ ● │────────│ ● │────────│ ● │────────│ ● │────────│ ● │────────│ ● │              │
│  └───┘        └───┘        └───┘        └───┘        └───┘        └───┘              │
│    │            │            │            │            │            │                 │
│  Project     Guest        Lucky       Souvenir     Final       Security              │
│  Setup       Mgmt         Draw        System       Release     & Perf                │
│                                                                                        │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Version Details

### v1.1.0 - Performance, Security & UI Improvements (December 2025)
**Status:** ✅ Current Version

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

---

## Page Evolution

| Page | v0.1.0 | v0.2.0 | v0.3.0 | v0.4.0 | v1.0.0 | v1.1.0 |
|------|--------|--------|--------|--------|--------|--------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/checkin` | - | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/show` | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/luckydraw` | - | - | ✅ | ✅ | ✅ | ✅ |
| `/souvenir` | - | - | - | ✅ | ✅+ | ✅ |
| `/about` | ✅ | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/guests` | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/statistics` | - | ✅ | ✅ | ✅ | ✅+ | ✅ |
| `/admin/prizes` | - | - | ✅ | ✅ | ✅ | ✅ |
| `/admin/souvenirs` | - | - | - | ✅ | ✅ | ✅ |
| `/admin/system` | - | - | - | - | - | ✅ (new) |
| `/admin/settings/event` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/settings/users` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ = Available, ✅+ = Enhanced, - = Not available

---

## Contributors

- **Developer:** Yohanes Octavian Rizky
- **AI Assistant:** Claude (Anthropic) via Windsurf IDE

---

## Future Roadmap (Planned)

### v1.2.0 (Planned)
- [ ] Email notification untuk pemenang
- [ ] Print badge/ticket
- [ ] Bulk check-in
- [ ] Guest self-registration
- [ ] Multiple event support (parallel events)
- [ ] Event templates

### v1.3.0 (Planned)
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

*Changelog - Last Updated: December 2025*
