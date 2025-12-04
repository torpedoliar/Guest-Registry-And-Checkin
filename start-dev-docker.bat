@echo off
echo ========================================================
echo   GUEST REGISTRATION SYSTEM - DEV ENVIRONMENT (DOCKER)
echo ========================================================
echo.

echo [1/2] Stopping any running containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo [2/2] Building and Starting Dev Containers...
echo.
echo NOTE: The first run might take a while to build images.
echo.

docker-compose -f docker-compose.dev.yml up --build

pause
