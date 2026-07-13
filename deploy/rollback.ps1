param(
  [Parameter(Mandatory = $true)][string]$ReleaseTag,
  [string]$EnvFile = '.env',
  [string]$ComposeFile = 'docker-compose.prod.yml'
)

$ErrorActionPreference = 'Stop'
if ($ReleaseTag -notmatch '^v?\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$') {
  throw 'ReleaseTag must be a semantic version such as v1.2.0'
}
if (-not (Test-Path -LiteralPath $EnvFile)) { throw "Missing $EnvFile" }
if (git status --porcelain) { throw 'Refusing rollback because the worktree is dirty' }

git rev-parse --verify "refs/tags/$ReleaseTag" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Release tag does not exist: $ReleaseTag" }

git switch --detach $ReleaseTag
docker compose --env-file $EnvFile -f $ComposeFile up -d --build
if ($LASTEXITCODE -ne 0) { throw 'Rollback deployment failed' }

$health = Invoke-RestMethod -Uri 'http://127.0.0.1/api/health' -TimeoutSec 30
if ($health.status -ne 'ok') { throw 'Post-rollback health check failed' }
Write-Output "rollback: passed ($ReleaseTag)"
