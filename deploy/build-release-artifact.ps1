param(
  [Parameter(Mandatory = $true)][string]$ReleaseCommit,
  [Parameter(Mandatory = $true)][string]$MySqlSourceImage,
  [Parameter(Mandatory = $true)][string]$QdrantSourceImage,
  [Parameter(Mandatory = $true)][string]$NginxBaseImage,
  [string]$OutputDirectory = 'backups/release-artifacts',
  [string]$DebianMirror = 'https://mirrors.aliyun.com'
)

$ErrorActionPreference = 'Stop'
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot 'image-archive-manifest.ps1')

if ($ReleaseCommit -cnotmatch '^[0-9a-f]{40}$') {
  throw 'ReleaseCommit must be the full lowercase 40-character Git commit'
}
$head = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $head -cne $ReleaseCommit) {
  throw "ReleaseCommit does not match HEAD ($head)"
}
$repositoryRoot = (Get-Location).Path
$trackedChanges = @(git status --porcelain --untracked-files=no)
if ($LASTEXITCODE -ne 0 -or $trackedChanges.Count -gt 0) {
  throw 'Release artifact requires all tracked files to match HEAD'
}
$buildInputs = @(
  'backed-resume', 'fronted-resume-web', 'middle-resume', 'python-agent',
  'docker-compose.prod.yml', 'docker/mysql/init',
  'deploy/release-manifest.env', 'deploy/nginx'
)
$inputChanges = @(git status --porcelain --untracked-files=all -- @buildInputs)
if ($LASTEXITCODE -ne 0 -or $inputChanges.Count -gt 0) {
  throw 'Release build contexts contain staged, modified, or untracked inputs'
}
$requiredTrackedFiles = @(
  'deploy/release-manifest.env',
  'deploy/image-archive-manifest.ps1',
  'python-agent/scripts/health_probe_client.py',
  'python-agent/scripts/bootstrap_fixture.py',
  'python-agent/scripts/agent-entrypoint.sh',
  'docs/knowledge-base/resume-writing-standard-v1.md',
  'docker/mysql/init/001_schema.sql',
  'deploy/bootstrap-rag-fixture.sh',
  'deploy/deploy-loaded-release.sh',
  'deploy/recover-interrupted-rollout.sh',
  'deploy/recover-interrupted-backup.sh',
  'deploy/verify-runtime-manifest.sh',
  'deploy/rollback-images.sh',
  'deploy/rag-recovery-probe.py',
  'deploy/maintenance-firewall.sh',
  'deploy/recovery-acceptance.sh',
  'deploy/live-agent-probe.py',
  'deploy/finalize-release.sh',
  'deploy/rollout-guard.sh',
  'deploy/systemd/resumesystem-rollout-guard.service',
  'deploy/systemd/resumesystem-rollout-proxy-guard.service',
  'deploy/systemd/resumesystem-backup-recovery.service'
)
foreach ($requiredFile in $requiredTrackedFiles) {
  git ls-files --error-unmatch -- $requiredFile 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Required release file is not tracked: $requiredFile" }
}
$requiredExecutableFiles = @(
  'deploy/backup.sh',
  'python-agent/scripts/agent-entrypoint.sh',
  'deploy/bootstrap-rag-fixture.sh',
  'deploy/deploy-loaded-release.sh',
  'deploy/finalize-release.sh',
  'deploy/health-check.sh',
  'deploy/maintenance-firewall.sh',
  'deploy/recovery-acceptance.sh',
  'deploy/recover-interrupted-rollout.sh',
  'deploy/recover-interrupted-backup.sh',
  'deploy/verify-runtime-manifest.sh',
  'deploy/restore.sh',
  'deploy/rollout-guard.sh',
  'deploy/rollback-images.sh'
)
foreach ($executableFile in $requiredExecutableFiles) {
  $indexEntry = [string](git ls-files -s -- $executableFile)
  if ($LASTEXITCODE -ne 0 -or $indexEntry -notmatch '^100755\s') {
    throw "Release runtime file must be tracked as executable (100755): $executableFile"
  }
}

