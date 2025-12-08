@echo off
setlocal enabledelayedexpansion
title Production Deployment - Event Management System v1.3.0

echo.
echo ================================================================
echo     EVENT MANAGEMENT SYSTEM - Production Deployment v3.0
echo     Version: 1.3.0 (December 2025)
echo ================================================================
echo.

:: Get script directory
set "ROOT=%~dp0"
cd /d "%ROOT%"

:: ==========================================
:: [0/9] Pre-flight Checks
:: ==========================================
echo [0/9] Pre-flight checks...

:: Check Docker
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker tidak berjalan atau tidak terinstall!
    echo         Pastikan Docker Desktop sudah running.
    echo.
    echo         Download Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo      - Docker: OK

:: Check Docker Compose
docker-compose --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Compose tidak terinstall!
    pause
    exit /b 1
)
echo      - Docker Compose: OK

:: Check required files
if not exist "docker-compose.prod.yml" (
    echo [ERROR] File docker-compose.prod.yml tidak ditemukan!
    pause
    exit /b 1
)
echo      - docker-compose.prod.yml: OK

if not exist "apps\backend\Dockerfile" (
    echo [ERROR] Backend Dockerfile tidak ditemukan!
    pause
    exit /b 1
)
echo      - Backend Dockerfile: OK

if not exist "apps\frontend\Dockerfile.prod" (
    echo [ERROR] Frontend Dockerfile.prod tidak ditemukan!
    pause
    exit /b 1
)
echo      - Frontend Dockerfile: OK

:: Check/Create .env.production
set ENV_CREATED=0
if not exist ".env.production" (
    if exist ".env.production.example" (
        echo.
        echo [INFO] Membuat .env.production dari template...
        copy ".env.production.example" ".env.production" >nul
        set ENV_CREATED=1
    ) else (
        echo [ERROR] File .env.production dan .env.production.example tidak ditemukan!
        pause
        exit /b 1
    )
)
echo      - .env.production: OK

:: Load environment variables
for /f "usebackq tokens=1,* delims==" %%a in (".env.production") do (
    set "line=%%a"
    if not "!line:~0,1!"=="#" (
        if not "%%a"=="" set "%%a=%%b"
    )
)

:: Validate required environment variables
set ENV_VALID=1
if "%DB_PASSWORD%"=="" set ENV_VALID=0
if "%DB_PASSWORD%"=="CHANGE_THIS_STRONG_PASSWORD" set ENV_VALID=0
if "%JWT_SECRET%"=="" set ENV_VALID=0
if "%JWT_SECRET%"=="CHANGE_THIS_TO_RANDOM_64_CHARACTER_STRING_FOR_SECURITY" set ENV_VALID=0
if "%ADMIN_PASSWORD%"=="" set ENV_VALID=0
if "%ADMIN_PASSWORD%"=="CHANGE_THIS_ADMIN_PASSWORD" set ENV_VALID=0

if %ENV_VALID%==0 (
    echo.
    echo ================================================================
    echo  [WARNING] File .env.production perlu dikonfigurasi!
    echo ================================================================
    echo.
    echo  Nilai saat ini:
    echo    - DB_PASSWORD    : %DB_PASSWORD%
    echo    - JWT_SECRET     : %JWT_SECRET:~0,20%...
    echo    - ADMIN_PASSWORD : %ADMIN_PASSWORD%
    echo    - FRONTEND_PORT  : %FRONTEND_PORT%
    echo.
    echo  Jika nilai masih default, edit file .env.production
    echo.
    set /p CONTINUE_DEPLOY="Lanjutkan deploy dengan nilai ini? (y/n): "
    if /i not "!CONTINUE_DEPLOY!"=="y" (
        echo.
        echo Edit file: %ROOT%.env.production
        echo Lalu jalankan script ini kembali.
        pause
        exit /b 1
    )
)
echo      - Environment variables: OK

