#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
PUBLIC_HOST="${PUBLIC_HOST:-aidana.top}"
CORS_PROBE_ORIGIN="${CORS_PROBE_ORIGIN:-http://121.43.208.184}"
REQUIRE_PUBLIC_HTTPS="${REQUIRE_PUBLIC_HTTPS:-true}"
MAX_DISK_PERCENT="${MAX_DISK_PERCENT:-85}"
MIN_AVAILABLE_MEMORY_MB="${MIN_AVAILABLE_MEMORY_MB:-256}"
RAG_HEALTH_PROBE_TIMEOUT_SECONDS="${RAG_HEALTH_PROBE_TIMEOUT_SECONDS:-180}"
RAG_HEALTH_PROBE_ATTEMPTS="${RAG_HEALTH_PROBE_ATTEMPTS:-2}"
failures=()
CERT_FILE="${CERT_FILE:-/etc/letsencrypt/live/aidana.top/fullchain.pem}"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

for name in resume-proxy resume-web resume-admin resume-backend resume-agent resume-qdrant resume-mysql; do
  status="$(docker inspect "$name" --format '{{.State.Status}}' 2>/dev/null || true)"
  [[ "$status" == "running" ]] || failures+=("$name is $status")
  health="$(docker inspect "$name" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)"
  [[ "$health" == "none" || "$health" == "healthy" ]] || failures+=("$name health is $health")
  restarts="$(docker inspect "$name" --format '{{.RestartCount}}' 2>/dev/null || echo 999)"
  [[ "$restarts" =~ ^[0-9]+$ && "$restarts" -lt 3 ]] || failures+=("$name restart count is $restarts")
done

backend_status="$(docker exec resume-backend node -e \
  "fetch('http://127.0.0.1:3000/api/health').then(async r=>{const j=await r.json(); if(!r.ok||j.status!=='ok')process.exit(1); process.stdout.write(j.status)}).catch(()=>process.exit(1))" \
  2>/dev/null || true)"
[[ "$backend_status" == "ok" ]] || failures+=("backend direct health failed")

agent_status="$(docker exec resume-agent python -c \
  "import json,urllib.request; j=json.load(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)); print(j.get('status',''))" \
  2>/dev/null || true)"
[[ "$agent_status" == "ok" ]] || failures+=("agent RAG health is $agent_status")

rag_hits=0
if ! [[ "$RAG_HEALTH_PROBE_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  failures+=("RAG_HEALTH_PROBE_TIMEOUT_SECONDS must be a positive integer")
elif ! [[ "$RAG_HEALTH_PROBE_ATTEMPTS" =~ ^[1-9][0-9]*$ ]]; then
  failures+=("RAG_HEALTH_PROBE_ATTEMPTS must be a positive integer")
else
  # FastEmbed loads the ONNX model lazily. On the production host the first
  # real query after an Agent restart can take about two minutes even when the
  # model files are already cached. Warm the same retrieval path users need and
  # fail only after a bounded number of full cold-start attempts.
  for ((attempt = 1; attempt <= RAG_HEALTH_PROBE_ATTEMPTS; attempt++)); do
    rag_hits="$(docker exec resume-agent python -c \
      "import json,os,urllib.request; query='\u8bc1\u636e\u8fb9\u754c\u56db\u539f\u5219 \u4e0d\u865a\u6784\u516c\u53f8 \u4e0d\u65b0\u589e\u539f\u6587\u6ca1\u6709\u7684\u6570\u5b57'; data=json.dumps({'query':query,'limit':1,'scope':'global'}).encode(); req=urllib.request.Request('http://127.0.0.1:8000/rag/search',data=data,headers={'Content-Type':'application/json','X-Agent-Secret':os.environ['AGENT_INTERNAL_SECRET']}); j=json.load(urllib.request.urlopen(req,timeout=${RAG_HEALTH_PROBE_TIMEOUT_SECONDS})); print(len(j.get('results',[])))" \
      2>/dev/null || echo 0)"
    if [[ "$rag_hits" =~ ^[0-9]+$ && "$rag_hits" -ge 1 ]]; then
      break
    fi
    [[ "$attempt" -eq "$RAG_HEALTH_PROBE_ATTEMPTS" ]] || sleep 5
  done
  [[ "$rag_hits" =~ ^[0-9]+$ && "$rag_hits" -ge 1 ]] || failures+=("real RAG retrieval returned no source after ${RAG_HEALTH_PROBE_ATTEMPTS} attempt(s)")
fi

web_html="$(docker exec resume-web wget -qO- http://127.0.0.1/ 2>/dev/null || true)"
[[ "$web_html" == *"<div id=\"app\"></div>"* ]] || failures+=("web entry failed")

admin_html="$(docker exec resume-admin wget -qO- http://127.0.0.1/ 2>/dev/null || true)"
admin_asset="$(printf '%s' "$admin_html" | grep -oE '/admin/js/main-[^"]+\.js' | head -1 || true)"
if [[ -z "$admin_asset" ]]; then
  failures+=("admin entry asset is missing or has the wrong base path")
else
  admin_internal_asset="${admin_asset#/admin}"
  docker exec resume-admin wget -q --spider "http://127.0.0.1${admin_internal_asset}" 2>/dev/null \
    || failures+=("admin JavaScript asset is not served")
fi

cors_probe_host="${CORS_PROBE_ORIGIN#*://}"
cors_probe_host="${cors_probe_host%%/*}"
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
  -X OPTIONS 'http://127.0.0.1/api/auth/login' \
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

ready_documents="$(docker exec resume-mysql mysql -N -B \
  -uroot -p"$MYSQL_ROOT_PASSWORD" "$DB_DATABASE" \
  -e "SELECT COUNT(*) FROM knowledge_documents WHERE enabled=1 AND status='ready';" 2>/dev/null || echo 0)"
[[ "$ready_documents" =~ ^[0-9]+$ && "$ready_documents" -ge 1 ]] \
  || failures+=("no enabled ready RAG document")

disk_percent="$(df -P / | awk 'NR==2{gsub("%", "", $5); print $5}')"
[[ "$disk_percent" -lt "$MAX_DISK_PERCENT" ]] \
  || failures+=("disk usage is ${disk_percent}%")
available_memory="$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)"
[[ "$available_memory" -ge "$MIN_AVAILABLE_MEMORY_MB" ]] \
  || failures+=("available memory is ${available_memory}MB")

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

echo "health-check: passed (ready_documents=$ready_documents cors_origin=${CORS_PROBE_ORIGIN} require_https=${REQUIRE_PUBLIC_HTTPS} disk=${disk_percent}% memory=${available_memory}MB)"