$manifest = @{}
Get-Content -LiteralPath 'deploy/release-manifest.env' | ForEach-Object {
  if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)\s*$') {
    $manifest[$matches[1]] = $matches[2].Trim()
  }
}
$version = [string]$manifest['RELEASE_VERSION']
if ($version -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid RELEASE_VERSION in release manifest' }
foreach ($vendorSource in @($MySqlSourceImage, $QdrantSourceImage, $NginxBaseImage)) {
  if ($vendorSource -notmatch '^([^@\s]+@sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64})$') {
    throw "Vendor/base image must be supplied by immutable digest or image id: $vendorSource"
  }
}
$tag = "v$version-$($ReleaseCommit.Substring(0, 12))"
$resolvedRoot = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputDirectory))
New-Item -ItemType Directory -Force -Path $resolvedRoot | Out-Null
$baseName = "resumesystem-$tag"
$tarPath = Join-Path $resolvedRoot "$baseName-images.tar"
$sourceTarPath = Join-Path $resolvedRoot "$baseName-source.tar"
$recordPath = Join-Path $resolvedRoot "$baseName-manifest.json"
$checksumPath = Join-Path $resolvedRoot "$baseName-SHA256SUMS"
$buildLockPath = Join-Path $resolvedRoot "$baseName-build.lock"
foreach ($immutableOutput in @($tarPath, $sourceTarPath, $recordPath, $checksumPath, $buildLockPath)) {
  if (Test-Path -LiteralPath $immutableOutput) {
    throw "Immutable release output already exists; create a new commit instead of overwriting: $immutableOutput"
  }
}
[System.IO.File]::WriteAllText(
  $buildLockPath,
  "commit=$ReleaseCommit`ncreatedAt=$((Get-Date).ToUniversalTime().ToString('o'))`n",
  [System.Text.Encoding]::ASCII
)

