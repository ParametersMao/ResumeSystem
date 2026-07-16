#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
RAG_REQUIRED_REQUESTED="${RAG_REQUIRED:-true}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$ENV_FILE" ]] || { echo "Recovery acceptance env is missing" >&2; exit 1; }
[[ "$RAG_REQUIRED_REQUESTED" == "true" || "$RAG_REQUIRED_REQUESTED" == "false" ]] \
  || { echo "RAG_REQUIRED must be true or false" >&2; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

cors_origin="${CORS_PROBE_ORIGIN:-http://121.43.208.184}"
public_host="${cors_origin#*://}"
public_host="${public_host%%/*}"

backend_health="$(curl -fsS --max-time 15 -H "Host: $public_host" \
  http://127.0.0.1/api/health 2>/dev/null || true)"
[[ "$backend_health" == *'"status":"ok"'* ]] \
  || { echo "Recovery public API health failed" >&2; exit 1; }

static_probe_error=""
probe_public_static_entries() {
  local web_headers web_html web_asset web_asset_headers
  local admin_headers admin_html admin_asset admin_asset_headers

  web_headers="$(curl -sS --max-time 15 -D - -o /dev/null -H "Host: $public_host" \
    http://127.0.0.1/ 2>/dev/null | tr -d '\r' || true)"
  if ! grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$web_headers"; then
    static_probe_error="Recovery public web entry failed"
    return 1
  fi
  if grep -Eiq '^Location:' <<< "$web_headers"; then
    static_probe_error="Recovery public web entry redirects"
    return 1
  fi
  web_html="$(curl -fsS --max-time 15 -H "Host: $public_host" \
    http://127.0.0.1/ 2>/dev/null || true)"
  if [[ "$web_html" != *'<div id="app"></div>'* ]]; then
    static_probe_error="Recovery public web HTML is invalid"
    return 1
  fi
  web_asset="$(printf '%s' "$web_html" | grep -oE 'src="/assets/[^"]+\.js"' \
    | head -1 | cut -d'"' -f2 || true)"
  if [[ -z "$web_asset" ]]; then
    static_probe_error="Recovery web asset is missing"
    return 1
  fi
  web_asset_headers="$(curl -sS --max-time 15 -D - -o /dev/null -H "Host: $public_host" \
    "http://127.0.0.1${web_asset}" 2>/dev/null | tr -d '\r' || true)"
  if ! grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$web_asset_headers"; then
    static_probe_error="Recovery web JavaScript failed"
    return 1
  fi
  if ! grep -Eiq '^Content-Type:[[:space:]]*(application|text)/javascript' <<< "$web_asset_headers"; then
    static_probe_error="Recovery web JavaScript MIME is invalid"
    return 1
  fi

  admin_headers="$(curl -sS --max-time 15 -D - -o /dev/null -H "Host: $public_host" \
    http://127.0.0.1/admin/ 2>/dev/null | tr -d '\r' || true)"
  if ! grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$admin_headers"; then
    static_probe_error="Recovery public admin entry failed"
    return 1
  fi
  if grep -Eiq '^Location:' <<< "$admin_headers"; then
    static_probe_error="Recovery public admin entry redirects"
    return 1
  fi
  admin_html="$(curl -fsS --max-time 15 -H "Host: $public_host" \
    http://127.0.0.1/admin/ 2>/dev/null || true)"
  admin_asset="$(printf '%s' "$admin_html" | grep -oE '/admin/js/main-[^"]+\.js' | head -1 || true)"
  if [[ -z "$admin_asset" ]]; then
    static_probe_error="Recovery admin asset is missing"
    return 1
  fi
  admin_asset_headers="$(curl -sS --max-time 15 -D - -o /dev/null -H "Host: $public_host" \
    "http://127.0.0.1${admin_asset}" 2>/dev/null | tr -d '\r' || true)"
  if ! grep -Eq '^HTTP/[0-9.]+ 200([[:space:]]|$)' <<< "$admin_asset_headers"; then
    static_probe_error="Recovery admin JavaScript failed"
    return 1
  fi
  if ! grep -Eiq '^Content-Type:[[:space:]]*(application|text)/javascript' <<< "$admin_asset_headers"; then
    static_probe_error="Recovery admin JavaScript MIME is invalid"
    return 1
  fi
}

static_probe_attempts="${RECOVERY_STATIC_PROBE_ATTEMPTS:-15}"
static_probe_delay="${RECOVERY_STATIC_PROBE_DELAY_SECONDS:-2}"
[[ "$static_probe_attempts" =~ ^[1-9][0-9]*$ ]] \
  || { echo "RECOVERY_STATIC_PROBE_ATTEMPTS must be a positive integer" >&2; exit 1; }
[[ "$static_probe_delay" =~ ^[0-9]+$ ]] \
  || { echo "RECOVERY_STATIC_PROBE_DELAY_SECONDS must be a non-negative integer" >&2; exit 1; }
static_probe_ready=false
for ((static_probe_attempt = 1; static_probe_attempt <= static_probe_attempts; static_probe_attempt += 1)); do
  if probe_public_static_entries; then
    static_probe_ready=true
    break
  fi
  if ((static_probe_attempt < static_probe_attempts)); then
    sleep "$static_probe_delay"
  fi
done
[[ "$static_probe_ready" == true ]] \
  || { echo "$static_probe_error after $static_probe_attempts attempts" >&2; exit 1; }

cors_headers="$(curl -sS --max-time 15 -D - -o /dev/null \
  -X OPTIONS http://127.0.0.1/api/auth/cuser/login -H "Host: $public_host" \
  -H "Origin: $cors_origin" -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization' 2>/dev/null \
  | tr -d '\r' || true)"
grep -Eq '^HTTP/[0-9.]+ 204([[:space:]]|$)' <<< "$cors_headers" \
  || { echo "Recovery allowed CORS preflight failed" >&2; exit 1; }
grep -Fixq "Access-Control-Allow-Origin: $cors_origin" <<< "$cors_headers" \
  || { echo "Recovery CORS origin echo failed" >&2; exit 1; }
grep -Eiq '^Access-Control-Allow-Credentials:[[:space:]]*true[[:space:]]*$' <<< "$cors_headers" \
  || { echo "Recovery CORS credentials header failed" >&2; exit 1; }

# Exercise the public application's exact username/password login contract. A
# unique nonexistent user creates/updates no account while forcing Nest auth to
# query the real c_users table; routing/body/schema/DB failures cannot look like
# the expected Unauthorized response. The audit interceptor may append the
# normal failed-authentication event.
auth_probe_body="$(printf \
  '{"username":"__recovery_probe_%s_%s","password":"RecoveryProbe-Invalid-9x!"}' \
  "$(date +%s)" "$$")"
auth_probe_status="$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
  -X POST http://127.0.0.1/api/auth/cuser/login -H "Host: $public_host" \
  -H "Origin: $cors_origin" -H 'Content-Type: application/json' \
  --data-binary "$auth_probe_body" 2>/dev/null || true)"
