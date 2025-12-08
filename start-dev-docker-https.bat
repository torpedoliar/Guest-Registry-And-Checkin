@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   GUEST REGISTRATION SYSTEM - DEV ENVIRONMENT (DOCKER HTTPS)
echo ============================================================
echo.

REM Check if certificates exist
if not exist "certs\server.key" (
    echo [WARNING] SSL certificates not found in certs\ folder.
    echo.
    echo Generating self-signed certificates...
    echo.
    
    REM Check if OpenSSL is available
    where openssl >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] OpenSSL is not installed or not in PATH.
        echo.
        echo Please either:
        echo   1. Run generate-ssl.bat manually first
        echo   2. Install OpenSSL and run this script again
        echo.
        pause
        exit /b 1
    )
    
    REM Create certs directory
    if not exist "certs" mkdir certs
    
    REM Generate certificate
    echo [STEP 1/2] Generating private key...
    openssl genrsa -out certs\server.key 2048
    
    echo [STEP 2/2] Generating certificate...
    openssl req -new -x509 -key certs\server.key -out certs\server.crt -days 365 -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Development/CN=localhost"
    
    echo.
    echo [OK] SSL certificates generated successfully.
    echo.
)

echo [INFO] SSL certificates found.
echo.

echo [1/2] Stopping any running HTTPS containers...
docker-compose -f docker-compose.dev-https.yml down

echo.
echo [2/2] Building and Starting Dev Containers (HTTPS Mode)...
echo.
echo NOTE: The first run might take a while to build images.
echo.

docker-compose -f docker-compose.dev-https.yml up --build -d

echo.
echo ============================================================
echo   Docker Containers Starting in HTTPS Mode
echo ============================================================
echo.
echo   Frontend: https://localhost:3000
echo   Backend:  https://localhost:4000
echo.
echo [WARNING] Browsers will show security warnings for
echo           self-signed certificates.
echo           Click "Advanced" then "Proceed" to continue.
echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo Opening browser...
start "" "https://localhost:3000/admin/login"

echo.
echo To view logs:
echo   docker-compose -f docker-compose.dev-https.yml logs -f
echo.
echo To stop:
echo   docker-compose -f docker-compose.dev-https.yml down
echo.
pause
