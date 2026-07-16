param(
  [Parameter(Mandatory = $true)][string]$AgentImage,
  [Parameter(Mandatory = $true)][string]$QdrantImage,
  [Parameter(Mandatory = $true)][string]$FixturePath
)

Set-StrictMode -Version Latest
# Windows PowerShell turns native stderr into non-terminating ErrorRecords.
# Capture it and decide exclusively from the process exit code so harmless
# Docker warnings cannot abort the release test.
$ErrorActionPreference = 'Continue'

if (-not (Test-Path -LiteralPath $FixturePath -PathType Leaf)) {
  throw 'Canonical fixture file is missing'
}

$suffix = "$PID-$([Guid]::NewGuid().ToString('N').Substring(0, 8))"
$network = "resumesystem-fixture-memory-$suffix"
$agentContainer = "resumesystem-fixture-agent-$suffix"
$qdrantContainer = "resumesystem-fixture-qdrant-$suffix"
$modelVolume = "resumesystem_fixture_models_$suffix"
$documentId = 987656
$networkCreated = $false
$modelVolumeCreated = $false
$qdrantContainerCreated = $false
$agentContainerCreated = $false

function Invoke-DockerCapture {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)
  $output = (& docker @Arguments 2>&1 | Out-String).Trim()
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    $operation = if ($Arguments.Count -gt 0) { $Arguments[0] } else { 'unknown' }
    throw "Docker $operation failed with exit code $exitCode"
  }
  return $output
}

function Test-AgentReady {
  $healthAssertion = "import json,sys,urllib.request; response=urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3); payload=json.load(response); rag=payload.get('rag'); sys.exit(0 if response.status == 200 and payload.get('status') == 'ok' and isinstance(rag, dict) and rag.get('embedding_backend') == 'fastembed' and rag.get('embedding_model') == 'BAAI/bge-small-zh-v1.5' and rag.get('qdrant_reachable') is True and rag.get('collection_ready') is True else 1)"
  # Keep the assertion itself lightweight: it must inspect the already-warm
  # PID 1 service without importing app.rag or loading another ONNX runtime.
  & docker exec $agentContainer python -c $healthAssertion *> $null
  return $LASTEXITCODE -eq 0
}

function Invoke-DockerCleanup {
  param(
    [Parameter(Mandatory = $true)][string]$Description,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )
  try {
    & docker @Arguments *> $null
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
      return "$Description (exit code $exitCode)"
    }
  } catch {
    return "$Description (cleanup command could not be executed)"
  }
  return $null
}

function Remove-TestResources {
  $failures = @()
  $cleanupTargets = @(
    @($agentContainerCreated, 'agent container', @('rm', '-f', $agentContainer)),
    @($qdrantContainerCreated, 'qdrant container', @('rm', '-f', $qdrantContainer)),
    @($networkCreated, 'test network', @('network', 'rm', $network)),
    @($modelVolumeCreated, 'model volume', @('volume', 'rm', $modelVolume))
  )
  foreach ($target in $cleanupTargets) {
    if (-not [bool]$target[0]) { continue }
    $failure = Invoke-DockerCleanup `
      -Description ([string]$target[1]) `
      -Arguments ([string[]]$target[2])
    if ($null -ne $failure) { $failures += $failure }
  }
  return $failures
}

