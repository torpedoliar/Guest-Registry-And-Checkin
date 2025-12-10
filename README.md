<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
</p>

<h1 align="center">
  🎪 Guest Registration & Check-in System
</h1>

<p align="center">
  <strong>Enterprise-grade event management solution with real-time check-in,<br/>QR code scanning, and stunning public display animations.</strong>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-documentation">Documentation</a>
</p>

---

## ✨ Highlights

<table>
<tr>
<td width="50%">

### 🚀 One-Click Deployment
Deploy the entire stack (Frontend, Backend, Database) with a single command using Docker Compose.

</td>
<td width="50%">

### ⚡ Real-time Updates
Server-Sent Events (SSE) technology ensures instant updates across all connected devices.

</td>
</tr>
<tr>
<td width="50%">

### 📱 QR Code Check-in
Fast and reliable guest verification using webcam-based QR code scanning.

</td>
<td width="50%">

### 🎨 Premium UI Design
Glassmorphism effects, smooth animations, and fully customizable event branding.

</td>
</tr>
</table>

---

## 🎯 Use Cases

- **Corporate Events** — Annual meetings, product launches, conferences
- **Weddings & Celebrations** — Guest registration with table assignments
- **Exhibitions & Trade Shows** — Visitor tracking and badge printing
- **Seminars & Workshops** — Attendance tracking with souvenir distribution

---

## 🖥️ Screenshots

<p align="center">
  <img src="https://placehold.co/800x450/1e293b/94a3b8?text=Admin+Dashboard" alt="Admin Dashboard" width="45%"/>
  &nbsp;&nbsp;
  <img src="https://placehold.co/800x450/1e293b/94a3b8?text=Check-in+Station" alt="Check-in Station" width="45%"/>
</p>
<p align="center">
  <img src="https://placehold.co/800x450/0f172a/60a5fa?text=Public+Display+Screen" alt="Public Display" width="45%"/>
  &nbsp;&nbsp;
  <img src="https://placehold.co/800x450/0f172a/60a5fa?text=QR+Code+Scanner" alt="QR Scanner" width="45%"/>
</p>

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.x |
| Docker & Docker Compose | Latest |
| PostgreSQL | 14+ (or use Docker) |

### 🐳 Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/guest-registry.git
cd guest-registry

# One-click deploy
deploy-prod.bat
```

The application will be available at:
- **Admin Panel**: `https://localhost:443/admin`
- **Check-in Station**: `https://localhost:443/checkin`
- **Public Display**: `https://localhost:443/show`

### 💻 Manual Development Setup

<details>
<summary><strong>Click to expand</strong></summary>

