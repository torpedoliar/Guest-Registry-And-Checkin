# Guest Registration & Check-in System

A comprehensive, enterprise-grade solution for event guest management, real-time check-in, and public display. Built with a modern tech stack ensuring performance, scalability, and a premium user experience.

![Project Banner](https://placehold.co/1200x300/1e293b/white?text=Guest+Registration+System)

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Technology Stack](#-technology-stack)
5. [Installation & Setup](#-installation--setup)
6. [Configuration Guide](#-configuration-guide)
7. [User Guide](#-user-guide)
8. [API Reference](#-api-reference)
9. [Troubleshooting](#-troubleshooting)

---

## 🔭 Project Overview

This application is designed to streamline the guest registration process for corporate events, weddings, or conferences. It solves the problem of slow check-in lines and lack of real-time visibility by providing:

- A **Centralized Admin Dashboard** for organizers to manage guest lists and monitor attendance.
- A **Fast Check-in Interface** for receptionists to quickly search and verify guests via QR code or name.
- A **Public Display Screen** that welcomes guests in real-time on large projectors or TVs.

The system is built as a monorepo containing both the Backend API (NestJS) and Frontend UI (Next.js), ensuring type safety and easy development.

---

## 🌟 Key Features

### 1. Guest Management
- **CRUD Operations**: Add, edit, and delete guests easily.
- **Bulk Import/Export**: Import thousands of guests via CSV. Export data for reporting.
- **Real-time Search**: Instant search by Name, Guest ID, or Company.
- **[Review & Improvements](docs/REVIEW.md)**: Analysis of the codebase and future enhancement suggestions.
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Manual deployment guide.
- **[Docker All-in-One](docs/DOCKER_DEPLOY.md)**: Easy 1-click deployment using Docker.
- **[API Documentation](docs/API.md)**: List of available API endpoints.
### 2. Check-in Experience
- **QR Code Scanning**: Support for webcam-based QR scanning.
- **Instant Verification**: Visual confirmation with guest details (Name, Table, Company).
- **Souvenir Tracking**: Separate module to track souvenir redemption.

### 3. Event Branding
- **Customizable UI**: Upload event logos, background images, or loop videos.
- **Overlay System**: Add custom overlay images for the public display.
- **Live Updates**: Changes to branding reflect instantly on all connected screens without refreshing.

### 4. Public Display (`/show`)
- **"Just Arrived" Animation**: Eye-catching animation when a guest checks in.
- **Queue Number**: Displays a unique queue number for seating or door prizes.
- **Glassmorphism Design**: Modern, premium aesthetic suitable for high-end events.

---

## 🏗 System Architecture

The system follows a client-server architecture with real-time capabilities.

```mermaid
flowchart TB
    subgraph Client ["Frontend (Next.js)"]
        Admin[Admin Dashboard]
        Checkin[Check-in Station]
        Display[Public Display /show]
    end

    subgraph Server ["Backend (NestJS)"]
        API[REST API]
        Auth[Auth Guard]
        Events[Event Module]
        Guests[Guest Module]
        SSE[SSE Stream /public/stream]
    end

    subgraph Data ["Persistence"]
        DB[(PostgreSQL)]
        Storage[Local File Storage]
    end

    Admin -->|HTTP| API
    Checkin -->|HTTP| API
    Display -->|SSE Connection| SSE
    
    API --> DB
    API --> Storage
    SSE -.->|Push Updates| Display
    SSE -.->|Push Updates| Checkin
```

### Data Flow
1. **Check-in**: Receptionist scans a QR code -> Frontend sends POST request -> Backend updates DB -> Backend pushes event via SSE.
2. **Display**: The `/show` page receives the SSE event -> Triggers animation to show the new guest.

---

## 💻 Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 14 | App Router, Server Components, React |
| **Styling** | Tailwind CSS | Utility-first CSS, Glassmorphism effects |
| **Backend** | NestJS | Modular architecture, TypeScript |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Type-safe database access |
| **Real-time** | Server-Sent Events | Lightweight real-time communication |
| **Validation** | Zod / Class-validator | Robust input validation |

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher.
- **PostgreSQL**: Local installation or a cloud instance (e.g., Supabase, Neon).

### One-Click Start (Windows)
- **Development**: Double-click `start-dev.bat`.
- **Production (Docker)**: Double-click `deploy-docker.bat`.

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd apps/backend

# Install dependencies
npm install

# Configure Environment
# Copy .env.example to .env and update DATABASE_URL
cp .env.example .env

# Run Database Migrations
npm run prisma:migrate
npm run prisma:generate

# Seed Initial Data (Admin User)
npm run seed

# Start Server
npm run dev
```

#### 2. Frontend Setup
```bash
cd apps/frontend

# Install dependencies
npm install

# Start Server
npm run dev
```

---

## ⚙ Configuration Guide

### Backend (`apps/backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for signing Admin tokens | `super-secret-key` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

### Frontend (`apps/frontend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_ORIGIN` | URL of the backend API (for proxying) | `http://localhost:4000` |
| `NEXT_PUBLIC_API_BASE_URL` | Fallback API URL for client-side | `http://localhost:4000/api` |

---

## 📖 User Guide

### 1. Admin Login
- Navigate to `/admin/login`.
- Default credentials (from seeder): `admin` / `password` (Change this in production!).

### 2. Setting Up an Event
- Go to **Settings > Event**.
- Upload your **Event Logo** and **Background**.
- Set the **Event Name**, **Date**, and **Location**.
- These settings immediately apply to the Check-in and Display pages.

### 3. Importing Guests
- Go to **Guests**.
- Click **Import CSV**.
- Upload a CSV file with headers: `guestId`, `name`, `email`, `company`, `table`.

### 4. Running Check-in
- Open `/checkin` on a tablet or laptop at the registration desk.
- **Scan**: Use the webcam to scan a guest's QR code.
- **Search**: Type a name or ID if they forgot their QR code.
- **Confirm**: Verify the details and click "Check In".

### 5. Public Display
- Open `/show` on the large screen/projector.
- Press `F11` for fullscreen.
- The page will automatically animate whenever a guest is checked in.

---

## 🔌 API Reference

### Public Endpoints
- `GET /public/guests/search?q=...`: Search for guests.
- `POST /public/guests/checkin`: Check-in a guest.
- `GET /public/stream`: SSE stream for real-time updates.

### Admin Endpoints (Protected)
- `GET /guests`: List all guests.
- `POST /guests`: Create a guest.
- `POST /guests/import`: Import CSV.
- `GET /config/event`: Get event configuration.

For full API documentation, see [docs/API.md](docs/API.md).

---

## ❓ Troubleshooting

**Q: The camera isn't working on the Check-in page.**
A: Browsers block webcam access on insecure origins (HTTP). If you are accessing via LAN (e.g., `http://192.168.1.5:3000`), you must enable "Insecure origins treated as secure" in `chrome://flags`.

**Q: The Public Display isn't updating.**
A: Ensure the device is connected to the network and can reach the backend. Check the browser console for SSE connection errors.

**Q: I can't login.**
A: Ensure you ran `npm run seed` to create the default admin account.

---

**Created by Yohanes Octavian Rizky**
