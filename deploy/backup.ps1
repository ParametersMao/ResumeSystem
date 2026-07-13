param([string]$OutputDirectory = 'backups')

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path '.').Path
$targetRoot = [System.IO.Path]::GetFullPath((Join-Path $resolvedRoot $OutputDirectory))
if (-not $targetRoot.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Backup directory must remain inside the project directory'
}
New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$sqlPath = Join-Path $targetRoot "mysql-$stamp.sql"
$qdrantPath = Join-Path $targetRoot "qdrant-$stamp.tar"
$uploadsPath = Join-Path $targetRoot "uploads-$stamp.tar"
$projectName = if ($env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME } else { 'resumesystem' }

docker exec resume-mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers "$MYSQL_DATABASE"' | Set-Content -LiteralPath $sqlPath
if ($LASTEXITCODE -ne 0) { throw 'MySQL backup failed' }
docker run --rm -v "${projectName}_qdrant_data:/data:ro" -v "${targetRoot}:/backup" alpine tar -cf "/backup/$(Split-Path $qdrantPath -Leaf)" -C /data .
if ($LASTEXITCODE -ne 0) { throw 'Qdrant backup failed' }
docker run --rm -v "${projectName}_backend_uploads:/data:ro" -v "${targetRoot}:/backup" alpine tar -cf "/backup/$(Split-Path $uploadsPath -Leaf)" -C /data .
if ($LASTEXITCODE -ne 0) { throw 'Upload backup failed' }

Get-FileHash $sqlPath, $qdrantPath, $uploadsPath -Algorithm SHA256 | Format-Table Path, Hash
Write-Output "backup: passed ($stamp)"
