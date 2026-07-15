#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${1:-}" != "--confirm" || ! "${2:-}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Usage: $0 --confirm <full-release-commit>" >&2
  exit 2
fi

EXPECTED_COMMIT="$2"
RELEASE_DIR="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
ENV_FILE="${ENV_FILE:-$RELEASE_DIR/.env}"
PENDING_FILE="${PENDING_FILE:-/opt/resumesystem-release-pending.env}"
ROLLOUT_MARKER="${ROLLOUT_MARKER:-/opt/resumesystem-rollout-in-progress.env}"
RAG_BOOTSTRAP_MARKER="${RAG_BOOTSTRAP_MARKER:-/opt/resumesystem-rag-bootstrap-rollout.env}"
[[ "$RELEASE_DIR" == /opt/resumesystem-* \
  && -f "$ENV_FILE" \
  && -f "$PENDING_FILE" \
  && -f "$ROLLOUT_MARKER" \
  && -f "$RELEASE_DIR/deploy/maintenance-firewall.sh" ]] || {
  echo "Current release or pending rollout marker is missing" >&2
  exit 1
}
[[ "$(stat -c '%u:%a' "$PENDING_FILE")" == "0:600" \
  && "$(stat -c '%u:%a' "$ROLLOUT_MARKER")" == "0:600" ]] || {
  echo "Pending and rollout markers must be root-owned mode-600 files" >&2
  exit 1
}
readonly EXPECTED_COMMIT RELEASE_DIR ENV_FILE PENDING_FILE ROLLOUT_MARKER

# shellcheck disable=SC1091
source "$RELEASE_DIR/deploy/maintenance-firewall.sh"
pending_validated=false
terminal_commit_started=false
recreate_pending_marker() {
  local pending_temp
  [[ "$pending_validated" == "true" ]] || return 0
  [[ "$terminal_commit_started" != "true" ]] || return 0
  [[ -f "$PENDING_FILE" ]] && return 0
  umask 077
  pending_temp="$(mktemp "$(dirname "$PENDING_FILE")/.resumesystem-release-pending.finalize.XXXXXX")" || return 1
  printf 'PENDING_RELEASE_COMMIT=%s\nPENDING_DEPLOYED_EPOCH=%s\n' \
    "$EXPECTED_COMMIT" "$PENDING_DEPLOYED_EPOCH" > "$pending_temp" || return 1
  sync -f "$pending_temp" || return 1
  mv -Tf "$pending_temp" "$PENDING_FILE" || return 1
  sync -f "$(dirname "$PENDING_FILE")"
}
fail_finalize() {
  local exit_code="${1:-1}"
  local firewall_status=0
  trap - ERR HUP INT TERM
  set +e
  maintenance_enable >/dev/null 2>&1
  firewall_status=$?
  docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
  systemctl disable --now resumesystem-health.timer resumesystem-backup.timer \
    >/dev/null 2>&1 || true
  systemctl stop resumesystem-health.service resumesystem-backup.service \
    >/dev/null 2>&1 || true
  recreate_pending_marker >/dev/null 2>&1 || true
  if [[ "$terminal_commit_started" == "true" ]]; then
    logger -t resumesystem-finalize \
      "Release finalization marker commit failed for $EXPECTED_COMMIT; public proxy stopped and rollout marker retained without recreating pending" \
      >/dev/null 2>&1 || true
  else
    logger -t resumesystem-finalize \
      "Release finalization failed for $EXPECTED_COMMIT; public proxy stopped and pending marker retained" \
      >/dev/null 2>&1 || true
  fi
  if [[ "$firewall_status" -ne 0 ]]; then
    echo "finalize-release: failed; the maintenance firewall could not be confirmed, but the public proxy is stopped and the pending marker is retained" >&2
  elif [[ "$terminal_commit_started" == "true" ]]; then
    echo "finalize-release: marker commit failed; public traffic remains stopped and the durable rollout marker remains recoverable" >&2
  else
    echo "finalize-release: failed; public traffic remains in maintenance mode, the proxy is stopped, and the pending marker is retained" >&2
  fi
  exit "$exit_code"
}
trap 'fail_finalize $?' ERR
trap 'fail_finalize 129' HUP
trap 'fail_finalize 130' INT
trap 'fail_finalize 143' TERM

