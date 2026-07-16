#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
PUBLIC_HOST="${PUBLIC_HOST:-aidana.top}"
CORS_PROBE_ORIGIN="${CORS_PROBE_ORIGIN:-http://121.43.208.184}"
REQUIRE_PUBLIC_HTTPS="${REQUIRE_PUBLIC_HTTPS:-true}"
MAX_DISK_PERCENT="${MAX_DISK_PERCENT:-85}"
RAG_HEALTH_PROBE_TIMEOUT_SECONDS="${RAG_HEALTH_PROBE_TIMEOUT_SECONDS:-60}"
RAG_HEALTH_PROBE_ATTEMPTS="${RAG_HEALTH_PROBE_ATTEMPTS:-1}"
REQUIRE_LIVE_LLM_PROBE="${REQUIRE_LIVE_LLM_PROBE:-false}"
failures=()
CERT_FILE="${CERT_FILE:-/etc/letsencrypt/live/aidana.top/fullchain.pem}"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

[[ "${AI_ENABLED:-}" == "true" ]] || failures+=("AI_ENABLED must be true")
[[ "${AI_EXECUTION_ENGINE:-}" == "agent" ]] || failures+=("AI_EXECUTION_ENGINE must be agent")
[[ "${AGENT_EXECUTION_MODE:-}" == "live" ]] || failures+=("AGENT_EXECUTION_MODE must be live")
[[ "${AI_PROVIDER:-}" == "deepseek" ]] || failures+=("AI_PROVIDER must be deepseek")
deepseek_api_url="${OPENAI_API_URL:-}"
[[ "${deepseek_api_url%/}" == "https://api.deepseek.com" ]] \
  || failures+=("OPENAI_API_URL must be the official DeepSeek API")
[[ "${OPENAI_MODEL:-}" == "deepseek-v4-pro" ]] \
  || failures+=("OPENAI_MODEL must be deepseek-v4-pro")
[[ "${RAG_ENABLED:-}" == "true" ]] || failures+=("RAG_ENABLED must be true")
[[ "${RAG_STRICT_SOURCES:-}" == "true" ]] || failures+=("RAG_STRICT_SOURCES must be true")
[[ "${EMBEDDING_BACKEND:-}" == "fastembed" ]] \
  || failures+=("EMBEDDING_BACKEND must be fastembed")
[[ "${EMBEDDING_MODEL:-}" == "BAAI/bge-small-zh-v1.5" ]] \
  || failures+=("EMBEDDING_MODEL must match the baked BAAI/bge-small-zh-v1.5 artifact")

# Fixed production safety floor for the 2 GiB host. Do not let an environment
# file silently weaken the release's memory-pressure policy.
MIN_HOST_MEMORY_MB=1800
MIN_AVAILABLE_MEMORY_MB=256
MIN_SWAP_TOTAL_MB=1536
MIN_SWAP_FREE_MB=512
MIN_EFFECTIVE_AVAILABLE_MEMORY_MB=1024
MAX_CONTAINER_MEMORY_PERCENT=90
MAX_CONTAINER_RESTARTS=0

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_MANIFEST_FILE="$SCRIPT_DIR/release-manifest.env"
EXPECTED_AGENT_VERSION=""
RELEASE_VERSION=""
if [[ -f "$RELEASE_MANIFEST_FILE" ]]; then
  manifest_cr_status=0
  LC_ALL=C grep -q $'\r' "$RELEASE_MANIFEST_FILE" || manifest_cr_status=$?
  if [[ "$manifest_cr_status" == 0 ]]; then
    failures+=("release manifest must use LF line endings and match the Git blob")
  elif [[ "$manifest_cr_status" != 1 ]]; then
    failures+=("release manifest line endings could not be validated")
  fi
  EXPECTED_AGENT_VERSION="$(awk -F= '$1 == "AGENT_VERSION" {print $2}' "$RELEASE_MANIFEST_FILE" | tail -1 | tr -d '\r')"
  RELEASE_VERSION="$(awk -F= '$1 == "RELEASE_VERSION" {print $2}' "$RELEASE_MANIFEST_FILE" | tail -1 | tr -d '\r')"
else
  failures+=("release manifest is missing")
fi