$images = [ordered]@{
  BACKEND_IMAGE = @{ Kind = 'app'; Context = 'backed-resume'; Target = "resumesystem_backend:$tag"; BuildArgs = @('--build-arg', "DEBIAN_MIRROR=$DebianMirror") }
  WEB_IMAGE = @{ Kind = 'app'; Context = 'fronted-resume-web'; Target = "resumesystem_web:$tag"; BuildArgs = @('--build-arg', 'VITE_API_BASE=/api', '--build-arg', 'VITE_USE_MOCK=false') }
  ADMIN_IMAGE = @{ Kind = 'app'; Context = 'middle-resume'; Target = "resumesystem_admin:$tag"; BuildArgs = @('--build-arg', 'VITE_API_BASE_URL=/api', '--build-arg', 'VITE_APP_ENV=production', '--build-arg', 'VITE_DEBUG=false', '--build-arg', 'VITE_USE_MOCK=false', '--build-arg', 'VITE_BASE=/admin/') }
  AGENT_IMAGE = @{ Kind = 'app'; Context = 'python-agent'; Target = "resumesystem_agent:$tag"; BuildArgs = @() }
  MYSQL_IMAGE = @{ Kind = 'vendor'; Source = $MySqlSourceImage; Target = "resumesystem_mysql:$tag" }
  NGINX_IMAGE = @{ Kind = 'app'; Context = 'deploy/nginx'; Target = "resumesystem_nginx:$tag"; BuildArgs = @('--build-arg', "NGINX_BASE_IMAGE=$NginxBaseImage") }
  QDRANT_IMAGE = @{ Kind = 'vendor'; Source = $QdrantSourceImage; Target = "resumesystem_qdrant:$tag" }
}
$records = @()
foreach ($entry in $images.GetEnumerator()) {
  if ($entry.Value.Kind -eq 'app') {
    $buildArguments = @(
      'build', '--platform', 'linux/amd64',
      '--label', "org.opencontainers.image.revision=$ReleaseCommit",
      '--label', "org.opencontainers.image.version=$version",
      '--label', 'org.opencontainers.image.source=https://github.com/ParametersMao/ResumeSystem'
    )
    $buildArguments += @($entry.Value.BuildArgs)
    $buildArguments += @('--tag', $entry.Value.Target, $entry.Value.Context)
    & docker @buildArguments
    if ($LASTEXITCODE -ne 0) { throw "Failed to build $($entry.Key) from clean HEAD" }

    $metadataJson = docker image inspect $entry.Value.Target
    if ($LASTEXITCODE -ne 0) {
      throw "Built image metadata is invalid: $($entry.Value.Target)"
    }
    try {
      $metadataItems = @($metadataJson | ConvertFrom-Json -ErrorAction Stop)
    } catch {
      throw "Built image metadata JSON is invalid: $($entry.Value.Target)"
    }
    if ($metadataItems.Count -ne 1) {
      throw "Built image metadata is ambiguous: $($entry.Value.Target)"
    }
    $metadata = $metadataItems[0]
    $imageId = [string]$metadata.Id
    $revision = [string]$metadata.Config.Labels.'org.opencontainers.image.revision'
    $imageVersion = [string]$metadata.Config.Labels.'org.opencontainers.image.version'
    if ([string]$metadata.Os -cne 'linux' -or
        [string]$metadata.Architecture -cne 'amd64' -or
        $imageId -notmatch '^sha256:[0-9a-f]{64}$') {
      throw "Built image is not a valid linux/amd64 image: $($entry.Value.Target)"
    }
    if ($revision -cne $ReleaseCommit -or $imageVersion -cne $version) {
      throw "Built image provenance does not match release commit/version: $($entry.Value.Target)"
    }
    switch ($entry.Key) {
      'BACKEND_IMAGE' {
        docker run --rm --entrypoint test $entry.Value.Target -x /usr/bin/chromium-headless-shell
      }
      'WEB_IMAGE' {
        docker run --rm --entrypoint grep $entry.Value.Target -Eq 'src=./assets/' /usr/share/nginx/html/index.html
      }
      'ADMIN_IMAGE' {
        docker run --rm --entrypoint grep $entry.Value.Target -Fq '/admin/js/main-' /usr/share/nginx/html/index.html
      }
      'NGINX_IMAGE' {
        docker run --rm --entrypoint grep $entry.Value.Target -Fq 'server_name 121.43.208.184;' /etc/nginx/conf.d/default.conf
        if ($LASTEXITCODE -eq 0) {
          docker run --rm --entrypoint grep $entry.Value.Target -Fq 'location /admin/' /etc/nginx/conf.d/default.conf
        }
      }
      'AGENT_IMAGE' {
        $agentRuntimeArguments = @(
          'run', '--rm', '--network', 'none',
          '-e', 'FASTEMBED_CACHE_PATH=/tmp/fastembed-cache/current',
          '-e', 'EMBEDDING_BACKEND=fastembed',
          '-e', 'EMBEDDING_MODEL=BAAI/bge-small-zh-v1.5',
          $entry.Value.Target
        )
        $agentProbeArguments = $agentRuntimeArguments + @(
          'python', '-c',
          'import os,sys; from app.main import SERVICE_VERSION; from app.rag import embed_texts; assert os.environ.get(''FASTEMBED_CACHE_PATH'') == ''/tmp/fastembed-cache/current''; assert os.path.islink(os.environ[''FASTEMBED_CACHE_PATH'']); assert SERVICE_VERSION == sys.argv[1]; assert len(embed_texts([''offline release probe''])[0]) == 512',
          $version
        )
        & docker @agentProbeArguments
        if ($LASTEXITCODE -eq 0) {
          & docker @agentRuntimeArguments python scripts/bootstrap_fixture.py --help
        }
      }
    }
    if ($LASTEXITCODE -ne 0) { throw "Built image runtime assertion failed: $($entry.Key)" }
  } else {
    if ($entry.Value.Source -notmatch '^sha256:') {
      docker pull --platform linux/amd64 $entry.Value.Source
      if ($LASTEXITCODE -ne 0) { throw "Failed to pull vendor image $($entry.Value.Source)" }
    }
    $metadataJson = docker image inspect $entry.Value.Source
    if ($LASTEXITCODE -ne 0) {
      throw "Vendor image is not linux/amd64: $($entry.Value.Source)"
    }
    try {
      $metadataItems = @($metadataJson | ConvertFrom-Json -ErrorAction Stop)
    } catch {
      throw "Vendor image metadata JSON is invalid: $($entry.Value.Source)"
    }
    if ($metadataItems.Count -ne 1) {
      throw "Vendor image metadata is ambiguous: $($entry.Value.Source)"
    }
    $metadata = $metadataItems[0]
    $imageId = [string]$metadata.Id
    if ([string]$metadata.Os -cne 'linux' -or
        [string]$metadata.Architecture -cne 'amd64' -or
        $imageId -notmatch '^sha256:[0-9a-f]{64}$') {
      throw "Vendor image is not linux/amd64: $($entry.Value.Source)"
    }
    docker tag $entry.Value.Source $entry.Value.Target
    if ($LASTEXITCODE -ne 0) { throw "Failed to tag vendor image $($entry.Value.Target)" }
    $resolvedId = (docker image inspect $entry.Value.Target --format '{{.Id}}').Trim()
    if ($resolvedId -cne $imageId) { throw "Vendor target tag does not preserve the pulled image id" }
  }
  $imageRecord = [ordered]@{
    variable = $entry.Key
    reference = $entry.Value.Target
    imageId = $null
    os = 'linux'
    architecture = 'amd64'
    kind = $entry.Value.Kind
  }
  if ($entry.Value.Kind -eq 'app') {
    $imageRecord.revision = $ReleaseCommit
    $imageRecord.version = $version
    $imageRecord.context = $entry.Value.Context
  } else {
    $imageRecord.sourceReference = $entry.Value.Source
  }
  $records += $imageRecord
}

