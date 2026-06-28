$scriptDir = $PSScriptRoot

& (Join-Path $scriptDir 'start-backend.ps1')
Start-Sleep -Milliseconds 400
& (Join-Path $scriptDir 'start-middle.ps1')
Start-Sleep -Milliseconds 400
& (Join-Path $scriptDir 'start-frontend.ps1')