[[ "$EXPECTED_AGENT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] \
  || failures+=("release manifest has an invalid AGENT_VERSION")
[[ "$RELEASE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] \
  || failures+=("release manifest has an invalid RELEASE_VERSION")

release_short="${RELEASE_COMMIT:-}"
release_short="${release_short:0:12}"
[[ "${RELEASE_COMMIT:-}" =~ ^[0-9a-f]{40}$ ]] \
  || failures+=("RELEASE_COMMIT must be a full lowercase Git commit")
expected_release_tag="v${RELEASE_VERSION}-${release_short}"
declare -A expected_images=(
  [resume-mysql]="${MYSQL_IMAGE:-}"
  [resume-backend]="${BACKEND_IMAGE:-}"
  [resume-web]="${WEB_IMAGE:-}"
  [resume-admin]="${ADMIN_IMAGE:-}"
  [resume-proxy]="${NGINX_IMAGE:-}"
  [resume-agent]="${AGENT_IMAGE:-}"
  [resume-qdrant]="${QDRANT_IMAGE:-}"
)
declare -A image_variables=(
  [resume-mysql]=MYSQL_IMAGE
  [resume-backend]=BACKEND_IMAGE
  [resume-web]=WEB_IMAGE
  [resume-admin]=ADMIN_IMAGE
  [resume-proxy]=NGINX_IMAGE
  [resume-agent]=AGENT_IMAGE
  [resume-qdrant]=QDRANT_IMAGE
)
declare -A expected_memory_limits_mb=(
  [resume-mysql]=448
  [resume-backend]=512
  [resume-web]=64
  [resume-admin]=64
  [resume-proxy]=64
  [resume-agent]=512
  [resume-qdrant]=256
)
runtime_containers=(
  resume-proxy resume-web resume-admin resume-backend resume-agent
  resume-qdrant resume-mysql
)

artifact_manifest="$(readlink -f "${RELEASE_ARTIFACT_MANIFEST:-/missing}" 2>/dev/null || true)"
artifact_checksums="$(readlink -f "${RELEASE_ARTIFACT_CHECKSUMS:-/missing}" 2>/dev/null || true)"
artifact_rows=""
if [[ ! -f "$artifact_manifest" || ! -f "$artifact_checksums" \
  || "$(dirname "$artifact_manifest")" != "$(dirname "$artifact_checksums")" ]]; then
  failures+=("release artifact manifest/checksums are missing")
else
  manifest_name="$(basename "$artifact_manifest")"
  manifest_checksum="$(tr -d '\r' < "$artifact_checksums" \
    | grep -E "^[0-9a-f]{64}  ${manifest_name//./\\.}$" || true)"
  if [[ -z "$manifest_checksum" ]] \
    || ! (cd "$(dirname "$artifact_manifest")" && printf '%s\n' "$manifest_checksum" | sha256sum -c - >/dev/null 2>&1); then
    failures+=("release artifact manifest checksum failed")
  fi
  compose_sha256="$(sha256sum "$SCRIPT_DIR/../docker-compose.prod.yml" 2>/dev/null | awk '{print $1}')"
  if ! artifact_rows="$(python3 - "$artifact_manifest" "${RELEASE_COMMIT:-}" "$RELEASE_VERSION" "$compose_sha256" "$SCRIPT_DIR/.." <<'PY'
import hashlib
import json
from pathlib import Path
import re
import sys

path, commit, version, compose_hash, release_dir = sys.argv[1:]
with open(path, encoding="utf-8") as handle:
    manifest = json.load(handle)
if (manifest.get("releaseCommit"), manifest.get("releaseVersion"), manifest.get("composeSha256")) != (commit, version, compose_hash):
    raise SystemExit(1)
release_root = Path(release_dir).resolve()
runtime_files = manifest.get("runtimeFiles")
if not isinstance(runtime_files, dict) or not runtime_files:
    raise SystemExit(1)
for relative_name, expected_hash in runtime_files.items():
    candidate = (release_root / relative_name).resolve()
    if release_root not in candidate.parents or not candidate.is_file():
        raise SystemExit(1)
    digest = hashlib.sha256(candidate.read_bytes()).hexdigest()
    if digest != expected_hash:
        raise SystemExit(1)
expected = {"MYSQL_IMAGE", "BACKEND_IMAGE", "WEB_IMAGE", "ADMIN_IMAGE", "NGINX_IMAGE", "AGENT_IMAGE", "QDRANT_IMAGE"}
seen = set()
for item in manifest.get("images") or []:
    variable, reference, image_id, kind = (item.get(key) for key in ("variable", "reference", "imageId", "kind"))
    if variable not in expected or variable in seen or kind not in {"app", "vendor"}:
        raise SystemExit(1)
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", str(image_id)):
        raise SystemExit(1)
    if kind == "app" and (item.get("revision") != commit or item.get("version") != version):
        raise SystemExit(1)
    seen.add(variable)
    print(variable, reference, image_id, kind, sep="\t")
if seen != expected:
    raise SystemExit(1)
PY
)"; then
    failures+=("release artifact manifest contract failed")
    artifact_rows=""
  fi
fi
declare -A artifact_refs=()
declare -A artifact_ids=()
declare -A artifact_kinds=()
while IFS=$'\t' read -r variable reference image_id kind; do
  [[ -n "$variable" ]] || continue
  artifact_refs[$variable]="$reference"
  artifact_ids[$variable]="$image_id"
  artifact_kinds[$variable]="$kind"
done <<< "$artifact_rows"

for name in "${!expected_images[@]}"; do
  expected_image="${expected_images[$name]}"
  variable="${image_variables[$name]}"
  [[ "$expected_image" == "${artifact_refs[$variable]:-}" \
    && "$expected_image" == *":${expected_release_tag}" ]] \
    || failures+=("$name image reference is not the immutable ${expected_release_tag} tag")
  configured_image="$(docker inspect "$name" --format '{{.Config.Image}}' 2>/dev/null || true)"
  running_image="$(docker inspect "$name" --format '{{.Image}}' 2>/dev/null || true)"
  resolved_image="$(docker image inspect "$expected_image" --format '{{.Id}}' 2>/dev/null || true)"
  [[ "$configured_image" == "$expected_image" ]] \
    || failures+=("$name configured image is ${configured_image:-missing}, expected $expected_image")
  [[ -n "$resolved_image" && "$resolved_image" == "${artifact_ids[$variable]:-}" \
    && "$running_image" == "$resolved_image" ]] \
    || failures+=("$name running image does not match $expected_image")
  if [[ "${artifact_kinds[$variable]:-}" == "app" ]]; then
    provenance="$(docker image inspect "$expected_image" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}|{{index .Config.Labels "org.opencontainers.image.version"}}' 2>/dev/null || true)"
    [[ "$provenance" == "${RELEASE_COMMIT}|${RELEASE_VERSION}" ]] \
      || failures+=("$name image provenance does not match the release")
  fi
done

for name in "${runtime_containers[@]}"; do
  status="$(docker inspect "$name" --format '{{.State.Status}}' 2>/dev/null || true)"
  [[ "$status" == "running" ]] || failures+=("$name is $status")
  health="$(docker inspect "$name" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)"
  [[ "$health" == "none" || "$health" == "healthy" ]] || failures+=("$name health is $health")
  restarts="$(docker inspect "$name" --format '{{.RestartCount}}' 2>/dev/null || echo 999)"
  [[ "$restarts" =~ ^[0-9]+$ && "$restarts" -le "$MAX_CONTAINER_RESTARTS" ]] \
    || failures+=("$name restart count is $restarts (expected ${MAX_CONTAINER_RESTARTS})")
  oom_killed="$(docker inspect "$name" --format '{{.State.OOMKilled}}' 2>/dev/null || true)"
  [[ "$oom_killed" == "false" ]] || failures+=("$name OOMKilled state is ${oom_killed:-missing}")
  configured_limit_bytes="$(docker inspect "$name" --format '{{.HostConfig.Memory}}' 2>/dev/null || true)"
  expected_limit_bytes=$((expected_memory_limits_mb[$name] * 1024 * 1024))
  [[ "$configured_limit_bytes" == "$expected_limit_bytes" ]] \
    || failures+=("$name memory limit is ${configured_limit_bytes:-missing} bytes, expected ${expected_limit_bytes}")
done

# A healthy process can still be one allocation away from an OOM restart.
# Validate live usage against each cgroup limit after all services and the
# FastEmbed model have initialized.
stats_rows="$(timeout 30 docker stats --no-stream \
  --format '{{.Name}}|{{.MemPerc}}' "${runtime_containers[@]}" 2>/dev/null || true)"
declare -A memory_percent_by_container=()
while IFS='|' read -r name memory_percent; do
  [[ -n "$name" ]] || continue
  memory_percent="${memory_percent%\%}"
  memory_percent="${memory_percent//[[:space:]]/}"
  memory_percent_by_container[$name]="$memory_percent"
done <<< "$stats_rows"
for name in "${runtime_containers[@]}"; do
  memory_percent="${memory_percent_by_container[$name]:-}"
  if ! [[ "$memory_percent" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
    failures+=("$name memory utilization is unavailable")
  elif ! awk -v usage="$memory_percent" -v limit="$MAX_CONTAINER_MEMORY_PERCENT" \
    'BEGIN { exit !(usage < limit) }'; then
    failures+=("$name memory utilization is ${memory_percent}% (limit <${MAX_CONTAINER_MEMORY_PERCENT}%)")
  fi
done

backend_status="$(docker exec resume-backend node -e \
  "fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(5000)}).then(async r=>{const j=await r.json(); if(!r.ok||j.status!=='ok')process.exit(1); process.stdout.write(j.status)}).catch(()=>process.exit(1))" \
  2>/dev/null || true)"
[[ "$backend_status" == "ok" ]] || failures+=("backend direct health failed")

agent_status="$(docker exec resume-agent python -c \
  "import json,urllib.request; j=json.load(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)); r=j.get('rag') or {}; enabled=str(r.get('enabled') is True).lower(); ready=str(r.get('collection_ready') is True).lower(); print(f\"{j.get('status','')}|{j.get('version','')}|{enabled}|{r.get('embedding_backend','')}|{r.get('embedding_model','')}|{ready}\")" \
  2>/dev/null || true)"
[[ "$agent_status" == "ok|${EXPECTED_AGENT_VERSION}|true|fastembed|BAAI/bge-small-zh-v1.5|true" ]] \
  || failures+=("agent RAG health/version/model is ${agent_status:-unavailable}, expected baked FastEmbed readiness")

ready_fixture="$(docker exec resume-mysql sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --connect-timeout=5 -N -B -uroot "$MYSQL_DATABASE" -e "$1"' sh \
  "SELECT CONCAT(id, '|', chunk_count, '|', storage_key) FROM knowledge_documents WHERE enabled=1 AND status='ready' AND source_type='standard' AND scope='global' AND chunk_count>0 AND storage_key LIKE 'knowledge/global/bootstrap/%/resume-writing-standard-v1.md' ORDER BY id DESC LIMIT 1;" \
  2>/dev/null || true)"
ready_document_id=""
ready_document_chunks=""
ready_storage_key=""
ready_source_sha256=""
if [[ "$ready_fixture" =~ ^([1-9][0-9]*)\|([1-9][0-9]*)\|(knowledge/global/bootstrap/[0-9a-f]{40}/resume-writing-standard-v1[.]md)$ ]]; then
  ready_document_id="${BASH_REMATCH[1]}"
  ready_document_chunks="${BASH_REMATCH[2]}"
  ready_storage_key="${BASH_REMATCH[3]}"
  ready_source_sha256="$(docker exec resume-backend sha256sum \
    "/app/uploads/$ready_storage_key" 2>/dev/null | awk '{print $1}' || true)"
  [[ "$ready_source_sha256" =~ ^[0-9a-f]{64}$ ]] \
    || failures+=("canonical RAG fixture source file is missing or unreadable")
else
  failures+=("no enabled ready canonical RAG fixture with indexed chunks")
fi

rag_probe_result="NOT_RUN"
rag_probe_budget=0
if ! [[ "$RAG_HEALTH_PROBE_TIMEOUT_SECONDS" =~ ^[0-9]+$ ]] \
  || (( RAG_HEALTH_PROBE_TIMEOUT_SECONDS < 30 || RAG_HEALTH_PROBE_TIMEOUT_SECONDS > 120 )); then
  failures+=("RAG_HEALTH_PROBE_TIMEOUT_SECONDS must be between 30 and 120")
elif ! [[ "$RAG_HEALTH_PROBE_ATTEMPTS" =~ ^[0-9]+$ ]] \
  || (( RAG_HEALTH_PROBE_ATTEMPTS < 1 || RAG_HEALTH_PROBE_ATTEMPTS > 2 )); then
  failures+=("RAG_HEALTH_PROBE_ATTEMPTS must be between 1 and 2")
else
  rag_probe_budget=$((RAG_HEALTH_PROBE_TIMEOUT_SECONDS * RAG_HEALTH_PROBE_ATTEMPTS + 10 * (RAG_HEALTH_PROBE_ATTEMPTS - 1)))
  if (( rag_probe_budget > 120 )); then
    failures+=("RAG health probe total budget must not exceed 120 seconds")
  elif [[ -n "$ready_document_id" ]]; then
    # The probe chooses a ready+enabled global document in MySQL, asks the Agent
    # to derive a query from that exact document's enabled Qdrant payload, and
    # requires hybrid retrieval to return the same document/chunk count. Model
    # initialization is single-flight, so a timed-out client cannot duplicate
    # the ONNX load when the one optional retry begins.
    for ((attempt = 1; attempt <= RAG_HEALTH_PROBE_ATTEMPTS; attempt++)); do
      rag_probe_result="$(docker exec resume-agent python scripts/health_probe_client.py \
        "$ready_document_id" "$ready_document_chunks" "$RAG_HEALTH_PROBE_TIMEOUT_SECONDS" \
        2>/dev/null || echo EXEC_ERROR)"
      if [[ "$rag_probe_result" == "OK|${ready_document_id}|${ready_document_chunks}|${ready_source_sha256}|"* ]]; then
        break
      fi
      if [[ "$rag_probe_result" != "TIMEOUT" && "$rag_probe_result" != "IN_PROGRESS" ]] \
        || [[ "$attempt" -eq "$RAG_HEALTH_PROBE_ATTEMPTS" ]]; then
        break
      fi
      sleep 10
    done
    [[ "$rag_probe_result" == "OK|${ready_document_id}|${ready_document_chunks}|${ready_source_sha256}|"* ]] \
      || failures+=("RAG health probe failed for document ${ready_document_id}: ${rag_probe_result}")
  fi
fi

live_agent_probe="NOT_REQUIRED"
if [[ "$REQUIRE_LIVE_LLM_PROBE" == "true" ]]; then
  if [[ -z "$ready_document_id" ]]; then
    failures+=("live Agent probe has no RAG fixture")
  else
    live_agent_probe="$(timeout 180 docker exec -i resume-agent python - \
      "$ready_document_id" < "$SCRIPT_DIR/live-agent-probe.py" 2>/dev/null || echo EXEC_ERROR)"
    [[ "$live_agent_probe" == "OK|${AI_PROVIDER}|${OPENAI_MODEL}|"* ]] \
      || failures+=("live RAG Agent/LLM probe failed: $live_agent_probe")
  fi
elif [[ "$REQUIRE_LIVE_LLM_PROBE" != "false" ]]; then
  failures+=("REQUIRE_LIVE_LLM_PROBE must be true or false")
fi

web_html="$(docker exec resume-web wget -q -T 5 -O- http://127.0.0.1/ 2>/dev/null || true)"
[[ "$web_html" == *"<div id=\"app\"></div>"* ]] || failures+=("web entry failed")

admin_html="$(docker exec resume-admin wget -q -T 5 -O- http://127.0.0.1/ 2>/dev/null || true)"
admin_asset="$(printf '%s' "$admin_html" | grep -oE '/admin/js/main-[^"]+\.js' | head -1 || true)"
if [[ -z "$admin_asset" ]]; then
  failures+=("admin entry asset is missing or has the wrong base path")
else
  admin_internal_asset="${admin_asset#/admin}"
  docker exec resume-admin wget -q -T 5 --spider "http://127.0.0.1${admin_internal_asset}" 2>/dev/null \
    || failures+=("admin JavaScript asset is not served")
fi

cors_probe_host="${CORS_PROBE_ORIGIN#*://}"
cors_probe_host="${cors_probe_host%%/*}"
public_web_headers="$(curl -sS --max-time 15 -D - -o /dev/null \
  -H "Host: ${cors_probe_host}" 'http://127.0.0.1/' 2>/dev/null | tr -d '\r' || true)"
grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$public_web_headers" \
  || failures+=("public-IP web entry did not return 200")
if grep -Eiq '^Location:' <<< "$public_web_headers"; then
  failures+=("public-IP web entry unexpectedly redirects")
fi
public_web_html="$(curl -fsS --max-time 15 -H "Host: ${cors_probe_host}" \
  'http://127.0.0.1/' 2>/dev/null || true)"
[[ "$public_web_html" == *'<div id="app"></div>'* ]] \
  || failures+=("public-IP web HTML is invalid")
public_web_asset="$(printf '%s' "$public_web_html" | grep -oE 'src="/assets/[^"]+\.js"' \
  | head -1 | cut -d'"' -f2 || true)"
if [[ -z "$public_web_asset" ]]; then
  failures+=("public-IP web entry has no executable asset")
else
  public_web_asset_headers="$(curl -sS --max-time 15 -D - -o /dev/null \
    -H "Host: ${cors_probe_host}" "http://127.0.0.1${public_web_asset}" 2>/dev/null | tr -d '\r' || true)"
  grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$public_web_asset_headers" \
    || failures+=("public-IP web JavaScript did not return 200")
  grep -Eiq '^Content-Type:[[:space:]]*(application|text)/javascript' <<< "$public_web_asset_headers" \
    || failures+=("public-IP web JavaScript has the wrong MIME type")
fi

public_admin_headers="$(curl -sS --max-time 15 -D - -o /dev/null \
  -H "Host: ${cors_probe_host}" 'http://127.0.0.1/admin/' 2>/dev/null | tr -d '\r' || true)"
grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$public_admin_headers" \
  || failures+=("public-IP admin entry did not return 200")
public_admin_html="$(curl -fsS --max-time 15 -H "Host: ${cors_probe_host}" \
  'http://127.0.0.1/admin/' 2>/dev/null || true)"
public_admin_asset="$(printf '%s' "$public_admin_html" | grep -oE '/admin/js/main-[^"]+\.js' | head -1 || true)"
if [[ -z "$public_admin_asset" ]]; then
  failures+=("public-IP admin entry has no executable asset")
else
  public_admin_asset_headers="$(curl -sS --max-time 15 -D - -o /dev/null \
    -H "Host: ${cors_probe_host}" "http://127.0.0.1${public_admin_asset}" 2>/dev/null | tr -d '\r' || true)"
  grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$public_admin_asset_headers" \
    || failures+=("public-IP admin JavaScript did not return 200")
  grep -Eiq '^Content-Type:[[:space:]]*(application|text)/javascript' <<< "$public_admin_asset_headers" \
    || failures+=("public-IP admin JavaScript has the wrong MIME type")
fi
case "$REQUIRE_PUBLIC_HTTPS" in
  true)
    public_health="$(curl -fsS --max-time 15 \
      --resolve "${PUBLIC_HOST}:443:127.0.0.1" \
      "https://${PUBLIC_HOST}/api/health" 2>/dev/null || true)"
    [[ "$public_health" == *'"status":"ok"'* ]] || failures+=("HTTPS public health failed")
    openssl x509 -checkend 1209600 -noout -in "$CERT_FILE" >/dev/null 2>&1 \
      || failures+=("TLS certificate is missing or expires within 14 days")
    ;;
  false)
    public_health="$(curl -fsS --max-time 15 \
      -H "Host: ${cors_probe_host}" \
      'http://127.0.0.1/api/health' 2>/dev/null || true)"
    [[ "$public_health" == *'"status":"ok"'* ]] || failures+=("HTTP public-IP health failed")
    ;;
  *)
    failures+=("REQUIRE_PUBLIC_HTTPS must be true or false")
    ;;
