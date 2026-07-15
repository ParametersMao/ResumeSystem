param(
  [string]$EnvFile = '.env',
  [string]$ComposeFile = 'docker-compose.prod.yml',
  [string]$RequiredCorsOrigin = '',
  [string]$ManifestFile = 'deploy/release-manifest.env',
  [string]$AgentSourceFile = 'python-agent/app/main.py'
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
if ($values['EMBEDDING_MODEL'] -cne 'BAAI/bge-small-zh-v1.5') {
  $errors += 'Production RAG requires the baked EMBEDDING_MODEL=BAAI/bge-small-zh-v1.5'
}
if ($values['AI_EXECUTION_ENGINE'] -ne 'agent') {
  $errors += 'Production AI requires AI_EXECUTION_ENGINE=agent'
}
if ($values['AI_ENABLED'] -ne 'true') {
  $errors += 'Production AI requires AI_ENABLED=true'
}
if ($values['AGENT_EXECUTION_MODE'] -ne 'live') {
  $errors += 'Production Agent requires AGENT_EXECUTION_MODE=live'
}
if ($values['AI_PROVIDER'] -ne 'deepseek') {
  $errors += 'Production Agent requires AI_PROVIDER=deepseek'
}
if (([string]$values['OPENAI_API_URL']).TrimEnd('/') -cne 'https://api.deepseek.com') {
  $errors += 'Production Agent requires OPENAI_API_URL=https://api.deepseek.com'
}
if ($values['OPENAI_MODEL'] -cne 'deepseek-v4-pro') {
  $errors += 'Production Agent requires OPENAI_MODEL=deepseek-v4-pro'
}
if ($values['RAG_STRICT_SOURCES'] -ne 'true') {
  $errors += 'Production requires RAG_STRICT_SOURCES=true'
}
if ($values['RAG_ENABLED'] -ne 'true') {
  $errors += 'Production requires RAG_ENABLED=true'
}

$frontendOrigins = @(
  ([string]$values['FRONTEND_URL']).Split(',') |
    ForEach-Object { $_.Trim() -replace '/$', '' } |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
)
if (-not $frontendOrigins.Count) {
  $errors += 'FRONTEND_URL must contain at least one explicit browser origin'
}
foreach ($origin in $frontendOrigins) {
  $uri = $null
  if ($origin.Contains('*') -or
      -not [Uri]::TryCreate($origin, [UriKind]::Absolute, [ref]$uri) -or
      $uri.Scheme -notin @('http', 'https') -or
      -not [string]::IsNullOrEmpty($uri.UserInfo) -or
      $uri.AbsolutePath -ne '/' -or
      -not [string]::IsNullOrEmpty($uri.Query) -or
      -not [string]::IsNullOrEmpty($uri.Fragment) -or
      $uri.GetLeftPart([UriPartial]::Authority) -ne $origin) {
    $errors += "FRONTEND_URL contains an invalid or non-origin entry: $origin"
  }
}
if ([string]$values['REQUIRE_PUBLIC_HTTPS'] -notin @('true', 'false')) {
  $errors += 'REQUIRE_PUBLIC_HTTPS must be true or false'
}

$ragProbeTimeout = 0
$ragProbeAttempts = 0
$validRagProbeTimeout = [int]::TryParse(
  [string]$values['RAG_HEALTH_PROBE_TIMEOUT_SECONDS'],
  [ref]$ragProbeTimeout
) -and $ragProbeTimeout -ge 30 -and $ragProbeTimeout -le 120
$validRagProbeAttempts = [int]::TryParse(
  [string]$values['RAG_HEALTH_PROBE_ATTEMPTS'],
  [ref]$ragProbeAttempts
) -and $ragProbeAttempts -ge 1 -and $ragProbeAttempts -le 2
if (-not $validRagProbeTimeout) {
  $errors += 'RAG_HEALTH_PROBE_TIMEOUT_SECONDS must be between 30 and 120'
}
if (-not $validRagProbeAttempts) {
  $errors += 'RAG_HEALTH_PROBE_ATTEMPTS must be between 1 and 2'
}
if ($validRagProbeTimeout -and $validRagProbeAttempts) {
  $ragProbeBudget = $ragProbeTimeout * $ragProbeAttempts + 10 * ($ragProbeAttempts - 1)
  if ($ragProbeBudget -gt 120) {
    $errors += 'RAG health probe total budget must not exceed 120 seconds'
  }
}

$manifestValues = @{}
if (-not (Test-Path -LiteralPath $ManifestFile)) {
  $errors += "Release manifest is missing: $ManifestFile"
} else {
  Get-Content -LiteralPath $ManifestFile | ForEach-Object {
    if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)\s*$') {
      $manifestValues[$matches[1]] = $matches[2].Trim()
    }
  }
}
$manifestAgentVersion = [string]$manifestValues['AGENT_VERSION']
$manifestReleaseVersion = [string]$manifestValues['RELEASE_VERSION']
if ($manifestAgentVersion -notmatch '^\d+\.\d+\.\d+$') {
  $errors += 'Release manifest AGENT_VERSION must be semantic x.y.z'
}
if ($manifestReleaseVersion -notmatch '^\d+\.\d+\.\d+$') {
  $errors += 'Release manifest RELEASE_VERSION must be semantic x.y.z'
}
if (-not (Test-Path -LiteralPath $AgentSourceFile)) {
  $errors += "Agent source file is missing: $AgentSourceFile"
} else {
  $agentSource = Get-Content -LiteralPath $AgentSourceFile -Raw
  if ($agentSource -notmatch 'SERVICE_VERSION\s*=\s*["'']([^"'']+)["'']') {
    $errors += 'Agent SERVICE_VERSION could not be read'
  } elseif ($matches[1] -ne $manifestAgentVersion) {
    $errors += "Agent SERVICE_VERSION $($matches[1]) does not match release manifest $manifestAgentVersion"
  }
}

