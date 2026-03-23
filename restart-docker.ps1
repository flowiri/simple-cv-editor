$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Restarting Docker Compose stack in $projectRoot..." -ForegroundColor Cyan

Push-Location $projectRoot
try {
  docker compose down
  docker compose up --build -d
  Write-Host "Docker stack restarted." -ForegroundColor Green
  Write-Host "App: http://localhost:8000" -ForegroundColor Green
}
finally {
  Pop-Location
}
