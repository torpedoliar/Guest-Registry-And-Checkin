@echo off
title Renew SSL Certificate
echo.
echo ================================================================
echo           RENEW SSL CERTIFICATE - GUEST REGISTRY
echo ================================================================
echo.

:: Check if OpenSSL is available
where openssl >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] OpenSSL tidak ditemukan.
    echo.
    echo Install OpenSSL atau gunakan Git Bash:
    echo   "C:\Program Files\Git\usr\bin\openssl.exe"
    echo.
    pause
    exit /b 1
)

:: Set validity days
set /p DAYS="Masa berlaku (hari, default 365): "
if "%DAYS%"=="" set DAYS=365

:: Backup old certificates
echo.
echo [1/4] Backup certificate lama...
if exist "certs\server.key" (
    copy "certs\server.key" "certs\server.key.bak" >nul
    copy "certs\server.crt" "certs\server.crt.bak" >nul
    echo       [OK] Backup saved to server.key.bak, server.crt.bak
) else (
    echo       [INFO] Tidak ada certificate lama
)

:: Generate new certificate
echo.
echo [2/4] Generate certificate baru (valid %DAYS% hari)...
mkdir certs 2>nul

openssl req -x509 -nodes -days %DAYS% -newkey rsa:2048 ^
  -keyout certs\server.key ^
  -out certs\server.crt ^
  -subj "/CN=localhost/O=Guest Registry/C=ID" ^
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

if %errorlevel% neq 0 (
    echo [ERROR] Gagal generate certificate
    pause
    exit /b 1
)
echo       [OK] Certificate baru berhasil dibuat

:: Show certificate info
echo.
echo [3/4] Info certificate baru:
openssl x509 -in certs\server.crt -noout -dates
echo.

:: Restart frontend container
echo [4/4] Restart frontend container...
docker restart guest-frontend-prod >nul 2>&1
if %errorlevel% neq 0 (
    echo       [WARN] Container tidak berjalan atau gagal restart
    echo       Jalankan manual: docker restart guest-frontend-prod
) else (
    echo       [OK] Frontend container restarted
)

echo.
echo ================================================================
echo                 SSL CERTIFICATE RENEWED!
echo ================================================================
echo.
echo Certificate baru berlaku sampai %DAYS% hari ke depan.
echo Akses: https://localhost:8443
echo.
pause