esac

# A server-to-server health request has no Origin header and cannot detect a
# browser-only CORS outage. Exercise the real Nginx -> backend preflight path.
cors_preflight="$(curl -sS --max-time 15 -D - -o /dev/null \
  -w '__STATUS__:%{http_code}\n' \
  -X OPTIONS 'http://127.0.0.1/api/auth/cuser/login' \
  -H "Host: ${cors_probe_host}" \
  -H "Origin: ${CORS_PROBE_ORIGIN}" \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization' 2>/dev/null || true)"
cors_preflight="$(printf '%s' "$cors_preflight" | tr -d '\r')"
grep -Fqx '__STATUS__:204' <<<"$cors_preflight" \
  || failures+=("browser CORS preflight returned a non-204 status for ${CORS_PROBE_ORIGIN}")
grep -Fixq "Access-Control-Allow-Origin: ${CORS_PROBE_ORIGIN}" <<<"$cors_preflight" \
  || failures+=("browser CORS preflight did not echo ${CORS_PROBE_ORIGIN}")
grep -Fixq 'Access-Control-Allow-Credentials: true' <<<"$cors_preflight" \
  || failures+=("browser CORS preflight did not allow credentials")

# Create/update no account while forcing the public route, DTO, application DB
# connection, c_users schema and password-auth path to execute. The audit layer
# may append the failed event. A nonexistent username must be a normal 401;
# routing/DB/schema failures become 5xx.
auth_probe_body="$(printf \
  '{"username":"__health_probe_%s_%s","password":"HealthProbe-Invalid-9x!"}' \
  "$(date +%s)" "$$")"