:: Get local IP address for display
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        if not defined LOCAL_IP set "LOCAL_IP=%%b"
    )
)
if not defined LOCAL_IP set "LOCAL_IP=localhost"

:: ==========================================
:: [1/9] SSL Certificate Check/Generate
:: ==========================================
echo.
echo [1/9] Checking SSL certificates...

if not exist "certs" mkdir certs
if not exist "apps\backend\certs" mkdir apps\backend\certs
if not exist "apps\frontend\certs" mkdir apps\frontend\certs

if not exist "certs\server.key" (
    echo      - SSL certificate tidak ditemukan, generating...
    
    where openssl >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] OpenSSL tidak terinstall.
        echo.
        echo Opsi:
        echo   1. Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html
        echo   2. Jalankan generate-ssl.bat secara manual
        echo   3. Lanjutkan tanpa HTTPS (tidak direkomendasikan)
        echo.
        set /p CONTINUE="Lanjutkan tanpa HTTPS? (y/n): "
        if /i not "!CONTINUE!"=="y" exit /b 1
        goto skip_ssl
    )
    
    :: Generate self-signed certificate
    openssl genrsa -out certs\server.key 2048 2>nul
    openssl req -new -x509 -key certs\server.key -out certs\server.crt -days 365 -subj "/C=ID/ST=Jakarta/L=Jakarta/O=EventManagement/CN=%LOCAL_IP%" 2>nul
    
    if not exist "certs\server.key" (
        echo [ERROR] Gagal generate SSL certificate!
        pause
        exit /b 1
    )
    
    echo      - SSL certificate generated for %LOCAL_IP%
)

:: Copy certs to app folders
copy certs\server.key apps\backend\certs\ >nul 2>&1
copy certs\server.crt apps\backend\certs\ >nul 2>&1
copy certs\server.key apps\frontend\certs\ >nul 2>&1
copy certs\server.crt apps\frontend\certs\ >nul 2>&1
echo      - SSL certificates: OK

:skip_ssl

:: ==========================================
:: [2/9] Optional Backup
:: ==========================================
echo.
echo [2/9] Checking for existing deployment...

docker ps -q -f name=guest-db-prod >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo      - Existing deployment found
    set /p DO_BACKUP="Backup database sebelum deploy? (y/n): "
    if /i "!DO_BACKUP!"=="y" (
        echo      - Creating backup...
        for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
        set BACKUP_FILE=backup_pre_deploy_!datetime:~0,8!_!datetime:~8,6!.sql
        docker exec guest-db-prod pg_dump -U postgres -d guest_registry > "!BACKUP_FILE!" 2>nul
        if exist "!BACKUP_FILE!" (
            echo      - Backup saved: !BACKUP_FILE!
        ) else (
            echo      - [WARNING] Backup gagal, melanjutkan deployment...
        )
    )
) else (
    echo      - No existing deployment (fresh install)
)

:: ==========================================
:: [3/9] Stop Existing Containers
:: ==========================================
echo.
echo [3/9] Stopping existing containers...
docker-compose -f docker-compose.prod.yml --env-file .env.production down >nul 2>&1
echo      - Containers stopped

:: ==========================================
:: [4/9] Build Containers
:: ==========================================
echo.
echo [4/9] Building containers (this may take 5-10 minutes)...
echo      - Building backend and frontend images...
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed! Checking common issues...
    echo.
    echo Possible fixes:
    echo   1. Check internet connection
    echo   2. Check disk space: docker system df
    echo   3. Clean Docker: docker system prune -a
    echo   4. Check logs above for specific errors
    echo.
    pause
    exit /b 1
)
echo      - Build completed successfully

:: ==========================================
:: [5/9] Start Database
:: ==========================================
echo.
echo [5/9] Starting database...
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d postgres

:: Wait for database to be healthy
echo      - Waiting for database to be ready...
set RETRY=0
:wait_db
set /a RETRY+=1
if %RETRY% gtr 60 (
    echo [ERROR] Database timeout after 2 minutes!
    echo         Check logs: docker logs guest-db-prod
    pause
    exit /b 1
)
docker exec guest-db-prod pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_db
)
echo      - Database ready (took %RETRY% attempts)

