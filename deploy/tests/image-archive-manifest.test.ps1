$ErrorActionPreference = 'Stop'
$repoRoot = if ($env:REPO_ROOT) { $env:REPO_ROOT } else { (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path }
. (Join-Path $repoRoot 'deploy/image-archive-manifest.ps1')

function Assert-Equal {
  param([object]$Actual, [object]$Expected, [string]$Message)
  if ([string]$Actual -cne [string]$Expected) {
    throw "$Message (actual=$Actual expected=$Expected)"
  }
}

function Assert-ThrowsLike {
  param([scriptblock]$Action, [string]$Pattern)
  $didThrow = $false
  try {
    & $Action
  } catch {
    $didThrow = $true
    if ($_.Exception.Message -notlike $Pattern) {
      throw "Unexpected error: $($_.Exception.Message)"
    }
  }
  if (-not $didThrow) { throw "Expected an error matching: $Pattern" }
}

$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) "resumesystem-image-archive-$([guid]::NewGuid().ToString('N'))"
$contentRoot = Join-Path $testRoot 'content with space'
$blobRoot = Join-Path $contentRoot 'blobs/sha256'
$archive = Join-Path $testRoot 'images with space.tar'
$commit = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
$version = '1.3.4'
New-Item -ItemType Directory -Force -Path $blobRoot | Out-Null