OPERATION_LOCK_FILE="${RESUMESYSTEM_OPERATION_LOCK:-/var/lock/resumesystem-operation.lock}"
command -v flock >/dev/null 2>&1 || {
  echo "flock is required" >&2
  fail_finalize 1
}
exec 9>"$OPERATION_LOCK_FILE"
flock -n 9 || {
  echo "Another ResumeSystem operation is already running" >&2
  fail_finalize 1
}
export RESUMESYSTEM_OPERATION_LOCK_HELD=true

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
# shellcheck disable=SC1090
source "$PENDING_FILE"
set +a
[[ "${RELEASE_COMMIT:-}" == "$EXPECTED_COMMIT" \
  && "${PENDING_RELEASE_COMMIT:-}" == "$EXPECTED_COMMIT" \
  && "${PENDING_DEPLOYED_EPOCH:-}" =~ ^[1-9][0-9]{0,11}$ ]] || {
  echo "Pending rollout marker does not match the current release" >&2
  fail_finalize 1
}
pending_validated=true
rollout_marker_state="$(awk -F= '$1 == "ROLLOUT_STATE" {print $2}' "$ROLLOUT_MARKER")"
rollout_marker_phase="$(awk -F= '$1 == "ROLLOUT_PHASE" {print $2}' "$ROLLOUT_MARKER")"
rollout_marker_commit="$(awk -F= '$1 == "ROLLOUT_RELEASE_COMMIT" {print $2}' "$ROLLOUT_MARKER")"
[[ "$(stat -c '%u:%a' "$ROLLOUT_MARKER")" == "0:600" \
  && "$rollout_marker_state" == "pending" \
  && "$rollout_marker_phase" == "pending" \
  && "$rollout_marker_commit" == "$EXPECTED_COMMIT" ]] || {
  echo "Durable rollout context does not match the pending release" >&2
  fail_finalize 1
}

if [[ -f "$RAG_BOOTSTRAP_MARKER" ]]; then
  bootstrap_marker_state="$(awk -F= '$1 == "RAG_BOOTSTRAP_STATE" {print $2}' "$RAG_BOOTSTRAP_MARKER")"
  bootstrap_marker_commit="$(awk -F= '$1 == "RAG_BOOTSTRAP_RELEASE_COMMIT" {print $2}' "$RAG_BOOTSTRAP_MARKER")"
  bootstrap_marker_document_id="$(awk -F= '$1 == "RAG_BOOTSTRAP_DOCUMENT_ID" {print $2}' "$RAG_BOOTSTRAP_MARKER")"
  [[ "$bootstrap_marker_state" == "created" \
    && "$bootstrap_marker_commit" == "$EXPECTED_COMMIT" \
    && "$bootstrap_marker_document_id" =~ ^[1-9][0-9]*$ ]] || {
    echo "RAG bootstrap marker does not match the pending release" >&2
    false
  }
fi

# Repair/verify the reboot guard before doing any finalization work. This is a
# no-op for traffic while the marker exists, and makes every later failure
# durable across a host restart.
install -m 0755 "$RELEASE_DIR/deploy/rollout-guard.sh" \
  /usr/local/sbin/resumesystem-rollout-guard
install -m 0755 "$RELEASE_DIR/deploy/recover-interrupted-rollout.sh" \
  /usr/local/sbin/resumesystem-recover-rollout