$releaseCommit = [string]$values['RELEASE_COMMIT']
if ($releaseCommit -notmatch '^[0-9a-f]{40}$') {
  $errors += 'RELEASE_COMMIT must be the full lowercase 40-character Git commit'
}
$releaseCommitShort = if ($releaseCommit.Length -ge 12) { $releaseCommit.Substring(0, 12) } else { '' }
$imageRepositories = [ordered]@{
  MYSQL_IMAGE = 'resumesystem_mysql'
  BACKEND_IMAGE = 'resumesystem_backend'
  WEB_IMAGE = 'resumesystem_web'
  ADMIN_IMAGE = 'resumesystem_admin'
  NGINX_IMAGE = 'resumesystem_nginx'
  AGENT_IMAGE = 'resumesystem_agent'
  QDRANT_IMAGE = 'resumesystem_qdrant'
}
$applicationImageVariables = @('BACKEND_IMAGE', 'WEB_IMAGE', 'ADMIN_IMAGE', 'NGINX_IMAGE', 'AGENT_IMAGE')
$expectedTag = "v$manifestReleaseVersion-$releaseCommitShort"
foreach ($entry in $imageRepositories.GetEnumerator()) {
  $imageReference = [string]$values[$entry.Key]
  $expectedReference = "$($entry.Value):$expectedTag"
  if ($imageReference -cne $expectedReference) {
    $errors += "$($entry.Key) must be the immutable release image $expectedReference"
    continue
  }
  if ($entry.Key -in $applicationImageVariables) {
    $imageMetadata = docker image inspect $imageReference --format '{{.Os}}|{{.Architecture}}|{{.Id}}|{{index .Config.Labels "org.opencontainers.image.revision"}}|{{index .Config.Labels "org.opencontainers.image.version"}}' 2>$null
    $expectedMetadata = "linux\|amd64\|sha256:[0-9a-f]{64}\|$releaseCommit\|$([regex]::Escape($manifestReleaseVersion))"
  } else {
    $imageMetadata = docker image inspect $imageReference --format '{{.Os}}|{{.Architecture}}|{{.Id}}' 2>$null
    $expectedMetadata = 'linux\|amd64\|sha256:[0-9a-f]{64}'
  }
  if ($LASTEXITCODE -ne 0 -or $imageMetadata -notmatch "^$expectedMetadata$") {
    $errors += "$($entry.Key) is not a locally loaded linux/amd64 image: $imageReference"
  }
}
foreach ($artifactVariable in @('RELEASE_ARTIFACT_MANIFEST', 'RELEASE_ARTIFACT_CHECKSUMS')) {
  $artifactPath = [string]$values[$artifactVariable]
  if ([string]::IsNullOrWhiteSpace($artifactPath) -or $artifactPath -match 'replace-with') {
    $errors += "$artifactVariable must point to the transferred checksummed release artifact"
  }
}

$corsProbeOrigin = if (-not [string]::IsNullOrWhiteSpace($RequiredCorsOrigin)) {
  $RequiredCorsOrigin
} else {
  [string]$values['CORS_PROBE_ORIGIN']
}
if ([string]::IsNullOrWhiteSpace($corsProbeOrigin)) {
  $errors += 'CORS_PROBE_ORIGIN must identify the browser origin used for production acceptance'
} else {
  $normalizedRequiredOrigin = $corsProbeOrigin.Trim() -replace '/$', ''
  if ($frontendOrigins -cnotcontains $normalizedRequiredOrigin) {
    $errors += "FRONTEND_URL must explicitly contain $normalizedRequiredOrigin"
  }
}

if ($errors.Count) {
  $errors | ForEach-Object { Write-Host "ERROR: $_" -ForegroundColor Red }
  throw "Release preflight failed with $($errors.Count) error(s)"
}

docker compose --env-file $EnvFile -f $ComposeFile config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose configuration validation failed' }

$trackedChanges = @(git status --porcelain --untracked-files=no)
$releaseInputChanges = @(git status --porcelain --untracked-files=all -- backed-resume fronted-resume-web middle-resume python-agent docker-compose.prod.yml deploy)
if ($LASTEXITCODE -ne 0 -or $trackedChanges.Count -gt 0 -or $releaseInputChanges.Count -gt 0) {
  throw 'Release preflight requires tracked files and every build/release input to match HEAD'
}
Write-Output 'release-preflight: passed'