#### Backend Setup
```bash
cd apps/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations & seed
npm run prisma:migrate
npm run prisma:generate
npm run seed

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

</details>

---

## 🎨 Features

<details open>
<summary><h3>📋 Guest Management</h3></summary>

| Feature | Description |
|---------|-------------|
| **CRUD Operations** | Add, edit, delete guests with intuitive UI |
| **Bulk Import** | Import thousands of guests via Excel/CSV |
| **Export** | Download guest lists and attendance reports |
| **Search & Filter** | Real-time search by name, ID, company, or table |
| **Email Invitations** | Send personalized invitations with QR codes |

</details>

<details open>
<summary><h3>✅ Check-in System</h3></summary>

| Feature | Description |
|---------|-------------|
| **QR Code Scanning** | Webcam-based instant verification |
| **Manual Search** | Fallback search for guests without QR |
| **Duplicate Prevention** | Automatic detection of already checked-in guests |
| **Souvenir Tracking** | Separate module for gift distribution |
| **Real-time Counter** | Live attendance statistics |

</details>

<details open>
<summary><h3>🖥️ Public Display</h3></summary>

| Feature | Description |
|---------|-------------|
| **Welcome Animation** | Eye-catching animation when guests arrive |
| **Queue Numbers** | Auto-generated numbers for seating/prizes |
| **Event Branding** | Custom logo, background, and overlay images |
| **Loop Videos** | Background video support for ambiance |
| **Multi-Screen** | Support for multiple display screens |

</details>

<details>
<summary><h3>⚙️ Settings & Configuration</h3></summary>

| Feature | Description |
|---------|-------------|
| **Event Details** | Name, date, location, welcome message |
| **Visual Assets** | Logo, background, overlay images |
| **SMTP Email** | Configure email server for invitations |
| **User Management** | Admin, Operator, and User roles |
| **Timeout Settings** | Configurable display and popup durations |

</details>

---

## 💻 Tech Stack

<table>
<tr>
<td align="center" width="120">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" width="48" height="48" alt="Next.js" />
<br><strong>Next.js 15</strong>
<br><sub>Frontend</sub>
</td>
<td align="center" width="120">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nestjs/nestjs-original.svg" width="48" height="48" alt="NestJS" />
<br><strong>NestJS 10</strong>
<br><sub>Backend</sub>
</td>
<td align="center" width="120">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="48" height="48" alt="PostgreSQL" />
<br><strong>PostgreSQL</strong>
<br><sub>Database</sub>
</td>
<td align="center" width="120">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="48" height="48" alt="Docker" />
<br><strong>Docker</strong>
<br><sub>Containerization</sub>
</td>
<td align="center" width="120">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind" />
<br><strong>Tailwind CSS</strong>
<br><sub>Styling</sub>
</td>
</tr>
</table>

### Additional Technologies

- **Prisma** — Type-safe ORM for database access
- **React Query** — Server state management
- **Server-Sent Events** — Real-time communication
- **QRCode.js** — QR code generation
- **html5-qrcode** — QR code scanning
- **Nodemailer** — Email sending
- **Winston** — Logging

---

## 📁 Project Structure

```
├── 📂 apps/
│   ├── 📂 backend/           # NestJS API Server
│   │   ├── prisma/           # Database schema & migrations
│   │   └── src/
│   │       ├── auth/         # Authentication module
│   │       ├── guests/       # Guest management
│   │       ├── config/       # App configuration
│   │       └── public/       # Public endpoints & SSE
│   │
│   └── 📂 frontend/          # Next.js Web App
│       └── app/
│           ├── admin/        # Admin dashboard pages
│           ├── checkin/      # Check-in station
│           └── show/         # Public display
│
├── 📂 docs/                  # Documentation
├── 📂 certs/                 # SSL certificates
├── 🐳 docker-compose.prod.yml
├── 🚀 deploy-prod.bat        # One-click deployment
├── 💾 backup-docker.bat      # Backup script
└── 📜 restore-docker.bat     # Restore script
```

---

## 🔐 Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `ADMIN_PASSWORD` | ✅ | Initial admin password |
| `CORS_ORIGIN` | ❌ | Allowed origins (default: `*`) |
| `SMTP_HOST` | ❌ | Email server hostname |
| `SMTP_USER` | ❌ | Email username |
| `SMTP_PASS` | ❌ | Email password |

### Frontend (`apps/frontend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `BACKEND_ORIGIN` | ✅ | Backend API URL for proxying |
| `NEXT_PUBLIC_API_BASE_URL` | ❌ | Client-side API URL |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📘 User Guide](USER_GUIDE.md) | Complete usage instructions |
| [📗 API Reference](docs/API.md) | REST API endpoints |
| [📙 Deployment Guide](docs/DEPLOY_PRODUCTION.md) | Production deployment |
| [📕 Docker Guide](docs/DOCKER_DEPLOY.md) | Docker-specific instructions |
| [📓 Technical Blueprint](TECHNICAL_BLUEPRINT.md) | Architecture deep-dive |
| [📒 Changelog](CHANGELOG.md) | Version history |

---

## 🔄 Backup & Restore

### Create Backup

```batch
backup-docker.bat
```

This creates a complete backup including:
- ✅ Docker images (frontend, backend, postgres)
- ✅ Database dump (SQL)
- ✅ Uploads folder
- ✅ Configuration files
- ✅ SSL certificates

### Restore from Backup

```batch
cd backup_YYYYMMDD_HHMMSS
restore.bat
```

---

## ❓ FAQ

<details>
<summary><strong>Camera not working on Check-in page?</strong></summary>

Browsers block webcam access on insecure origins (HTTP). Solutions:
1. Use HTTPS (recommended)
2. Access via `localhost`
3. Enable "Insecure origins treated as secure" in `chrome://flags`

</details>

<details>
<summary><strong>Public Display not updating in real-time?</strong></summary>

1. Check network connectivity between display and server
2. Verify SSE connection in browser DevTools (Network tab)
3. Ensure no firewall is blocking the connection

</details>

<details>
<summary><strong>Cannot login to admin panel?</strong></summary>

1. Ensure database migrations are applied
2. Run `npm run seed` to create default admin
3. Default credentials: `admin` / (check your `.env` file)

</details>

<details>
<summary><strong>Email invitations not sending?</strong></summary>

1. Verify SMTP settings in Admin → Settings → Email
2. Check backend logs for email errors
3. Test with a reliable SMTP provider (Gmail, SendGrid, etc.)

</details>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Created with ❤️ by Yohanes Octavian Rizky</strong>
</p>

<p align="center">
  <a href="https://github.com/your-username">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
</p>
