param(
  [string]$EnvFile = '.env',
  [string]$ComposeFile = 'docker-compose.prod.yml'
)

$ErrorActionPreference = 'Stop'
$required = @(
  'MYSQL_ROOT_PASSWORD', 'DB_PASSWORD', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
  'EMAIL_CODE_SECRET', 'AGENT_INTERNAL_SECRET', 'OPENAI_API_KEY', 'SYSTEM_CONFIG_MASTER_KEY'
)

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Missing production environment file: $EnvFile"
}

$values = @{}
Get-Content -LiteralPath $EnvFile | ForEach-Object {
  if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)\s*$') {
    $values[$matches[1]] = $matches[2].Trim()
  }
}

$errors = @()
foreach ($name in $required) {
  $value = [string]$values[$name]
  if ([string]::IsNullOrWhiteSpace($value) -or $value -match 'replace-with|change-me|^sk-test') {
    $errors += "$name is missing or still contains a placeholder"
  }
}
foreach ($name in @('JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'EMAIL_CODE_SECRET', 'AGENT_INTERNAL_SECRET')) {
  if ([string]$values[$name] -and ([string]$values[$name]).Length -lt 32) {
    $errors += "$name must be at least 32 characters"
  }
}
try {
  $masterKeyBytes = [Convert]::FromBase64String([string]$values['SYSTEM_CONFIG_MASTER_KEY'])
  if ($masterKeyBytes.Length -ne 32) { $errors += 'SYSTEM_CONFIG_MASTER_KEY must decode to exactly 32 bytes' }
} catch {
  if ([string]$values['SYSTEM_CONFIG_MASTER_KEY'] -notmatch '^[0-9a-fA-F]{64}$') {
    $errors += 'SYSTEM_CONFIG_MASTER_KEY must be 32-byte base64 or 64 hexadecimal characters'
  }
}
if ($values['JWT_ACCESS_SECRET'] -eq $values['JWT_REFRESH_SECRET']) {
  $errors += 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ'
}
if ($values['EMBEDDING_BACKEND'] -ne 'fastembed') {
  $errors += 'Production RAG requires EMBEDDING_BACKEND=fastembed'
}
if ($values['AI_EXECUTION_ENGINE'] -ne 'agent') {
  $errors += 'Production AI requires AI_EXECUTION_ENGINE=agent'
}
if ($values['RAG_STRICT_SOURCES'] -ne 'true') {
  $errors += 'Production requires RAG_STRICT_SOURCES=true'
}

if ($errors.Count) {
  $errors | ForEach-Object { Write-Host "ERROR: $_" -ForegroundColor Red }
  throw "Release preflight failed with $($errors.Count) error(s)"
}

docker compose --env-file $EnvFile -f $ComposeFile config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose configuration validation failed' }

if (git status --porcelain) {
  Write-Warning 'The worktree is dirty. Create an explicit release commit and tag before deployment.'
}
Write-Output 'release-preflight: passed'