:: ==========================================
:: [6/9] Apply Complete Database Schema
:: ==========================================
echo.
echo [6/9] Applying complete database schema v1.3.0...

:: Create comprehensive SQL schema file
echo -- Event Management System v1.3.0 Complete Schema > "%TEMP%\complete_schema.sql"
echo -- Generated by deploy-prod.bat >> "%TEMP%\complete_schema.sql"
echo. >> "%TEMP%\complete_schema.sql"

:: Create enums
echo -- Create enums >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN CREATE TYPE "EventBackgroundType" AS ENUM ('NONE', 'IMAGE', 'VIDEO'); EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN CREATE TYPE "GuestCategory" AS ENUM ('REGULAR', 'VIP', 'VVIP', 'MEDIA', 'SPONSOR', 'SPEAKER', 'ORGANIZER'); EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN CREATE TYPE "RegistrationSource" AS ENUM ('MANUAL', 'IMPORT', 'WALKIN'); EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"

:: Create AdminUser table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create AdminUser table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "AdminUser" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "username" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "passwordHash" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "displayName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "isActive" BOOLEAN NOT NULL DEFAULT true, >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username"); >> "%TEMP%\complete_schema.sql"

:: Create Event table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create Event table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "Event" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "name" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "date" TIMESTAMP(3), >> "%TEMP%\complete_schema.sql"
echo   "time" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "location" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "logoUrl" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "backgroundType" "EventBackgroundType" NOT NULL DEFAULT 'NONE', >> "%TEMP%\complete_schema.sql"
echo   "backgroundImageUrl" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "backgroundVideoUrl" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "overlayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.5, >> "%TEMP%\complete_schema.sql"
echo   "checkinPopupTimeoutMs" INTEGER NOT NULL DEFAULT 5000, >> "%TEMP%\complete_schema.sql"
echo   "enablePhotoCapture" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "isActive" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "enableLuckyDraw" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "enableSouvenir" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "allowDuplicateGuestId" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "allowMultipleCheckin" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "maxCheckinCount" INTEGER NOT NULL DEFAULT 1, >> "%TEMP%\complete_schema.sql"
echo   "allowMultipleCheckinPerCounter" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "requireCheckinForSouvenir" BOOLEAN NOT NULL DEFAULT true, >> "%TEMP%\complete_schema.sql"
echo   "customCategories" JSONB, >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "Event_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"

:: Create Guest table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create Guest table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "Guest" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "queueNumber" INTEGER NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "guestId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "name" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "email" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "phone" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "photoUrl" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "tableLocation" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "company" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "department" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "division" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "notes" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "category" "GuestCategory" NOT NULL DEFAULT 'REGULAR', >> "%TEMP%\complete_schema.sql"
echo   "registrationSource" "RegistrationSource" NOT NULL DEFAULT 'MANUAL', >> "%TEMP%\complete_schema.sql"
echo   "checkedIn" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "checkedInAt" TIMESTAMP(3), >> "%TEMP%\complete_schema.sql"
echo   "checkedInById" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "checkedInByName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "checkinCount" INTEGER NOT NULL DEFAULT 0, >> "%TEMP%\complete_schema.sql"
echo   "souvenirTaken" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "emailSent" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "emailSentAt" TIMESTAMP(3), >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "eventId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "Guest_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"

:: Create Prize table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create Prize table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "Prize" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "name" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "description" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "imageUrl" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "quantity" INTEGER NOT NULL DEFAULT 1, >> "%TEMP%\complete_schema.sql"
echo   "category" TEXT NOT NULL DEFAULT 'HIBURAN', >> "%TEMP%\complete_schema.sql"
echo   "allowMultipleWins" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "eventId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "Prize_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Prize_eventId_idx" ON "Prize"("eventId"); >> "%TEMP%\complete_schema.sql"

