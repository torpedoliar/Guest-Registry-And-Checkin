# One-click dev starter for Guest Registry (Windows PowerShell)
$ErrorActionPreference = 'Stop'

Write-Host '== Guest Registry: starting backend & frontend (dev) ==' -ForegroundColor Cyan

# Check Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Warning 'Node.js not found. Please install Node.js >= 18 and re-run.'
  Read-Host 'Press Enter to exit'
  exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'apps\backend'
$frontend = Join-Path $root 'apps\frontend'

Write-Host "Root: $root"
Write-Host "Backend: $backend"
Write-Host "Frontend: $frontend"

# Helper: start a new PowerShell window in a working directory with a command
function Start-DevWindow {
  param(
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$WorkDir,
    [Parameter(Mandatory=$true)][string]$Command
  )
  $psArgs = @('-NoExit','-ExecutionPolicy','Bypass','-Command', $Command)
  Start-Process -FilePath 'powershell.exe' -ArgumentList $psArgs -WorkingDirectory $WorkDir -WindowStyle Normal
}

# Backend: install deps on first run, then start dev
$backendCmd = "if (-not (Test-Path 'node_modules')) { npm install }; npm run prisma:generate; npm run dev"
Start-DevWindow -Title 'Backend (NestJS)' -WorkDir $backend -Command $backendCmd

# Frontend: install deps on first run, then start dev
$frontendCmd = "if (-not (Test-Path 'node_modules')) { npm install }; npm run dev"
Start-DevWindow -Title 'Frontend (Next.js)' -WorkDir $frontend -Command $frontendCmd

Start-Sleep -Seconds 2
try {
  Start-Process 'http://localhost:3000/admin/login' | Out-Null
} catch {}

Write-Host 'Launched backend (port 4000) and frontend (port 3000).'
Write-Host 'If your backend is on a different host/port, set BACKEND_ORIGIN atau NEXT_PUBLIC_API_BASE_URL di apps/frontend/.env.'
