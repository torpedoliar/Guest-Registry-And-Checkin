@echo off
REM One-click dev starter (Windows CMD) for Guest Registry (no PowerShell dependency)
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM Resolve script root (with trailing backslash)
set "ROOT=%~dp0"

where node >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan di PATH. Install Node.js >= 18 lalu jalankan lagi.
  pause
  exit /b 1
)

REM Start backend (NestJS) in a new window
set "BACKEND_DIR=%ROOT%apps\backend"
if not exist "%BACKEND_DIR%" (
  echo [ERROR] Folder backend tidak ditemukan: %BACKEND_DIR%
  pause
  exit /b 1
)
start "Backend (NestJS)" cmd /k "cd /d ""%BACKEND_DIR%"" && (if not exist node_modules (npm install)) & npm run prisma:generate && npm run dev"

REM Start frontend (Next.js) in a new window
set "FRONTEND_DIR=%ROOT%apps\frontend"
if not exist "%FRONTEND_DIR%" (
  echo [ERROR] Folder frontend tidak ditemukan: %FRONTEND_DIR%
  pause
  exit /b 1
)
start "Frontend (Next.js)" cmd /k "cd /d ""%FRONTEND_DIR%"" && (if not exist node_modules (npm install)) & npm run dev"

REM Give frontend a moment then open browser
timeout /t 2 /nobreak >NUL 2>&1
start "" "http://localhost:3000/admin/login"

echo Launched backend (4000) and frontend (3000). Jika backend di host/port berbeda, set BACKEND_ORIGIN atau NEXT_PUBLIC_API_BASE_URL di apps\frontend\.env.
ENDLOCAL
