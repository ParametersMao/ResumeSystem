#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${1:-}" != "--confirm" || -z "${2:-}" ]]; then
  echo "Usage: $0 --confirm /absolute/path/to/verified-backup" >&2
  exit 2
fi

BACKUP_DIR="$(readlink -f "$2")"
BACKUP_ROOT="$(readlink -f "${BACKUP_ROOT:-/opt/resumesystem-backups}")"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
KEEP_TRAFFIC_CLOSED="${KEEP_TRAFFIC_CLOSED:-false}"
[[ "$KEEP_TRAFFIC_CLOSED" == "true" || "$KEEP_TRAFFIC_CLOSED" == "false" ]] || {
  echo "KEEP_TRAFFIC_CLOSED must be true or false" >&2
  exit 2
}
# shellcheck disable=SC1091
source "$SCRIPT_DIR/maintenance-firewall.sh"

# The release handler switches the canonical link back before invoking this
# script. Prefer that release's compose/env when it matches the backup commit so
# legacy proxy images retain their version-matched mounted configuration.
backup_commit_hint="$(tr -d '\r\n' < "$BACKUP_DIR/release-commit.txt" 2>/dev/null || true)"
linked_release_hint="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
linked_commit_hint="$(awk -F= '$1 == "RELEASE_COMMIT" {print $2}' \
  "$linked_release_hint/.env" 2>/dev/null | tail -1 | tr -d '\r')"
if [[ "$backup_commit_hint" =~ ^[0-9a-f]{40}$ \
  && "$linked_commit_hint" == "$backup_commit_hint" \
  && -f "$linked_release_hint/docker-compose.prod.yml" ]]; then
  ENV_FILE="$linked_release_hint/.env"
  COMPOSE_FILE="$linked_release_hint/docker-compose.prod.yml"
fi

