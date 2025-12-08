@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Starting Application in HTTPS Mode
echo ============================================
echo.

REM Check if certificates exist
if not exist "apps\backend\certs\server.key" (
    echo [ERROR] SSL certificates not found!
    echo         Run generate-ssl.bat first to create certificates.
    echo.
    pause
    exit /b 1
)

if not exist "apps\frontend\certs\server.key" (
    echo [ERROR] SSL certificates not found!
    echo         Run generate-ssl.bat first to create certificates.
    echo.
    pause
    exit /b 1
)

echo [INFO] SSL certificates found.
echo.

REM Set HTTPS environment variables
set USE_HTTPS=true
set SSL_KEY_PATH=./certs/server.key
set SSL_CERT_PATH=./certs/server.crt

echo [STEP 1/2] Starting Backend (HTTPS)...
start "Backend HTTPS" cmd /k "cd /d %~dp0apps\backend && set USE_HTTPS=true && set SSL_KEY_PATH=./certs/server.key && set SSL_CERT_PATH=./certs/server.crt && npm run start"

echo [STEP 2/2] Starting Frontend (HTTPS)...
timeout /t 5 /nobreak >nul
start "Frontend HTTPS" cmd /k "cd /d %~dp0apps\frontend && set USE_HTTPS=true && set SSL_KEY_PATH=./certs/server.key && set SSL_CERT_PATH=./certs/server.crt && node server.js"

echo.
echo ============================================
echo   Application Starting in HTTPS Mode
echo ============================================
echo.
echo   Backend:  https://localhost:4000
echo   Frontend: https://localhost:3000
echo.
echo [WARNING] Browsers will show security warnings
echo           for self-signed certificates.
echo           Click "Advanced" then "Proceed" to continue.
echo.
echo Opening browser in 10 seconds...
timeout /t 10 /nobreak >nul

start "" "https://localhost:3000/admin/login"

echo.
echo Press any key to close this window...
pause >nul