install -m 0755 "$RELEASE_DIR/deploy/recover-interrupted-backup.sh" \
  /usr/local/sbin/resumesystem-recover-backup
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-rollout-guard.service" \
  /etc/systemd/system/resumesystem-rollout-guard.service
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-rollout-proxy-guard.service" \
  /etc/systemd/system/resumesystem-rollout-proxy-guard.service
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-backup-recovery.service" \
  /etc/systemd/system/resumesystem-backup-recovery.service
systemctl daemon-reload
systemctl enable resumesystem-rollout-guard.service \
  resumesystem-rollout-proxy-guard.service \
  resumesystem-backup-recovery.service >/dev/null
systemctl is-enabled --quiet resumesystem-rollout-guard.service
systemctl is-enabled --quiet resumesystem-rollout-proxy-guard.service
systemctl is-enabled --quiet resumesystem-backup-recovery.service

elapsed=$(( $(date +%s) - 10#$PENDING_DEPLOYED_EPOCH ))
(( elapsed >= 900 )) || {
  echo "15-minute observation window is incomplete (${elapsed}s/900s)" >&2
  fail_finalize 1
}

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed" >&2
  fail_finalize 1
fi
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
start_proxy_under_maintenance() {
  "${COMPOSE[@]}" --env-file "$ENV_FILE" \
    -f "$RELEASE_DIR/docker-compose.prod.yml" \
    up -d --no-build --no-deps reverse-proxy
  wait_container_health resume-proxy 30
}

# From this point until timers and all live probes are verified, no external
# request can reach the candidate. This also makes finalization work after the
# reboot guard intentionally stopped the proxy.
maintenance_enable
systemctl disable --now resumesystem-health.timer resumesystem-backup.timer >/dev/null
systemctl stop resumesystem-health.service resumesystem-backup.service >/dev/null 2>&1 || true
if systemctl is-enabled --quiet resumesystem-health.timer \
  || systemctl is-enabled --quiet resumesystem-backup.timer; then
  echo "Observation timers could not be persistently disabled" >&2
  false
fi
start_proxy_under_maintenance
env RAG_REQUIRED=true ENV_FILE="$ENV_FILE" \
  "$RELEASE_DIR/deploy/recovery-acceptance.sh"

env ENV_FILE="$ENV_FILE" COMPOSE_FILE="$RELEASE_DIR/docker-compose.prod.yml" \
  SOURCE_DIR="$RELEASE_DIR" BACKUP_ROOT="${BACKUP_ROOT:-/opt/resumesystem-backups}" \
  RELEASE_COMMIT="$EXPECTED_COMMIT" INCLUDE_IMAGES=true KEEP_PROXY_STOPPED=true \
  "$RELEASE_DIR/deploy/backup.sh"

start_proxy_under_maintenance
env REQUIRE_LIVE_LLM_PROBE=true ENV_FILE="$ENV_FILE" \
  "$RELEASE_DIR/deploy/health-check.sh"
systemctl enable --now resumesystem-health.timer resumesystem-backup.timer
systemctl is-active --quiet resumesystem-health.timer
systemctl is-active --quiet resumesystem-backup.timer

# Reopen only after monitoring is active. Keep the pending marker until the
# firewall transition succeeds, so a reboot in this tiny window remains closed.
maintenance_disable

# Commit a verified terminal state without ever leaving a pending-only marker.
# While traps are active, remove pending (and the now-committed fixture marker)
# first and fsync the directory; any failure therefore leaves the complete
# rollout context recoverable. The rollout marker is the commit record and is
# removed last with failure traps disabled: a kill before its unlink leaves a
# rollout-only recovery state, while a kill after it is a finalized release.
terminal_commit_started=true
rm -f -- "$PENDING_FILE" "$RAG_BOOTSTRAP_MARKER"
sync -f "$(dirname "$PENDING_FILE")"
trap - ERR HUP INT TERM
rm -f -- "$ROLLOUT_MARKER"
sync -f "$(dirname "$ROLLOUT_MARKER")"
echo "finalize-release: passed ($EXPECTED_COMMIT); health and backup timers enabled"
