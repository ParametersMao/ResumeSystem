param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile
)

$ErrorActionPreference = 'Stop'

$resolvedInput = Resolve-Path -LiteralPath $InputFile

$container = $env:MYSQL_CONTAINER
if (-not $container) { $container = 'resume-mysql' }

$database = $env:DB_DATABASE
if (-not $database) { $database = 'resume_system' }

$user = $env:DB_USERNAME
if (-not $user) { $user = 'root' }

$passwordArg = if ($user -eq 'root') { '-p$MYSQL_ROOT_PASSWORD' } else { '-p$MYSQL_PASSWORD' }
$restoreCommand = "mysql -u$user $passwordArg $database"

Get-Content -LiteralPath $resolvedInput -Raw | docker exec -i $container sh -lc $restoreCommand

Write-Host "Database restored from $resolvedInput" -ForegroundColor Green