$imageReferences = @($records | ForEach-Object { $_.reference })
& docker save --output $tarPath @imageReferences
if ($LASTEXITCODE -ne 0) { throw 'docker save failed' }
$records = @(Resolve-DockerSaveImageRecords `
  -ArchivePath $tarPath -Records $records `
  -ReleaseCommit $ReleaseCommit -ReleaseVersion $version)
New-DeterministicGitArchive `
  -RepositoryPath $repositoryRoot `
  -ReleaseCommit $ReleaseCommit `
  -ArchivePath $sourceTarPath
$sourceHash = (Get-FileHash -LiteralPath $sourceTarPath -Algorithm SHA256).Hash.ToLowerInvariant()
$runtimeFilePaths = @(
  'docker-compose.prod.yml',
  'docker/mysql/init/001_schema.sql',
  'deploy/release-manifest.env',
  'docs/knowledge-base/resume-writing-standard-v1.md',
  'deploy/nginx/resume-system.conf',
  'deploy/deploy-loaded-release.sh',
  'deploy/recover-interrupted-rollout.sh',
  'deploy/recover-interrupted-backup.sh',
  'deploy/verify-runtime-manifest.sh',
  'deploy/bootstrap-rag-fixture.sh',
  'deploy/rollback-images.sh',
  'deploy/rag-recovery-probe.py',
  'deploy/maintenance-firewall.sh',
  'deploy/recovery-acceptance.sh',
  'deploy/live-agent-probe.py',
  'deploy/finalize-release.sh',
  'deploy/rollout-guard.sh',
  'deploy/backup.sh',
  'deploy/restore.sh',
  'deploy/health-check.sh',
  'deploy/systemd/resumesystem-health.service',
  'deploy/systemd/resumesystem-health.timer',
  'deploy/systemd/resumesystem-backup.service',
  'deploy/systemd/resumesystem-backup.timer',
  'deploy/systemd/resumesystem-rollout-guard.service',
  'deploy/systemd/resumesystem-rollout-proxy-guard.service',
  'deploy/systemd/resumesystem-backup-recovery.service'
)
$runtimeFiles = [ordered]@{}
Assert-TarArchiveMemberUsesLf `
  -ArchivePath $sourceTarPath `
  -MemberPath 'deploy/release-manifest.env'
foreach ($runtimeFile in $runtimeFilePaths) {
  $archiveHash = Get-TarArchiveMemberSha256 `
    -ArchivePath $sourceTarPath `
    -MemberPath $runtimeFile
  $gitBlobHash = Get-GitBlobSha256 `
    -RepositoryPath $repositoryRoot `
    -ReleaseCommit $ReleaseCommit `
    -MemberPath $runtimeFile
  if ($archiveHash -cne $gitBlobHash) {
    throw "Source archive member differs from Git blob: $runtimeFile"
  }
  $runtimeFiles[$runtimeFile] = $archiveHash
}
$composeHash = $runtimeFiles['docker-compose.prod.yml']
$record = [ordered]@{
  releaseVersion = $version
  releaseCommit = $ReleaseCommit
  releaseTag = $tag
  composeSha256 = $composeHash
  sourceArchive = (Split-Path $sourceTarPath -Leaf)
  sourceSha256 = $sourceHash
  artifactInputs = [ordered]@{
    mysql = $MySqlSourceImage
    qdrant = $QdrantSourceImage
    nginxBase = $NginxBaseImage
    debianMirror = $DebianMirror
  }
  runtimeFiles = $runtimeFiles
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  images = $records
}
$recordJson = $record | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText(
  $recordPath,
  $recordJson,
  [System.Text.UTF8Encoding]::new($false)
)
$tarHash = (Get-FileHash -LiteralPath $tarPath -Algorithm SHA256).Hash.ToLowerInvariant()
$manifestHash = (Get-FileHash -LiteralPath $recordPath -Algorithm SHA256).Hash.ToLowerInvariant()
$checksumLines = @(
  "$tarHash  $(Split-Path $tarPath -Leaf)"
  "$sourceHash  $(Split-Path $sourceTarPath -Leaf)"
  "$manifestHash  $(Split-Path $recordPath -Leaf)"
)
[System.IO.File]::WriteAllText(
  $checksumPath,
  ($checksumLines -join "`n") + "`n",
  [System.Text.Encoding]::ASCII
)
Remove-Item -LiteralPath $buildLockPath

Write-Output "RELEASE_COMMIT=$ReleaseCommit"
foreach ($recordImage in $records) { Write-Output "$($recordImage.variable)=$($recordImage.reference)" }
Write-Output "ARTIFACT=$tarPath"
Write-Output "SHA256=$tarHash"
