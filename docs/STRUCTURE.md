# Project Structure

## Root Directory
- `apps/`: Contains the source code for the application.
  - `backend/`: NestJS application (API).
  - `frontend/`: Next.js application (UI).
- `docs/`: Documentation files.
- `start-dev.bat`: Windows script to start both apps.

## Backend Structure (`apps/backend`)
- `src/`
  - `app.module.ts`: Root module.
  - `main.ts`: Entry point.
  - `prisma/`: Database connection and service.
  - `auth/`: Authentication logic (JWT strategy, guards).
  - `events/`: Event configuration management.
  - `guests/`: Guest management (CRUD, import/export).
  - `public/`: Public-facing endpoints (check-in, search).
  - `uploads/`: Static file serving for uploaded assets.

## Frontend Structure (`apps/frontend`)
- `app/`: Next.js App Router pages.
  - `admin/`: Protected admin routes (Dashboard, Guests, Settings).
  - `checkin/`: Public check-in page.
  - `souvenir/`: Souvenir redemption page.
  - `show/`: Public display page (big screen).
  - `layout.tsx`: Root layout.
- `components/`: Reusable UI components.
  - `ui/`: Basic UI elements (buttons, inputs).
  - `Html5QrcodePlugin.tsx`: QR Code scanner wrapper.
- `lib/`: Utility functions.
  - `api.ts`: API client configuration.
  - `utils.ts`: Helper functions.
- `public/`: Static assets.

## Key Files
- `schema.prisma`: Database schema definition (in backend).
- `tailwind.config.js`: Styling configuration (in frontend).
