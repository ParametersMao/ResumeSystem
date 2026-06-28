$projectRoot = Split-Path -Parent $PSScriptRoot
$middlePath = Join-Path $projectRoot 'middle-resume'

if (-not (Test-Path $middlePath)) {
  throw "Middle path not found: $middlePath"
}

Start-Process powershell.exe -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$middlePath'; npm.cmd run dev"
)
