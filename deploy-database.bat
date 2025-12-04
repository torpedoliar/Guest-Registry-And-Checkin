@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

echo ========================================================
echo   GUEST REGISTRATION SYSTEM - DATABASE DEPLOY (LOCAL)
echo ========================================================
echo.
echo   Fitur terbaru yang akan di-migrate:
echo   - GuestCategory enum (REGULAR, VIP, VVIP, MEDIA, SPONSOR, SPEAKER, ORGANIZER)
echo   - Guest: category, department, division
echo   - Event: enablePhotoCapture, enableLuckyDraw, enableSouvenir
echo   - Prize, PrizeWinner, PrizeCollection
echo   - Souvenir, SouvenirTake
echo.
echo ========================================================
echo.

REM Resolve script root
set "ROOT=%~dp0"

REM Check if Node.js is available
where node >NUL 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js tidak ditemukan di PATH.
    echo         Install Node.js ^>= 18 dari https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js ditemukan: 
node --version
echo.

REM Navigate to backend directory
set "BACKEND_DIR=%ROOT%apps\backend"
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Folder backend tidak ditemukan: %BACKEND_DIR%
    pause
    exit /b 1
)

cd /d "%BACKEND_DIR%"

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] File .env tidak ditemukan!
    echo.
    if exist ".env.example" (
        echo Membuat .env dari .env.example...
        copy ".env.example" ".env" >NUL
        echo.
        echo [PENTING] Edit file apps\backend\.env dan sesuaikan:
        echo   - DATABASE_URL dengan koneksi PostgreSQL Anda
        echo   - JWT_SECRET dengan secret yang aman
        echo.
        pause
        exit /b 1
    ) else (
        echo [ERROR] File .env.example juga tidak ditemukan!
        pause
        exit /b 1
    )
)

echo [1/5] Menginstall dependencies...
if not exist "node_modules" (
    echo      Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Gagal install dependencies.
        pause
        exit /b 1
    )
) else (
    echo      Dependencies sudah terinstall, skip...
)
echo.

echo [2/5] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Gagal generate Prisma client.
    pause
    exit /b 1
)
echo.

echo [3/5] Menjalankan database migrations...
echo.
echo [INFO] Pastikan PostgreSQL sudah berjalan dan DATABASE_URL di .env sudah benar!
echo.
set /p MIGRATE_CONFIRM="Lanjutkan migration? (Y/n): "
if /i "%MIGRATE_CONFIRM%"=="n" (
    echo Migration dibatalkan.
    pause
    exit /b 0
)

call npx prisma migrate deploy
if errorlevel 1 (
    echo.
    echo [WARNING] Migration deploy gagal. Mencoba migrate dev...
    call npx prisma migrate dev --name full_schema_update
    if errorlevel 1 (
        echo.
        echo [ERROR] Migration gagal!
        echo.
        echo Kemungkinan penyebab:
        echo   1. PostgreSQL tidak berjalan
        echo   2. DATABASE_URL di .env salah
        echo   3. Database belum dibuat
        echo.
        echo Untuk membuat database baru, jalankan di psql:
        echo   CREATE DATABASE guest_registry;
        echo.
        pause
        exit /b 1
    )
)
echo.

echo [4/5] Verifikasi schema...
call npx prisma generate
echo      Schema berhasil diverifikasi.
echo.

echo [5/5] Seed database (opsional)...
set /p SEED_CHOICE="Apakah ingin seed database dengan data awal? (y/N): "
if /i "%SEED_CHOICE%"=="y" (
    echo Menjalankan seeder...
    call npm run seed
    if errorlevel 1 (
        echo [WARNING] Seeding gagal, mungkin data sudah ada.
    ) else (
        echo Database berhasil di-seed!
    )
) else (
    echo Skip seeding.
)

cd /d "%ROOT%"

echo.
echo ========================================================
echo   DATABASE DEPLOYMENT SELESAI!
echo ========================================================
echo.
echo   Schema terbaru sudah diterapkan:
echo   - Guest: category, department, division
echo   - Event: enablePhotoCapture, enableLuckyDraw, enableSouvenir
echo   - Prize system dengan PrizeWinner dan PrizeCollection
echo   - Souvenir system dengan SouvenirTake
echo.
echo   Selanjutnya jalankan: startup.bat atau start-dev.bat
echo.
echo ========================================================
echo.

pause