auth_probe_status="$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
  -X POST 'http://127.0.0.1/api/auth/cuser/login' \
  -H "Host: ${cors_probe_host}" \
  -H "Origin: ${CORS_PROBE_ORIGIN}" \
  -H 'Content-Type: application/json' \
  --data-binary "$auth_probe_body" 2>/dev/null || true)"
[[ "$auth_probe_status" == "401" ]] \
  || failures+=("public auth/DB probe returned HTTP ${auth_probe_status:-missing}")

blocked_cors_status="$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
  -X OPTIONS 'http://127.0.0.1/api/auth/cuser/login' \
  -H "Host: ${cors_probe_host}" \
  -H 'Origin: https://untrusted.invalid' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization' 2>/dev/null || true)"
[[ "$blocked_cors_status" == "403" ]] \
  || failures+=("untrusted browser Origin was not rejected with 403")

ready_documents="$(docker exec resume-mysql sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --connect-timeout=5 -N -B -uroot "$MYSQL_DATABASE" -e "$1"' sh \
  "SELECT COUNT(*) FROM knowledge_documents WHERE enabled=1 AND status='ready' AND scope='global';" \
  2>/dev/null || echo 0)"
[[ "$ready_documents" =~ ^[0-9]+$ && "$ready_documents" -ge 1 ]] \
  || failures+=("no enabled ready RAG document")

