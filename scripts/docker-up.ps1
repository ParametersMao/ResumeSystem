$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env'

if (-not (Test-Path $envFile)) {
  throw "Missing .env. Copy .env.docker.example to .env and fill required secrets first."
}

Push-Location $projectRoot
try {
  docker compose up -d --build
} finally {
  Pop-Location
}
