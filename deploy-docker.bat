@echo off
setlocal

echo ========================================================
echo   GUEST REGISTRATION SYSTEM - ONE CLICK DEPLOY (DOCKER)
echo ========================================================
echo.

REM 1. Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running or not installed.
    echo Please install Docker Desktop and ensure it is running.
    pause
    exit /b 1
)

echo [1/4] Building and Starting Containers...
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers.
    pause
    exit /b 1
)

echo.
echo [2/4] Waiting for Database to be ready (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [3/4] Seeding Database...
echo This may take a few moments...
docker exec -it guest-backend npm run seed

echo.
echo [4/4] Deployment Complete!
echo.
echo Access the application at:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:4000
echo - Admin:    http://localhost:3000/admin/login
echo.
echo Opening browser...
start http://localhost:3000/admin/login

pause