$primaryFailure = $null
$cleanupFailures = @()
$successMessage = ''
try {
  [void](Invoke-DockerCapture @('network', 'create', $network))
  $networkCreated = $true
  [void](Invoke-DockerCapture @('volume', 'create', $modelVolume))
  $modelVolumeCreated = $true
  [void](Invoke-DockerCapture @(
      'run', '-d', '--name', $qdrantContainer,
      '--network', $network, '--memory', '256m', '--cpus', '0.5',
      $QdrantImage
    ))
  $qdrantContainerCreated = $true
  [void](Invoke-DockerCapture @(
      'run', '-d', '--name', $agentContainer,
      '--network', $network, '--memory', '512m', '--cpus', '1.0',
      '-e', 'RAG_ENABLED=true',
      '-e', 'RAG_STRICT_SOURCES=true',
      '-e', 'EMBEDDING_BACKEND=fastembed',
      '-e', 'EMBEDDING_MODEL=BAAI/bge-small-zh-v1.5',
      '-e', 'FASTEMBED_CACHE_PATH=/models/fastembed/current',
      '-e', "QDRANT_URL=http://${qdrantContainer}:6333",
      '-e', 'QDRANT_COLLECTION=resume_knowledge_fixture_memory_test',
      '-e', 'AGENT_INTERNAL_SECRET=isolated-release-memory-test-only',
      '-v', "${modelVolume}:/models/fastembed",
      $AgentImage
    ))
  $agentContainerCreated = $true

  $ready = $false
  $deadline = (Get-Date).AddMinutes(5)
  while ((Get-Date) -lt $deadline) {
    if (Test-AgentReady) {
      $ready = $true
      break
    }
    $state = Invoke-DockerCapture @(
      'inspect', $agentContainer, '--format', '{{.State.Status}}'
    )
    if ($state -ne 'running') { break }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) {
    throw 'Agent did not finish real FastEmbed startup under 512 MiB'
  }

  [void](Invoke-DockerCapture @(
      'cp', $FixturePath, "${agentContainer}:/tmp/resume-writing-standard-v1.md"
    ))
  $index = Invoke-DockerCapture @(
    'exec', $agentContainer,
    'timeout', '--signal=TERM', '--kill-after=10s', '210s',
    'python', 'scripts/bootstrap_fixture.py',
    'index', [string]$documentId, '/tmp/resume-writing-standard-v1.md'
  )
  if ($index -notmatch '^OK\|987656\|([1-9][0-9]*)\|fastembed\|BAAI/bge-small-zh-v1[.]5$') {
    throw 'Canonical fixture index response is invalid'
  }
  $chunkCount = $Matches[1]
  $probe = Invoke-DockerCapture @(
    'exec', $agentContainer,
    'timeout', '--signal=TERM', '--kill-after=10s', '150s',
    'python', 'scripts/health_probe_client.py',
    [string]$documentId, [string]$chunkCount, '120'
  )
  $probeParts = @($probe -split '\|')
  $denseScore = 0.0
  $minimumCosine = 0.0
  $validProbe = $probeParts.Count -eq 7 `
    -and $probeParts[0] -ceq 'OK' `
    -and $probeParts[1] -ceq [string]$documentId `
    -and $probeParts[2] -ceq [string]$chunkCount `
    -and $probeParts[3] -cmatch '^[0-9a-f]{64}$' `
    -and [double]::TryParse(
      $probeParts[4], [Globalization.NumberStyles]::Float,
      [Globalization.CultureInfo]::InvariantCulture, [ref]$denseScore
    ) `
    -and [double]::TryParse(
      $probeParts[5], [Globalization.NumberStyles]::Float,
      [Globalization.CultureInfo]::InvariantCulture, [ref]$minimumCosine
    ) `
    -and $denseScore -ge 0.995 `
    -and $minimumCosine -ge 0.995 `
    -and $probeParts[6] -cmatch '^987656:[0-9]+$'
  if (-not $validProbe) {
    throw 'Canonical fixture dense attestation is invalid'
  }

  $state = Invoke-DockerCapture @(
    'inspect', $agentContainer, '--format',
    '{{.State.Status}}|{{.RestartCount}}|{{.State.OOMKilled}}|{{.HostConfig.Memory}}'
  )
  if ($state -ne 'running|0|false|536870912') {
    throw "Agent state violates the 512 MiB release gate: $state"
  }
  $memoryEvents = Invoke-DockerCapture @(
    'exec', $agentContainer, 'sh', '-c',
    'cat /sys/fs/cgroup/memory.events 2>/dev/null || true'
  )
  if ($memoryEvents -match '(?m)^oom(_kill|_group_kill)?\s+[1-9][0-9]*$') {
    throw 'Agent cgroup recorded an OOM event during fixture indexing'
  }
  $memoryPercentText = (Invoke-DockerCapture @(
      'stats', '--no-stream', '--format', '{{.MemPerc}}', $agentContainer
    )).TrimEnd('%')
  $memoryPercent = 0.0
  if (-not [double]::TryParse(
      $memoryPercentText,
      [Globalization.NumberStyles]::Float,
      [Globalization.CultureInfo]::InvariantCulture,
      [ref]$memoryPercent
    )) {
    throw 'Agent memory percentage could not be parsed'
  }
  if ($memoryPercent -ge 90.0) {
    throw "Agent memory usage is too close to its cgroup limit: $memoryPercent%"
  }

  $successMessage = "agent-fixture-memory: passed (chunks=$chunkCount, memory=$memoryPercent%, restart=0, oom=0)"
} catch {
  $primaryFailure = $_
} finally {
  try {
    $cleanupFailures = @(Remove-TestResources)
  } catch {
    $cleanupFailures = @('cleanup routine failed unexpectedly')
  }
}

if ($null -ne $primaryFailure) {
  if ($cleanupFailures.Count -gt 0) {
    Write-Warning -WarningAction Continue -Message (
      'Test resource cleanup also failed: ' + ($cleanupFailures -join '; ')
    )
  }
  throw $primaryFailure
}
if ($cleanupFailures.Count -gt 0) {
  throw (
    'Agent fixture memory assertions passed, but resource cleanup failed: ' +
    ($cleanupFailures -join '; ')
  )
}
Write-Output $successMessage
