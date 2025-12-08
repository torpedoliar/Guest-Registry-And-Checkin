@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   SSL Certificate Generator
echo   For Development Use Only
echo ============================================
echo.

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] OpenSSL is not installed or not in PATH.
    echo.
    echo Please install OpenSSL:
    echo   1. Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo   2. Or install via Chocolatey: choco install openssl
    echo   3. Or install via winget: winget install OpenSSL
    echo.
    pause
    exit /b 1
)

echo [INFO] OpenSSL found. Generating certificates...
echo.

REM Create certs directory in root
if not exist "certs" mkdir certs

REM Create certs directory in backend
if not exist "apps\backend\certs" mkdir apps\backend\certs

REM Create certs directory in frontend
if not exist "apps\frontend\certs" mkdir apps\frontend\certs

REM Generate self-signed certificate
echo [STEP 1/3] Generating private key...
openssl genrsa -out certs\server.key 2048

echo [STEP 2/3] Generating certificate...
openssl req -new -x509 -key certs\server.key -out certs\server.crt -days 365 -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Development/CN=localhost"

echo [STEP 3/3] Copying certificates to app folders...

REM Copy to backend
copy certs\server.key apps\backend\certs\server.key >nul
copy certs\server.crt apps\backend\certs\server.crt >nul

REM Copy to frontend
copy certs\server.key apps\frontend\certs\server.key >nul
copy certs\server.crt apps\frontend\certs\server.crt >nul

echo.
echo ============================================
echo   SSL Certificates Generated Successfully!
echo ============================================
echo.
echo Files created:
echo   - certs\server.key (Private Key)
echo   - certs\server.crt (Certificate)
echo   - apps\backend\certs\server.key
echo   - apps\backend\certs\server.crt
echo   - apps\frontend\certs\server.key
echo   - apps\frontend\certs\server.crt
echo.
echo [WARNING] This is a SELF-SIGNED certificate for DEVELOPMENT only!
echo           Browsers will show security warnings.
echo           For production, use Let's Encrypt or a trusted CA.
echo.
echo To enable HTTPS:
echo   1. Set USE_HTTPS=true in .env files
echo   2. Start backend: cd apps\backend ^&^& npm run start
echo   3. Start frontend: cd apps\frontend ^&^& npm run start:https
echo.
echo Or use the start-dev-https.bat script (if available).
echo.
pause