[[ "$auth_probe_status" == "401" ]] \
  || { echo "Recovery application auth/DB probe failed: HTTP $auth_probe_status" >&2; exit 1; }

blocked_status="$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
  -X OPTIONS http://127.0.0.1/api/auth/cuser/login -H "Host: $public_host" \
  -H 'Origin: https://untrusted.invalid' -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization' 2>/dev/null || true)"
[[ "$blocked_status" == "403" ]] \
  || { echo "Recovery untrusted CORS origin was not rejected" >&2; exit 1; }

agent_status="$(docker exec resume-agent python -c \
  "import json,urllib.request; j=json.load(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)); r=j.get('rag') or {}; print(f\"{j.get('status','')}|{str(r.get('enabled') is True).lower()}|{r.get('embedding_backend','')}|{r.get('embedding_model','')}|{str(r.get('collection_ready') is True).lower()}\")" \
  2>/dev/null || true)"
if [[ "$RAG_REQUIRED_REQUESTED" == "true" ]]; then
  [[ "$agent_status" == "ok|true|fastembed|BAAI/bge-small-zh-v1.5|true" ]] \
    || { echo "Recovery RAG readiness failed" >&2; exit 1; }
  fixture="$(docker exec resume-mysql sh -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --connect-timeout=5 -N -B -uroot "$MYSQL_DATABASE" -e "$1"' sh \
    "SELECT CONCAT(id, '|', chunk_count, '|', storage_key) FROM knowledge_documents WHERE enabled=1 AND status='ready' AND scope='global' AND chunk_count>0 ORDER BY CASE WHEN storage_key LIKE 'knowledge/global/bootstrap/%/resume-writing-standard-v1.md' THEN 0 WHEN source_type='standard' THEN 1 ELSE 2 END, id DESC LIMIT 1;" \
    2>/dev/null || true)"
  [[ "$fixture" =~ ^([1-9][0-9]*)\|([1-9][0-9]*)\|(.+)$ ]] \
    || { echo "Recovery RAG fixture is missing" >&2; exit 1; }
  fixture_document_id="${BASH_REMATCH[1]}"
  fixture_chunk_count="${BASH_REMATCH[2]}"
  fixture_storage_key="${BASH_REMATCH[3]}"
  rag_recovery_probe_timeout="${RAG_RECOVERY_PROBE_TIMEOUT_SECONDS:-180}"
  [[ "$rag_recovery_probe_timeout" =~ ^[0-9]+$ \
    && "$rag_recovery_probe_timeout" -ge 30 \
    && "$rag_recovery_probe_timeout" -le 600 ]] \
    || { echo "RAG_RECOVERY_PROBE_TIMEOUT_SECONDS must be between 30 and 600" >&2; exit 1; }
  command -v timeout >/dev/null 2>&1 \
    || { echo "Recovery RAG probe requires the timeout command" >&2; exit 1; }
  fixture_source_sha256=""
  if [[ "$fixture_storage_key" =~ ^knowledge/global/bootstrap/[0-9a-f]{40}/resume-writing-standard-v1[.]md$ ]]; then
    fixture_source_sha256="$(docker exec resume-backend sha256sum \
      "/app/uploads/$fixture_storage_key" 2>/dev/null | awk '{print $1}' || true)"
    [[ "$fixture_source_sha256" =~ ^[0-9a-f]{64}$ ]] \
      || { echo "Recovery canonical RAG source file is missing" >&2; exit 1; }
  fi
  set +e
  probe="$(timeout --signal=TERM --kill-after=5 \
    "$((rag_recovery_probe_timeout + 15))" \
    docker exec -i resume-agent python - \
    "$fixture_document_id" "$fixture_chunk_count" "$fixture_source_sha256" \
    "$rag_recovery_probe_timeout" \
    < "$SCRIPT_DIR/rag-recovery-probe.py" 2>/dev/null)"
  probe_status=$?
  set -e
  [[ "$probe_status" -eq 0 \
    && "$probe" == "OK|${fixture_document_id}|${fixture_chunk_count}|"* ]] \
    || { echo "Recovery exact-document RAG probe failed: $probe" >&2; exit 1; }
else
  [[ "$agent_status" == ok\|* ]] \
    || { echo "Recovery Agent health failed" >&2; exit 1; }
fi

echo "recovery-acceptance: passed (rag_required=$RAG_REQUIRED_REQUESTED origin=$cors_origin)"
