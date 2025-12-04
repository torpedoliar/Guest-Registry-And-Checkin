@echo off
setlocal

echo ========================================================
echo   GUEST REGISTRATION SYSTEM - DATABASE DEPLOY (DOCKER)
echo ========================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running or not installed.
    echo Please install Docker Desktop and ensure it is running.
    pause
    exit /b 1
)

echo [1/5] Starting PostgreSQL container...
docker-compose up -d postgres
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start PostgreSQL container.
    pause
    exit /b 1
)

echo.
echo [2/5] Waiting for PostgreSQL to be ready...
:wait_postgres
docker exec guest-db pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo PostgreSQL is ready!

echo.
echo [3/5] Running Prisma migrations...
cd apps\backend

REM Set Docker database credentials (overrides .env)
set DATABASE_URL=postgresql://postgres:password@localhost:5432/guest_registry?schema=public

call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run migrations.
    cd ..\..
    pause
    exit /b 1
)

echo.
echo [4/5] Generating Prisma client...
call npx prisma generate
cd ..\..

echo.
set /p SEED_CHOICE="[5/5] Do you want to seed the database? (y/N): "
if /i "%SEED_CHOICE%"=="y" (
    echo Seeding database...
    cd apps\backend
    set DATABASE_URL=postgresql://postgres:password@localhost:5432/guest_registry?schema=public
    call npm run seed
    cd ..\..
    echo Database seeded successfully!
) else (
    echo Skipping database seeding.
)

echo.
echo ========================================================
echo   DATABASE DEPLOYMENT COMPLETE!
echo ========================================================
echo.
echo PostgreSQL is running on: localhost:5432
echo   - Database: guest_registry
echo   - Username: postgres
echo   - Password: password
echo.
echo Connection string:
echo postgresql://postgres:password@localhost:5432/guest_registry
echo.

pause