disk_percent="$(df -P / | awk 'NR==2{gsub("%", "", $5); print $5}')"
[[ "$disk_percent" -lt "$MAX_DISK_PERCENT" ]] \
  || failures+=("disk usage is ${disk_percent}%")
read -r host_memory available_memory swap_total swap_free < <(
  awk '
    /^MemTotal:/ { total = int($2 / 1024) }
    /^MemAvailable:/ { available = int($2 / 1024) }
    /^SwapTotal:/ { swap_total = int($2 / 1024) }
    /^SwapFree:/ { swap_free = int($2 / 1024) }
    END { print total + 0, available + 0, swap_total + 0, swap_free + 0 }
  ' /proc/meminfo
)
effective_available_memory=$((available_memory + swap_free))
[[ "$host_memory" -ge "$MIN_HOST_MEMORY_MB" ]] \
  || failures+=("physical memory is ${host_memory}MB")
[[ "$available_memory" -ge "$MIN_AVAILABLE_MEMORY_MB" ]] \
  || failures+=("available memory is ${available_memory}MB")
[[ "$swap_total" -ge "$MIN_SWAP_TOTAL_MB" ]] \
  || failures+=("total swap is ${swap_total}MB")
[[ "$swap_free" -ge "$MIN_SWAP_FREE_MB" ]] \
  || failures+=("free swap is ${swap_free}MB")
