$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][string[]]$Command
  )

  Write-Host ""
  Write-Host "==> $Name" -ForegroundColor Cyan
  Push-Location $WorkingDirectory
  try {
    & $Command[0] @($Command[1..($Command.Length - 1)])
  } finally {
    Pop-Location
  }
}

Invoke-Step 'Backend build' (Join-Path $projectRoot 'backed-resume') @('npm.cmd', 'run', 'build')
Invoke-Step 'Backend tests' (Join-Path $projectRoot 'backed-resume') @('npm.cmd', 'test', '--', '--runInBand')
Invoke-Step 'Backend production audit' (Join-Path $projectRoot 'backed-resume') @('npm.cmd', 'audit', '--omit=dev')

Invoke-Step 'User frontend build' (Join-Path $projectRoot 'fronted-resume-web') @('npm.cmd', 'run', 'build')
Invoke-Step 'User frontend production audit' (Join-Path $projectRoot 'fronted-resume-web') @('npm.cmd', 'audit', '--omit=dev')

Invoke-Step 'Admin frontend build' (Join-Path $projectRoot 'middle-resume') @('npm.cmd', 'run', 'build')
Invoke-Step 'Admin frontend production audit' (Join-Path $projectRoot 'middle-resume') @('npm.cmd', 'audit', '--omit=dev')

Write-Host ""
Write-Host "All checks passed." -ForegroundColor Green
