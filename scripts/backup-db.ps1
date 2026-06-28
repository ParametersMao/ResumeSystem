$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $projectRoot 'backups'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputFile = Join-Path $backupDir "resume-system-$timestamp.sql"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$container = $env:MYSQL_CONTAINER
if (-not $container) { $container = 'resume-mysql' }

$database = $env:DB_DATABASE
if (-not $database) { $database = 'resume_system' }

$user = $env:DB_USERNAME
if (-not $user) { $user = 'root' }

if (-not $env:MYSQL_ROOT_PASSWORD -and $user -eq 'root') {
  Write-Host "MYSQL_ROOT_PASSWORD is not set in the current shell. Docker will use the container environment if available." -ForegroundColor Yellow
}

$passwordArg = if ($user -eq 'root') { '-p$MYSQL_ROOT_PASSWORD' } else { '-p$MYSQL_PASSWORD' }
$dumpCommand = "mysqldump -u$user $passwordArg --single-transaction --routines --triggers $database"

docker exec $container sh -lc $dumpCommand | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "Database backup written to $outputFile" -ForegroundColor Green
