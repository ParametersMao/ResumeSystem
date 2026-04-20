$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $projectRoot 'fronted-resume-web'

if (-not (Test-Path $frontendPath)) {
  throw "Frontend path not found: $frontendPath"
}

Start-Process powershell.exe -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$frontendPath'; npm.cmd run dev"
)