:: Create PrizeWinner table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create PrizeWinner table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "PrizeWinner" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "guestId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "prizeId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "wonAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "PrizeWinner_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "PrizeWinner_guestId_idx" ON "PrizeWinner"("guestId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "PrizeWinner_prizeId_idx" ON "PrizeWinner"("prizeId"); >> "%TEMP%\complete_schema.sql"
echo CREATE UNIQUE INDEX IF NOT EXISTS "PrizeWinner_guestId_prizeId_key" ON "PrizeWinner"("guestId", "prizeId"); >> "%TEMP%\complete_schema.sql"

:: Create AuditLog table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create AuditLog table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "AuditLog" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "action" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "metadata" JSONB, >> "%TEMP%\complete_schema.sql"
echo   "adminUserId" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"

:: Add missing columns to Event table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Add missing columns to Event table >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Event" ADD COLUMN "time" TEXT; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Event" ADD COLUMN "maxCheckinCount" INTEGER DEFAULT 1; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Event" ADD COLUMN "allowMultipleCheckinPerCounter" BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Event" ADD COLUMN "requireCheckinForSouvenir" BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Event" ADD COLUMN "customCategories" JSONB; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"

:: Add missing columns to Guest table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Add missing columns to Guest table >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Guest" ADD COLUMN "registrationSource" "RegistrationSource" DEFAULT 'MANUAL'; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Guest" ADD COLUMN "checkinCount" INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN null; END $$; >> "%TEMP%\complete_schema.sql"

:: Create GuestCheckin table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create GuestCheckin table (multiple check-in tracking) >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "GuestCheckin" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "guestId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "checkinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "checkinById" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "checkinByName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "counterName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "GuestCheckin_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "GuestCheckin_guestId_idx" ON "GuestCheckin"("guestId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "GuestCheckin_checkinById_idx" ON "GuestCheckin"("checkinById"); >> "%TEMP%\complete_schema.sql"

:: Create Souvenir table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create Souvenir table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "Souvenir" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "name" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "description" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "imageUrl" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "quantity" INTEGER NOT NULL DEFAULT 1, >> "%TEMP%\complete_schema.sql"
echo   "eventId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "Souvenir_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Souvenir_eventId_idx" ON "Souvenir"("eventId"); >> "%TEMP%\complete_schema.sql"

:: Create SouvenirTake table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create SouvenirTake table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "SouvenirTake" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "guestId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "souvenirId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "takenById" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "takenByName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "SouvenirTake_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "SouvenirTake_guestId_idx" ON "SouvenirTake"("guestId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "SouvenirTake_souvenirId_idx" ON "SouvenirTake"("souvenirId"); >> "%TEMP%\complete_schema.sql"
echo CREATE UNIQUE INDEX IF NOT EXISTS "SouvenirTake_guestId_souvenirId_key" ON "SouvenirTake"("guestId", "souvenirId"); >> "%TEMP%\complete_schema.sql"

:: Create PrizeCollection table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create PrizeCollection table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "PrizeCollection" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "prizeWinnerId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "collectedById" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "collectedByName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "PrizeCollection_pkey" PRIMARY KEY ("id"), >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "PrizeCollection_prizeWinnerId_key" UNIQUE ("prizeWinnerId") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"

:: Create EmailSettings table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create EmailSettings table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "EmailSettings" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "smtpHost" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "smtpPort" INTEGER NOT NULL DEFAULT 587, >> "%TEMP%\complete_schema.sql"
echo   "smtpSecure" BOOLEAN NOT NULL DEFAULT false, >> "%TEMP%\complete_schema.sql"
echo   "smtpUser" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "smtpPass" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "senderName" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "senderEmail" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "emailSubject" TEXT NOT NULL DEFAULT 'Undangan Event', >> "%TEMP%\complete_schema.sql"
echo   "emailTemplate" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "isActive" BOOLEAN NOT NULL DEFAULT true, >> "%TEMP%\complete_schema.sql"
echo   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"

:: Create EmailLog table
echo. >> "%TEMP%\complete_schema.sql"
echo -- Create EmailLog table >> "%TEMP%\complete_schema.sql"
echo CREATE TABLE IF NOT EXISTS "EmailLog" ( >> "%TEMP%\complete_schema.sql"
echo   "id" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "guestId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "eventId" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "recipient" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "subject" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "status" TEXT NOT NULL, >> "%TEMP%\complete_schema.sql"
echo   "errorMessage" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, >> "%TEMP%\complete_schema.sql"
echo   "sentById" TEXT, >> "%TEMP%\complete_schema.sql"
echo   "sentByName" TEXT, >> "%TEMP%\complete_schema.sql"
echo   CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id") >> "%TEMP%\complete_schema.sql"
echo ); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "EmailLog_guestId_idx" ON "EmailLog"("guestId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "EmailLog_eventId_idx" ON "EmailLog"("eventId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status"); >> "%TEMP%\complete_schema.sql"

:: Add foreign keys
echo. >> "%TEMP%\complete_schema.sql"
echo -- Add foreign key constraints >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "GuestCheckin" ADD CONSTRAINT "GuestCheckin_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Souvenir" ADD CONSTRAINT "Souvenir_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "SouvenirTake" ADD CONSTRAINT "SouvenirTake_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "SouvenirTake" ADD CONSTRAINT "SouvenirTake_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "Souvenir"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "PrizeCollection" ADD CONSTRAINT "PrizeCollection_prizeWinnerId_fkey" FOREIGN KEY ("prizeWinnerId") REFERENCES "PrizeWinner"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Guest" ADD CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "Prize" ADD CONSTRAINT "Prize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "PrizeWinner" ADD CONSTRAINT "PrizeWinner_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"
echo DO $$ BEGIN ALTER TABLE "PrizeWinner" ADD CONSTRAINT "PrizeWinner_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$; >> "%TEMP%\complete_schema.sql"

:: Add Guest table indexes
echo. >> "%TEMP%\complete_schema.sql"
echo -- Add performance indexes >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_eventId_idx" ON "Guest"("eventId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_eventId_checkedIn_idx" ON "Guest"("eventId", "checkedIn"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_eventId_guestId_idx" ON "Guest"("eventId", "guestId"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_eventId_category_idx" ON "Guest"("eventId", "category"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_name_idx" ON "Guest"("name"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_company_idx" ON "Guest"("company"); >> "%TEMP%\complete_schema.sql"
echo CREATE INDEX IF NOT EXISTS "Guest_queueNumber_idx" ON "Guest"("queueNumber"); >> "%TEMP%\complete_schema.sql"

:: Apply schema
docker cp "%TEMP%\complete_schema.sql" guest-db-prod:/tmp/complete_schema.sql >nul 2>&1
docker exec guest-db-prod psql -U postgres -d guest_registry -f /tmp/complete_schema.sql >nul 2>&1
del "%TEMP%\complete_schema.sql" >nul 2>&1
echo      - Complete schema v1.3.0 applied

:: ==========================================
:: [7/9] Start Backend
:: ==========================================
echo.
echo [7/9] Starting backend...
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d backend

:: Wait for backend
echo      - Waiting for backend API (this may take 30-60 seconds)...
set RETRY=0
:wait_backend
set /a RETRY+=1
if %RETRY% gtr 45 (
    echo      - [WARNING] Backend health check timeout
    echo      - Checking if container is running...
    docker ps -q -f name=guest-backend-prod | findstr . >nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Backend container failed to start!
        echo         Check logs: docker logs guest-backend-prod
        pause
        exit /b 1
    )
    echo      - Container is running, continuing...
    goto start_frontend
)
docker exec guest-backend-prod wget -q -O /dev/null http://127.0.0.1:4000/api/health >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_backend
)
echo      - Backend ready (took %RETRY% attempts)

:: ==========================================
:: [8/9] Start Frontend
:: ==========================================
:start_frontend
echo.
echo [8/9] Starting frontend...
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d frontend

:: Wait for frontend to start
timeout /t 5 /nobreak >nul
docker ps -q -f name=guest-frontend-prod | findstr . >nul
if %ERRORLEVEL% neq 0 (
    echo      - Retrying frontend start...
    docker start guest-frontend-prod >nul 2>&1
    timeout /t 3 /nobreak >nul
)
echo      - Frontend started

:: ==========================================
:: [9/9] Final Verification
:: ==========================================
echo.
echo [9/9] Verifying deployment...
timeout /t 3 /nobreak >nul

set ALL_OK=1
set DB_STATUS=FAIL
set BACKEND_STATUS=FAIL
set FRONTEND_STATUS=FAIL

:: Check database
docker ps -q -f name=guest-db-prod | findstr . >nul
if %ERRORLEVEL% equ 0 (
    set DB_STATUS=OK
) else (
    set ALL_OK=0
)

:: Check backend
docker ps -q -f name=guest-backend-prod | findstr . >nul
if %ERRORLEVEL% equ 0 (
    set BACKEND_STATUS=OK
) else (
    set ALL_OK=0
)

:: Check frontend
docker ps -q -f name=guest-frontend-prod | findstr . >nul
if %ERRORLEVEL% equ 0 (
    set FRONTEND_STATUS=OK
) else (
    set ALL_OK=0
)

echo.
echo ================================================================
echo                     DEPLOYMENT STATUS
echo ================================================================
echo.
echo   Database  : [%DB_STATUS%]
echo   Backend   : [%BACKEND_STATUS%]
echo   Frontend  : [%FRONTEND_STATUS%]
echo.

if %ALL_OK%==0 (
    echo [WARNING] Some services may have issues!
    echo.
    echo Troubleshooting commands:
    echo   docker logs guest-db-prod
    echo   docker logs guest-backend-prod
    echo   docker logs guest-frontend-prod
    echo.
) else (
    echo ================================================================
    echo           EVENT MANAGEMENT SYSTEM v1.3.0 DEPLOYED!
    echo ================================================================
)

echo.
echo ================================================================
echo                       ACCESS URLS
echo ================================================================
echo.
echo   Local:
echo     https://localhost:%FRONTEND_PORT%
echo.
echo   Network (untuk device lain):
echo     https://%LOCAL_IP%:%FRONTEND_PORT%
echo.
echo   Login: https://%LOCAL_IP%:%FRONTEND_PORT%/admin/login
echo.
echo ================================================================
echo                      CREDENTIALS
echo ================================================================
echo.
echo   Username : %ADMIN_USERNAME%
echo   Password : (lihat di .env.production)
echo.
echo ================================================================
echo                    USEFUL COMMANDS
echo ================================================================
echo.
echo   View logs     : docker-compose -f docker-compose.prod.yml logs -f
echo   Stop all      : docker-compose -f docker-compose.prod.yml down
echo   Restart all   : docker-compose -f docker-compose.prod.yml restart
echo   Backup DB     : backup-docker.bat
echo   Restore DB    : restore-docker.bat
echo.
echo ================================================================
echo                        NOTES
echo ================================================================
echo.
echo   1. Browser akan menampilkan warning SSL (self-signed certificate)
echo      Klik "Advanced" lalu "Proceed to..." untuk melanjutkan
echo.
echo   2. Untuk akses dari device lain, gunakan IP: %LOCAL_IP%
echo.
echo   3. Pastikan Windows Firewall mengizinkan port %FRONTEND_PORT%
echo.
echo ================================================================
echo.

:: Open browser option
set /p OPEN_BROWSER="Buka browser sekarang? (y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start "" "https://localhost:%FRONTEND_PORT%/admin/login"
)

echo.
echo Deployment selesai. Tekan tombol apa saja untuk keluar...
pause >nul
