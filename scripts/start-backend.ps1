$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backed-resume'

if (-not (Test-Path $backendPath)) {
  throw "Backend path not found: $backendPath"
}

Start-Process powershell.exe -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$backendPath'; npm.cmd run start"
)