if [[ "$BACKUP_DIR" != "$BACKUP_ROOT"/* \
  || ! -f "$BACKUP_DIR/SHA256SUMS" \
  || ! -f "$BACKUP_DIR/image-map.tsv" \
  || ! -f "$BACKUP_DIR/docker-images.tar.gz" ]]; then
  echo "Rollback requires a verified child backup with image-map.tsv and docker-images.tar.gz" >&2
  exit 1
fi
[[ -f "$ENV_FILE" && -f "$COMPOSE_FILE" ]] || {
  echo "Missing production env or compose file" >&2
  exit 1
}

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed" >&2
  exit 1
fi

OPERATION_LOCK_FILE="${RESUMESYSTEM_OPERATION_LOCK:-/var/lock/resumesystem-operation.lock}"
if [[ "${RESUMESYSTEM_OPERATION_LOCK_HELD:-false}" == "true" ]]; then
  [[ -e /proc/$$/fd/9 ]] || {
    echo "Inherited operation lock marker has no open descriptor" >&2
    exit 1
  }
else
  command -v flock >/dev/null 2>&1 || { echo "flock is required" >&2; exit 1; }
  exec 9>"$OPERATION_LOCK_FILE"
  flock -n 9 || { echo "Another ResumeSystem operation is already running" >&2; exit 1; }
  export RESUMESYSTEM_OPERATION_LOCK_HELD=true
fi

close_public_traffic() {
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    stop reverse-proxy >/dev/null 2>&1 || true
  docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
}
fail_rollback() {
  local exit_code="${1:-1}"
  local message="${2:-Rollback failed}"
  trap - ERR HUP INT TERM
  set +e
  close_public_traffic
  echo "$message; public traffic remains stopped" >&2
  exit "$exit_code"
}
trap 'fail_rollback $? "Rollback command failed"' ERR
trap 'fail_rollback 129 "Rollback hung up"' HUP
trap 'fail_rollback 130 "Rollback interrupted"' INT
trap 'fail_rollback 143 "Rollback terminated"' TERM

# A rollback is fail-closed from its first externally visible action.
maintenance_enable
close_public_traffic
systemctl stop resumesystem-health.timer resumesystem-health.service 2>/dev/null || true
systemctl stop resumesystem-backup.timer resumesystem-backup.service 2>/dev/null || true

(
  cd "$BACKUP_DIR"
  sha256sum -c SHA256SUMS
)
gzip -dc "$BACKUP_DIR/docker-images.tar.gz" | docker load >/dev/null

image_id_for() {
  local container="$1"
  awk -F '\t' -v name="$container" 'NR > 1 && $1 == name { print $3; exit }' \
    "$BACKUP_DIR/image-map.tsv"
}
image_reference_for() {
  local container="$1"
  awk -F '\t' -v name="$container" 'NR > 1 && $1 == name { print $2; exit }' \
    "$BACKUP_DIR/image-map.tsv"
}

declare -A rollback_images=()
for container in resume-mysql resume-backend resume-web resume-admin resume-proxy resume-agent resume-qdrant; do
  image_id="$(image_id_for "$container")"
  image_reference="$(image_reference_for "$container")"
  [[ "$image_id" =~ ^sha256:[0-9a-f]{64}$ \
    && "$image_reference" =~ ^[A-Za-z0-9._/-]+(:[A-Za-z0-9._-]+)?$ ]] \
    || fail_rollback 1 "Backup image map is invalid for $container"
  docker image inspect "$image_id" >/dev/null
  docker tag "$image_id" "$image_reference"
  resolved="$(docker image inspect "$image_reference" --format '{{.Id}}')"
  [[ "$resolved" == "$image_id" ]] \
    || fail_rollback 1 "Failed to bind $image_reference to $image_id"
  rollback_images[$container]="$image_reference"
done

export MYSQL_IMAGE="${rollback_images[resume-mysql]}"
export BACKEND_IMAGE="${rollback_images[resume-backend]}"
export WEB_IMAGE="${rollback_images[resume-web]}"
export ADMIN_IMAGE="${rollback_images[resume-admin]}"
export NGINX_IMAGE="${rollback_images[resume-proxy]}"
export AGENT_IMAGE="${rollback_images[resume-agent]}"
export QDRANT_IMAGE="${rollback_images[resume-qdrant]}"

wait_container_health() {
  local container="$1"
  local attempts="$2"
  local health=""
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    health="$(docker inspect "$container" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' 2>/dev/null || true)"
    [[ "$health" == "healthy" || "$health" == "running" ]] && return 0
    sleep 2
  done
  return 1
}

# Stop memory-heavy dependants first, then restore one layer at a time.
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  stop web admin backend agent qdrant mysql
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate mysql
wait_container_health resume-mysql 120 \
  || fail_rollback 1 "Rollback MySQL did not become healthy"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate qdrant
wait_container_health resume-qdrant 30 \
  || fail_rollback 1 "Rollback Qdrant did not start"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate agent
wait_container_health resume-agent 180 \
  || fail_rollback 1 "Rollback Agent did not become healthy"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate backend
wait_container_health resume-backend 120 \
  || fail_rollback 1 "Rollback backend did not become healthy"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate web admin
wait_container_health resume-web 30 || fail_rollback 1 "Rollback web did not become healthy"
wait_container_health resume-admin 30 || fail_rollback 1 "Rollback admin did not become healthy"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate reverse-proxy
wait_container_health resume-proxy 30 \
  || fail_rollback 1 "Rollback reverse proxy did not become healthy"

rag_ready="$(tr -d '\r\n' < "$BACKUP_DIR/rag-ready.txt" 2>/dev/null || echo false)"
[[ "$rag_ready" == "true" || "$rag_ready" == "false" ]] \
  || fail_rollback 1 "Rollback RAG readiness marker is invalid"
acceptance_env="$ENV_FILE"
linked_release="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
[[ -f "$linked_release/.env" ]] && acceptance_env="$linked_release/.env"
RAG_REQUIRED="$rag_ready" ENV_FILE="$acceptance_env" \
  "$SCRIPT_DIR/recovery-acceptance.sh" \
  || fail_rollback 1 "Rollback invariant acceptance failed"

restore_timer_state() {
  local unit="$1"
  local enabled_state="$2"
  local active_state="$3"
  case "$enabled_state" in
    enabled) systemctl enable "$unit" >/dev/null ;;
    enabled-runtime) systemctl enable --runtime "$unit" >/dev/null ;;
    disabled) systemctl disable "$unit" >/dev/null 2>&1 || fail_rollback 1 "Could not disable $unit" ;;
    *) fail_rollback 1 "Invalid saved enabled state for $unit" ;;
  esac
  if [[ "$active_state" == "active" ]]; then
    systemctl start "$unit"
  else
    systemctl stop "$unit" >/dev/null 2>&1 || fail_rollback 1 "Could not stop $unit"
  fi
  [[ "$(systemctl is-enabled "$unit" 2>/dev/null || true)" == "$enabled_state" \
    && "$(systemctl is-active "$unit" 2>/dev/null || true)" == "$active_state" ]] \
    || fail_rollback 1 "Timer state postcondition failed for $unit"
}
if [[ "$KEEP_TRAFFIC_CLOSED" != "true" ]]; then
  restore_timer_state resumesystem-health.timer \
    "${RESTORE_HEALTH_TIMER_ENABLED:-enabled}" "${RESTORE_HEALTH_TIMER_ACTIVE:-active}"
  restore_timer_state resumesystem-backup.timer \
    "${RESTORE_BACKUP_TIMER_ENABLED:-enabled}" "${RESTORE_BACKUP_TIMER_ACTIVE:-active}"
  maintenance_disable || fail_rollback 1 "Could not reopen verified rollback traffic"
fi
trap - ERR HUP INT TERM
echo "rollback-images: recovered verified runtime ($BACKUP_DIR, rag_required=$rag_ready, traffic_closed=$KEEP_TRAFFIC_CLOSED)"