[[ "$effective_available_memory" -ge "$MIN_EFFECTIVE_AVAILABLE_MEMORY_MB" ]] \
  || failures+=("effective memory headroom is ${effective_available_memory}MB")

if (( ${#failures[@]} )); then
  message="ResumeSystem health check failed: $(IFS='; '; echo "${failures[*]}")"
  logger -t resumesystem-health "$message"
  if [[ -n "${ALERT_WEBHOOK_URL:-}" ]]; then
    payload="$(python3 -c 'import json,sys; print(json.dumps({"text":sys.argv[1]}, ensure_ascii=False))' "$message")"
    curl -fsS --max-time 10 -H 'Content-Type: application/json' -d "$payload" "$ALERT_WEBHOOK_URL" >/dev/null || true
  fi
  echo "$message" >&2
  exit 1
fi

echo "health-check: passed (release_version=${RELEASE_VERSION} ready_documents=$ready_documents rag_document_id=${ready_document_id} rag_probe_budget=${rag_probe_budget}s live_agent_probe=${live_agent_probe%%|*} agent_version=${EXPECTED_AGENT_VERSION} cors_origin=${CORS_PROBE_ORIGIN} require_https=${REQUIRE_PUBLIC_HTTPS} disk=${disk_percent}% physical=${host_memory}MB memory=${available_memory}MB swap=${swap_free}/${swap_total}MB effective=${effective_available_memory}MB)"
