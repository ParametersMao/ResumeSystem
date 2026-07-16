function Assert-SafeTarMemberPath {
  param([Parameter(Mandatory = $true)][string]$MemberPath)

  if ($MemberPath -notmatch '^[A-Za-z0-9._/-]+$' -or
      $MemberPath.StartsWith('/') -or
      $MemberPath.Split('/') -contains '..') {
    throw "Unsafe archive member: $MemberPath"
  }
}

function New-DeterministicGitArchive {
  param(
    [Parameter(Mandatory = $true)][string]$RepositoryPath,
    [Parameter(Mandatory = $true)][string]$ReleaseCommit,
    [Parameter(Mandatory = $true)][string]$ArchivePath
  )

  if ($ReleaseCommit -cnotmatch '^[0-9a-f]{40}$') {
    throw 'ReleaseCommit must be the full lowercase 40-character Git commit'
  }
  $resolvedRepository = [System.IO.Path]::GetFullPath($RepositoryPath)
  if (-not (Test-Path -LiteralPath $resolvedRepository -PathType Container)) {
    throw "Git repository does not exist: $resolvedRepository"
  }
  $resolvedArchive = [System.IO.Path]::GetFullPath($ArchivePath)
  $gitArguments = @(
    '-C', $resolvedRepository,
    '-c', 'core.autocrlf=false',
    '-c', 'core.eol=lf',
    'archive', '--format=tar', "--output=$resolvedArchive", $ReleaseCommit
  )
  & git @gitArguments
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $resolvedArchive -PathType Leaf)) {
    throw "Deterministic Git archive failed for $ReleaseCommit"
  }
}

function Get-GitBlobSha256 {
  param(
    [Parameter(Mandatory = $true)][string]$RepositoryPath,
    [Parameter(Mandatory = $true)][string]$ReleaseCommit,
    [Parameter(Mandatory = $true)][string]$MemberPath
  )

  if ($ReleaseCommit -cnotmatch '^[0-9a-f]{40}$') {
    throw 'ReleaseCommit must be the full lowercase 40-character Git commit'
  }
  Assert-SafeTarMemberPath -MemberPath $MemberPath
  $resolvedRepository = [System.IO.Path]::GetFullPath($RepositoryPath)
  if ($resolvedRepository.Contains('"')) {
    throw 'Git repository path contains an unsafe quote character'
  }
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = 'git'
  $startInfo.Arguments = "-C `"$resolvedRepository`" cat-file blob `"${ReleaseCommit}:$MemberPath`""
  $startInfo.UseShellExecute = $false
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true
  $startInfo.CreateNoWindow = $true
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $startInfo
  if (-not $process.Start()) {
    throw "Could not read Git blob: $MemberPath"
  }
  $sha256 = [System.Security.Cryptography.SHA256]::Create()
  try {
    $digestBytes = $sha256.ComputeHash($process.StandardOutput.BaseStream)
    $errorText = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) {
      throw "Git blob could not be read: $MemberPath ($errorText)"
    }
    return ([System.BitConverter]::ToString($digestBytes)).Replace('-', '').ToLowerInvariant()
  } finally {
    $sha256.Dispose()
    $process.Dispose()
  }
}

function Get-TarArchiveMemberSha256 {
  param(
    [Parameter(Mandatory = $true)][string]$ArchivePath,
    [Parameter(Mandatory = $true)][string]$MemberPath
  )

  if (-not (Test-Path -LiteralPath $ArchivePath -PathType Leaf)) {
    throw "Archive does not exist: $ArchivePath"
  }
  Assert-SafeTarMemberPath -MemberPath $MemberPath
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = 'tar'
  $startInfo.Arguments = "-xOf `"$ArchivePath`" `"$MemberPath`""
  $startInfo.UseShellExecute = $false
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true
  $startInfo.CreateNoWindow = $true
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $startInfo
  if (-not $process.Start()) {
    throw "Could not start tar for $MemberPath"
  }
  $sha256 = [System.Security.Cryptography.SHA256]::Create()
  try {
    $digestBytes = $sha256.ComputeHash($process.StandardOutput.BaseStream)
    $errorText = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) {
      throw "Archive member could not be read: $MemberPath ($errorText)"
    }
    return ([System.BitConverter]::ToString($digestBytes)).Replace('-', '').ToLowerInvariant()
  } finally {
    $sha256.Dispose()
    $process.Dispose()
  }
}

function Get-TarArchiveMemberText {
  param(
    [Parameter(Mandatory = $true)][string]$ArchivePath,
    [Parameter(Mandatory = $true)][string]$MemberPath
  )

  if (-not (Test-Path -LiteralPath $ArchivePath -PathType Leaf)) {
    throw "Archive does not exist: $ArchivePath"
  }
  Assert-SafeTarMemberPath -MemberPath $MemberPath
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = 'tar'
  $startInfo.Arguments = "-xOf `"$ArchivePath`" `"$MemberPath`""
  $startInfo.UseShellExecute = $false
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true
  $startInfo.CreateNoWindow = $true
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $startInfo
  if (-not $process.Start()) {
    throw "Could not start tar for $MemberPath"
  }
  try {
    $text = $process.StandardOutput.ReadToEnd()
    $errorText = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) {
      throw "Archive member could not be read: $MemberPath ($errorText)"
    }
    return $text
  } finally {
    $process.Dispose()
  }
}