try {
  $appConfig = [ordered]@{
    architecture = 'amd64'
    os = 'linux'
    config = @{ Labels = @{
      'org.opencontainers.image.revision' = $commit
      'org.opencontainers.image.version' = $version
    } }
  } | ConvertTo-Json -Depth 5 -Compress
  $vendorConfig = [ordered]@{
    architecture = 'amd64'
    os = 'linux'
    config = @{}
  } | ConvertTo-Json -Depth 3 -Compress
  $appTemp = Join-Path $testRoot 'app-config.json'
  $vendorTemp = Join-Path $testRoot 'vendor-config.json'
  [System.IO.File]::WriteAllText($appTemp, $appConfig, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText($vendorTemp, $vendorConfig, [System.Text.UTF8Encoding]::new($false))
  $appDigest = (Get-FileHash $appTemp -Algorithm SHA256).Hash.ToLowerInvariant()
  $vendorDigest = (Get-FileHash $vendorTemp -Algorithm SHA256).Hash.ToLowerInvariant()
  Copy-Item $appTemp (Join-Path $blobRoot $appDigest)
  Copy-Item $vendorTemp (Join-Path $blobRoot $vendorDigest)
  Copy-Item $vendorTemp (Join-Path $contentRoot "$vendorDigest.json")
  $manifest = @(
    @{ Config = "blobs/sha256/$appDigest"; RepoTags = @('fixture_app:test'); Layers = @() }
    @{ Config = "blobs/sha256/$vendorDigest"; RepoTags = @('fixture_vendor:test'); Layers = @() }
    @{ Config = "$vendorDigest.json"; RepoTags = @('fixture_classic:test'); Layers = @() }
  ) | ConvertTo-Json -Depth 5 -Compress
  [System.IO.File]::WriteAllText(
    (Join-Path $contentRoot 'manifest.json'), $manifest,
    [System.Text.UTF8Encoding]::new($false)
  )
  & tar -cf $archive -C $contentRoot manifest.json blobs "$vendorDigest.json"
  if ($LASTEXITCODE -ne 0) { throw 'Could not create image archive fixture' }

  $records = @(
    [ordered]@{ reference = 'fixture_app:test'; imageId = 'sha256:wrong'; kind = 'app'; os = ''; architecture = '' }
    [ordered]@{ reference = 'fixture_vendor:test'; imageId = 'sha256:wrong'; kind = 'vendor'; os = ''; architecture = '' }
    [ordered]@{ reference = 'fixture_classic:test'; imageId = 'sha256:wrong'; kind = 'vendor'; os = ''; architecture = '' }
  )
  $resolved = @(Resolve-DockerSaveImageRecords `
    -ArchivePath $archive -Records $records `
    -ReleaseCommit $commit -ReleaseVersion $version)
  Assert-Equal $resolved.Count 3 'Expected three resolved image records'
  Assert-Equal $resolved[0].imageId "sha256:$appDigest" 'App Config digest was not canonicalized'
  Assert-Equal $resolved[1].imageId "sha256:$vendorDigest" 'Vendor Config digest was not canonicalized'
  Assert-Equal $resolved[2].imageId "sha256:$vendorDigest" 'Classic Config digest was not canonicalized'
  Assert-Equal $resolved[0].os 'linux' 'App OS was not verified'
  Assert-Equal $resolved[0].architecture 'amd64' 'App architecture was not verified'

  $duplicateRoot = Join-Path $testRoot 'duplicate'
  New-Item -ItemType Directory -Force -Path (Join-Path $duplicateRoot 'blobs/sha256') | Out-Null
  Copy-Item (Join-Path $blobRoot $appDigest) (Join-Path $duplicateRoot "blobs/sha256/$appDigest")
  @(
    @{ Config = "blobs/sha256/$appDigest"; RepoTags = @('fixture_app:test'); Layers = @() }
    @{ Config = "blobs/sha256/$appDigest"; RepoTags = @('fixture_app:test'); Layers = @() }
  ) | ConvertTo-Json -Depth 5 -Compress | Set-Content -NoNewline -Encoding utf8 (Join-Path $duplicateRoot 'manifest.json')
  $duplicateArchive = Join-Path $testRoot 'duplicate.tar'
  & tar -cf $duplicateArchive -C $duplicateRoot manifest.json blobs
  Assert-ThrowsLike {
    Resolve-DockerSaveImageRecords -ArchivePath $duplicateArchive `
      -Records @([ordered]@{ reference = 'fixture_app:test'; imageId = ''; kind = 'app'; os = ''; architecture = '' }) `
      -ReleaseCommit $commit -ReleaseVersion $version
  } '*exactly one manifest entry*'

  $unsafeRoot = Join-Path $testRoot 'unsafe'
  New-Item -ItemType Directory -Force -Path $unsafeRoot | Out-Null
  @(
    @{ Config = '../outside.json'; RepoTags = @('fixture_vendor:test'); Layers = @() }
  ) | ConvertTo-Json -Depth 5 -Compress | Set-Content -NoNewline -Encoding utf8 (Join-Path $unsafeRoot 'manifest.json')
  $unsafeArchive = Join-Path $testRoot 'unsafe.tar'
  & tar -cf $unsafeArchive -C $unsafeRoot manifest.json
  Assert-ThrowsLike {
    Resolve-DockerSaveImageRecords -ArchivePath $unsafeArchive `
      -Records @([ordered]@{ reference = 'fixture_vendor:test'; imageId = ''; kind = 'vendor'; os = ''; architecture = '' }) `
      -ReleaseCommit $commit -ReleaseVersion $version
  } '*unsafe Config member*'

  $mismatchRoot = Join-Path $testRoot 'mismatch'
  $mismatchDigest = '0000000000000000000000000000000000000000000000000000000000000000'
  New-Item -ItemType Directory -Force -Path (Join-Path $mismatchRoot 'blobs/sha256') | Out-Null
  Copy-Item $vendorTemp (Join-Path $mismatchRoot "blobs/sha256/$mismatchDigest")
  @(
    @{ Config = "blobs/sha256/$mismatchDigest"; RepoTags = @('fixture_vendor:test'); Layers = @() }
  ) | ConvertTo-Json -Depth 5 -Compress | Set-Content -NoNewline -Encoding utf8 (Join-Path $mismatchRoot 'manifest.json')
  $mismatchArchive = Join-Path $testRoot 'mismatch.tar'
  & tar -cf $mismatchArchive -C $mismatchRoot manifest.json blobs
  Assert-ThrowsLike {
    Resolve-DockerSaveImageRecords -ArchivePath $mismatchArchive `
      -Records @([ordered]@{ reference = 'fixture_vendor:test'; imageId = ''; kind = 'vendor'; os = ''; architecture = '' }) `
      -ReleaseCommit $commit -ReleaseVersion $version
  } '*Config digest mismatch*'

  Assert-ThrowsLike {
    Resolve-DockerSaveImageRecords -ArchivePath $archive `
      -Records @([ordered]@{ reference = 'fixture_app:test'; imageId = ''; kind = 'app'; os = ''; architecture = '' }) `
      -ReleaseCommit 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' -ReleaseVersion $version
  } '*provenance does not match*'

  Write-Output 'image-archive-manifest.test: passed'
} finally {
  Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue
}
