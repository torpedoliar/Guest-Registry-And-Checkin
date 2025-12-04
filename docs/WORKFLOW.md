# Application Workflow

## 1. Data Flow Overview

The application follows a standard Client-Server architecture:

1.  **Client (Frontend)**: Next.js app running in the browser.
2.  **Server (Backend)**: NestJS API processing requests.
3.  **Database**: PostgreSQL storing guest and event data.
4.  **Real-time Updates**: Server-Sent Events (SSE) push updates to the Public Display.

## 2. Detailed Workflows

### A. Guest Check-in Flow
1.  **Search/Scan**:
    - Operator scans QR Code or types Guest ID/Name in `/checkin`.
    - Frontend calls `GET /public/guests/search`.
2.  **Confirmation**:
    - Operator verifies guest details in the popup.
    - Operator clicks "Check In".
3.  **Processing**:
    - Frontend calls `POST /public/guests/checkin`.
    - Backend updates `checkinTime` in Database.
    - Backend pushes an event via SSE to `/public/stream`.
4.  **Display Update**:
    - The `/show` page listening to SSE receives the event.
    - The new guest is added to the "Just Arrived" list with an animation.

### B. Souvenir Redemption Flow
1.  **Search/Scan**:
    - Operator scans QR Code in `/souvenir`.
2.  **Verification**:
    - System checks if `souvenirTaken` is false.
3.  **Update**:
    - Operator confirms.
    - Frontend calls `PATCH /guests/:id/souvenir`.
    - Backend updates `souvenirTaken = true`.

### C. Event Configuration Flow
1.  **Admin Update**:
    - Admin uploads a new logo in `/admin/settings/event`.
2.  **Storage**:
    - Backend saves file to disk and updates the `Event` record in DB.
3.  **Broadcast**:
    - Backend pushes a 'config' event via SSE.
4.  **Live Update**:
    - All connected clients (Check-in, Show, Souvenir) receive the new config.
    - Logos and backgrounds update immediately without refresh.