function Assert-TarArchiveMemberUsesLf {
  param(
    [Parameter(Mandatory = $true)][string]$ArchivePath,
    [Parameter(Mandatory = $true)][string]$MemberPath
  )

  $text = Get-TarArchiveMemberText -ArchivePath $ArchivePath -MemberPath $MemberPath
  if ($text.Contains("`r") -or -not $text.EndsWith("`n")) {
    throw "Shell-sourced archive member must use LF line endings: $MemberPath"
  }
}

function Resolve-DockerSaveImageRecords {
  param(
    [Parameter(Mandatory = $true)][string]$ArchivePath,
    [Parameter(Mandatory = $true)][object[]]$Records,
    [Parameter(Mandatory = $true)][string]$ReleaseCommit,
    [Parameter(Mandatory = $true)][string]$ReleaseVersion
  )

  if ($ReleaseCommit -cnotmatch '^[0-9a-f]{40}$') {
    throw 'ReleaseCommit must be a full lowercase Git commit'
  }
  if ($ReleaseVersion -notmatch '^\d+\.\d+\.\d+$') {
    throw 'ReleaseVersion must be semantic x.y.z'
  }
  $archiveMembers = @(& tar -tf $ArchivePath)
  if ($LASTEXITCODE -ne 0) {
    throw "Docker image archive could not be listed: $ArchivePath"
  }
  if (@($archiveMembers | Where-Object { [string]$_ -ceq 'manifest.json' }).Count -ne 1) {
    throw 'Docker image archive must contain exactly one top-level manifest.json'
  }
  try {
    $parsedManifest = Get-TarArchiveMemberText `
      -ArchivePath $ArchivePath -MemberPath 'manifest.json' |
        ConvertFrom-Json -ErrorAction Stop
    $dockerManifest = @($parsedManifest | ForEach-Object { $_ })
  } catch {
    throw "Docker image archive manifest.json is invalid: $($_.Exception.Message)"
  }
  if ($dockerManifest.Count -eq 0) {
    throw 'Docker image archive manifest.json is empty'
  }

  foreach ($record in $Records) {
    $reference = [string]$record.reference
    $kind = [string]$record.kind
    if ([string]::IsNullOrWhiteSpace($reference) -or $kind -notin @('app', 'vendor')) {
      throw 'Image record is missing a reference or valid kind'
    }
    $tagMatches = @($dockerManifest | Where-Object {
      $candidateTags = @($_.RepoTags)
      @($candidateTags | Where-Object { [string]$_ -ceq $reference }).Count -gt 0
    })
    if ($tagMatches.Count -ne 1) {
      throw "Docker image archive must map $reference to exactly one manifest entry"
    }
    $configMember = [string]$tagMatches[0].Config
    $configDigest = ''
    if ($configMember -cmatch '^blobs/sha256/([0-9a-f]{64})$') {
      $configDigest = $matches[1]
    } elseif ($configMember -cmatch '^([0-9a-f]{64})[.]json$') {
      $configDigest = $matches[1]
    } else {
      throw "Docker image archive has an unsafe Config member for ${reference}: $configMember"
    }
    Assert-SafeTarMemberPath -MemberPath $configMember
    if (@($archiveMembers | Where-Object { [string]$_ -ceq $configMember }).Count -ne 1) {
      throw "Docker image Config member must exist exactly once: $configMember"
    }
    $actualConfigDigest = Get-TarArchiveMemberSha256 `
      -ArchivePath $ArchivePath -MemberPath $configMember
    if ($actualConfigDigest -cne $configDigest) {
      throw "Docker image Config digest mismatch for ${reference}: $configMember"
    }
    try {
      $config = Get-TarArchiveMemberText `
        -ArchivePath $ArchivePath -MemberPath $configMember |
          ConvertFrom-Json -ErrorAction Stop
    } catch {
      throw "Docker image Config JSON is invalid for ${reference}: $($_.Exception.Message)"
    }
    if ([string]$config.os -cne 'linux' -or
        [string]$config.architecture -cne 'amd64') {
      throw "Docker image Config is not linux/amd64: $reference"
    }
    if ($kind -eq 'app') {
      $revision = [string]$config.config.Labels.'org.opencontainers.image.revision'
      $imageVersion = [string]$config.config.Labels.'org.opencontainers.image.version'
      if ($revision -cne $ReleaseCommit -or $imageVersion -cne $ReleaseVersion) {
        throw "Docker image Config provenance does not match release commit/version: $reference"
      }
    }
    $record.imageId = "sha256:$configDigest"
    $record.os = 'linux'
    $record.architecture = 'amd64'
  }

  return $Records
}
