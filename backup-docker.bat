@echo off
setlocal enabledelayedexpansion
title Docker Backup - Guest Registry

echo.
echo ================================================================
echo           DOCKER BACKUP - GUEST REGISTRY v1.0
echo     Backup images, database, uploads, dan konfigurasi
echo ================================================================
echo.

:: Set backup directory with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%_%datetime:~8,6%
set BACKUP_DIR=backup_%BACKUP_DATE%

echo [INFO] Membuat folder backup: %BACKUP_DIR%
mkdir "%BACKUP_DIR%" 2>nul

:: Check if containers are running
echo.
echo [1/6] Memeriksa status container...
docker ps --filter "name=guest" --format "table {{.Names}}\t{{.Status}}"
echo.

:: Backup Docker Images
echo [2/6] Menyimpan Docker images...
echo       - Backend image...
docker save registrasitamu-backend:latest -o "%BACKUP_DIR%\backend-image.tar"
if %errorlevel% neq 0 (
    echo [ERROR] Gagal backup backend image
) else (
    echo       [OK] Backend image saved
)

echo       - Frontend image...
docker save registrasitamu-frontend:latest -o "%BACKUP_DIR%\frontend-image.tar"
if %errorlevel% neq 0 (
    echo [ERROR] Gagal backup frontend image
) else (
    echo       [OK] Frontend image saved
)

echo       - PostgreSQL image...
docker save postgres:14-alpine -o "%BACKUP_DIR%\postgres-image.tar"
if %errorlevel% neq 0 (
    echo [ERROR] Gagal backup postgres image
) else (
    echo       [OK] PostgreSQL image saved
)

:: Backup Database
echo.
echo [3/6] Backup database PostgreSQL...
docker exec guest-db-prod pg_dump -U postgres -d guest_registry > "%BACKUP_DIR%\database.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Gagal backup database
) else (
    echo       [OK] Database exported to database.sql
)

:: Backup Uploads Volume
echo.
echo [4/6] Backup uploads folder...
docker cp guest-backend-prod:/app/uploads "%BACKUP_DIR%\uploads" 2>nul
if %errorlevel% neq 0 (
    echo [WARN] Tidak ada uploads atau gagal backup
    mkdir "%BACKUP_DIR%\uploads" 2>nul
) else (
    echo       [OK] Uploads folder saved
)

:: Backup Configuration Files
echo.
echo [5/6] Backup konfigurasi...
copy ".env.production" "%BACKUP_DIR%\.env.production" >nul 2>&1
copy "docker-compose.prod.yml" "%BACKUP_DIR%\docker-compose.prod.yml" >nul 2>&1
copy "generate-ssl.bat" "%BACKUP_DIR%\generate-ssl.bat" >nul 2>&1
xcopy "certs" "%BACKUP_DIR%\certs\" /E /I /Q >nul 2>&1
echo       [OK] Configuration files saved

:: Create restore script in backup folder
echo.
echo [6/6] Membuat script restore...
echo @echo off > "%BACKUP_DIR%\restore.bat"
echo setlocal enabledelayedexpansion >> "%BACKUP_DIR%\restore.bat"
echo title Docker Restore - Guest Registry >> "%BACKUP_DIR%\restore.bat"
echo echo. >> "%BACKUP_DIR%\restore.bat"
echo echo ================================================================ >> "%BACKUP_DIR%\restore.bat"
echo echo           DOCKER RESTORE - GUEST REGISTRY >> "%BACKUP_DIR%\restore.bat"
echo echo ================================================================ >> "%BACKUP_DIR%\restore.bat"
echo echo. >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [1/7] Loading Docker images... >> "%BACKUP_DIR%\restore.bat"
echo docker load -i backend-image.tar >> "%BACKUP_DIR%\restore.bat"
echo docker load -i frontend-image.tar >> "%BACKUP_DIR%\restore.bat"
echo docker load -i postgres-image.tar >> "%BACKUP_DIR%\restore.bat"
echo echo       [OK] Images loaded >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [2/7] Menyalin konfigurasi... >> "%BACKUP_DIR%\restore.bat"
echo copy ".env.production" "..\" ^>nul 2^>^&1 >> "%BACKUP_DIR%\restore.bat"
echo copy "docker-compose.prod.yml" "..\" ^>nul 2^>^&1 >> "%BACKUP_DIR%\restore.bat"
echo xcopy "certs" "..\certs\" /E /I /Q /Y ^>nul 2^>^&1 >> "%BACKUP_DIR%\restore.bat"
echo echo       [OK] Configuration copied >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [3/7] Starting database... >> "%BACKUP_DIR%\restore.bat"
echo cd .. >> "%BACKUP_DIR%\restore.bat"
echo docker-compose -f docker-compose.prod.yml --env-file .env.production up -d postgres >> "%BACKUP_DIR%\restore.bat"
echo echo       Waiting 15 seconds... >> "%BACKUP_DIR%\restore.bat"
echo timeout /t 15 /nobreak ^>nul >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [4/7] Restore database... >> "%BACKUP_DIR%\restore.bat"
echo cd "%%~dp0" >> "%BACKUP_DIR%\restore.bat"
echo docker exec -i guest-db-prod psql -U postgres -d guest_registry ^< database.sql >> "%BACKUP_DIR%\restore.bat"
echo cd .. >> "%BACKUP_DIR%\restore.bat"
echo echo       [OK] Database restored >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [5/7] Starting backend... >> "%BACKUP_DIR%\restore.bat"
echo docker-compose -f docker-compose.prod.yml --env-file .env.production up -d backend >> "%BACKUP_DIR%\restore.bat"
echo timeout /t 20 /nobreak ^>nul >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [6/7] Restore uploads... >> "%BACKUP_DIR%\restore.bat"
echo cd "%%~dp0" >> "%BACKUP_DIR%\restore.bat"
echo docker cp uploads guest-backend-prod:/app/ 2^>nul >> "%BACKUP_DIR%\restore.bat"
echo cd .. >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo [7/7] Starting frontend... >> "%BACKUP_DIR%\restore.bat"
echo docker-compose -f docker-compose.prod.yml --env-file .env.production up -d frontend >> "%BACKUP_DIR%\restore.bat"
echo timeout /t 5 /nobreak ^>nul >> "%BACKUP_DIR%\restore.bat"
echo. >> "%BACKUP_DIR%\restore.bat"
echo echo ================================================================ >> "%BACKUP_DIR%\restore.bat"
echo echo                    RESTORE COMPLETE! >> "%BACKUP_DIR%\restore.bat"
echo echo ================================================================ >> "%BACKUP_DIR%\restore.bat"
echo docker ps --filter "name=guest" >> "%BACKUP_DIR%\restore.bat"
echo pause >> "%BACKUP_DIR%\restore.bat"

echo       [OK] restore.bat created

:: Show backup summary
echo.
echo ================================================================
echo                    BACKUP COMPLETE!
echo ================================================================
echo.
echo Folder backup: %BACKUP_DIR%
echo.
echo Isi folder:
dir "%BACKUP_DIR%" /b
echo.
echo ----------------------------------------------------------------
echo CARA MENGGUNAKAN:
echo 1. Copy folder "%BACKUP_DIR%" ke host tujuan
echo 2. Pastikan Docker sudah terinstall di host tujuan
echo 3. Buka folder backup dan jalankan "restore.bat"
echo ----------------------------------------------------------------
echo.
pause
