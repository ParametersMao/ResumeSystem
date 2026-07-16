#!/usr/bin/env bash
set -Eeuo pipefail

DEFAULT_MARKER=/opt/resumesystem-backup-freeze.env
MODE="${1:-}"
MARKER="${2:-}"
if [[ "$MODE" != "--confirm" && "$MODE" != "--if-present" ]] \
  || [[ "$MARKER" != "$DEFAULT_MARKER" ]] || [[ $# -ne 2 ]]; then
  echo "Usage: $0 (--confirm|--if-present) $DEFAULT_MARKER" >&2
  exit 2
fi
if [[ ! -e "$MARKER" && "$MODE" == "--if-present" ]]; then
  exit 0
fi
[[ -f "$MARKER" && ! -L "$MARKER" \
  && "$(stat -c '%u:%a' "$MARKER")" == "0:600" ]] || {
  echo "Interrupted backup marker must be a root-owned mode-600 regular file" >&2
  exit 1
}

marker_value() {
  local key="$1"
  local -a values=()
  mapfile -t values < <(
    awk -F= -v wanted="$key" '$1 == wanted {sub(/^[^=]*=/, ""); print}' "$MARKER"
  )
  [[ "${#values[@]}" -eq 1 && -n "${values[0]}" ]] || return 1
  printf '%s' "${values[0]}"
}
env_value() {
  local file="$1"
  local key="$2"
  local -a values=()
  mapfile -t values < <(
    awk -F= -v wanted="$key" '$1 == wanted {sub(/^[^=]*=/, ""); print}' "$file"
  )
  [[ "${#values[@]}" -eq 1 && -n "${values[0]}" ]] || return 1
  printf '%s' "${values[0]}"
}
canonical_path() {
  local requested="$1"
  local resolved
  resolved="$(readlink -f "$requested" 2>/dev/null || true)"
  [[ -n "$resolved" && "$resolved" == "$requested" ]] || return 1
  printf '%s' "$resolved"
}

BACKUP_RELEASE_COMMIT="$(marker_value BACKUP_RELEASE_COMMIT)"
BACKUP_RELEASE_DIR="$(marker_value BACKUP_RELEASE_DIR)"
BACKUP_RECOVERY_RUNTIME_DIR="$(marker_value BACKUP_RECOVERY_RUNTIME_DIR)"
BACKUP_KEEP_PROXY_STOPPED="$(marker_value BACKUP_KEEP_PROXY_STOPPED)"
BACKUP_RAG_REQUIRED="$(marker_value BACKUP_RAG_REQUIRED)"
BACKUP_STARTED_EPOCH="$(marker_value BACKUP_STARTED_EPOCH)"

[[ "$BACKUP_RELEASE_COMMIT" =~ ^[0-9a-f]{40}$ \
  && "$BACKUP_KEEP_PROXY_STOPPED" =~ ^(true|false)$ \
  && "$BACKUP_RAG_REQUIRED" =~ ^(true|false)$ \
  && "$BACKUP_STARTED_EPOCH" =~ ^[1-9][0-9]{0,11}$ ]] || {
  echo "Interrupted backup marker has invalid recovery context" >&2
  exit 1
}
release_dir="$(canonical_path "$BACKUP_RELEASE_DIR")" || {
  echo "Interrupted backup release path must not traverse symlinks" >&2
  exit 1
}
runtime_dir="$(canonical_path "$BACKUP_RECOVERY_RUNTIME_DIR")" || {
  echo "Interrupted backup runtime path must not traverse symlinks" >&2
  exit 1
}
current_release="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
[[ "$release_dir" == /opt/resumesystem-* \
  && "$release_dir" != /opt/resumesystem-current \
  && "$current_release" == "$release_dir" \
  && "$runtime_dir" == "$release_dir/deploy" \
  && -f "$release_dir/.env" \
  && -f "$release_dir/docker-compose.prod.yml" ]] || {
  echo "Interrupted backup immutable release context is invalid" >&2
  exit 1
}
release_env_commit="$(env_value "$release_dir/.env" RELEASE_COMMIT)" || {
  echo "Interrupted backup release env has an invalid commit binding" >&2
  exit 1
}
[[ "$release_env_commit" == "$BACKUP_RELEASE_COMMIT" ]] || {
  echo "Interrupted backup release commit does not match its immutable env" >&2
  exit 1
}
for runtime_file in maintenance-firewall.sh recovery-acceptance.sh; do
  [[ -f "$runtime_dir/$runtime_file" ]] || {
    echo "Interrupted backup recovery runtime is missing: $runtime_file" >&2
    exit 1
  }
done
if [[ "$BACKUP_KEEP_PROXY_STOPPED" == "true" ]]; then
  [[ -e /opt/resumesystem-rollout-in-progress.env \
    || -e /opt/resumesystem-release-pending.env ]] || {
    echo "A proxy-stopped backup recovery requires an enclosing rollout marker" >&2
    exit 1
  }
elif [[ -e /opt/resumesystem-rollout-in-progress.env \
  || -e /opt/resumesystem-release-pending.env ]]; then
  echo "An ordinary backup cannot reopen traffic during an incomplete rollout" >&2
  exit 1
fi

# shellcheck disable=SC1091
source "$runtime_dir/maintenance-firewall.sh"
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

ENV_FILE="$release_dir/.env"
COMPOSE_FILE="$release_dir/docker-compose.prod.yml"
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
close_public_traffic() {
  maintenance_enable >/dev/null 2>&1 || true
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    stop reverse-proxy >/dev/null 2>&1 || true
  docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
}
fail_recovery() {
  local exit_code="${1:-1}"
  trap - ERR HUP INT TERM
  set +e
  close_public_traffic
  echo "Interrupted backup recovery failed; marker retained and public traffic remains stopped" >&2
  exit "$exit_code"
}
clear_backup_marker() {
  rm -f -- "$MARKER" || return 1
  sync -f /opt
}
trap 'fail_recovery $?' ERR
trap 'fail_recovery 129' HUP
trap 'fail_recovery 130' INT
trap 'fail_recovery 143' TERM

maintenance_enable
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps qdrant
wait_container_health resume-qdrant 30
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps agent
wait_container_health resume-agent 180
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps backend
wait_container_health resume-backend 120
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps web admin
wait_container_health resume-web 30
wait_container_health resume-admin 30

if [[ "$BACKUP_KEEP_PROXY_STOPPED" == "true" ]]; then
  close_public_traffic
else
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    up -d --no-build --no-deps --force-recreate reverse-proxy
  wait_container_health resume-proxy 30
  RAG_REQUIRED="$BACKUP_RAG_REQUIRED" ENV_FILE="$ENV_FILE" \
    "$runtime_dir/recovery-acceptance.sh"
fi
# Commit the accepted recovery while the maintenance firewall is still active.
# A marker can therefore never coexist with deliberately reopened traffic.
clear_backup_marker
if [[ "$BACKUP_KEEP_PROXY_STOPPED" != "true" ]]; then
  maintenance_disable
fi
trap - ERR HUP INT TERM
echo "recover-interrupted-backup: restored $release_dir"
