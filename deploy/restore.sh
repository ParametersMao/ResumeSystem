#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${1:-}" != "--confirm" || -z "${2:-}" ]]; then
  echo "Usage: $0 --confirm /absolute/path/to/backup [--allow-legacy-safety-backup] [--recover-interrupted /opt/resumesystem-rollout-in-progress.env]" >&2
  exit 2
fi

BACKUP_DIR="$(readlink -f "$2")"
BACKUP_ROOT="$(readlink -f "${BACKUP_ROOT:-/opt/resumesystem-backups}")"
[[ "$BACKUP_ROOT" == /opt/resumesystem-backups ]] || {
  echo "Hardened restore requires BACKUP_ROOT=/opt/resumesystem-backups" >&2
  exit 1
}
CURRENT_ENV_FILE="${ENV_FILE:-.env}"
CURRENT_COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROLLOUT_MARKER="/opt/resumesystem-rollout-in-progress.env"
PENDING_FILE="/opt/resumesystem-release-pending.env"
[[ "$SCRIPT_DIR" == /opt/resumesystem-*/deploy ]] || {
  echo "Restore must run from an immutable /opt/resumesystem-* release runtime" >&2
  exit 1
}
# The immutable env files, not a caller's shell, are authoritative for both
# the current and target Compose models. In particular, target image exports
# must never leak into pre-data-mutation recovery of the current release.
unset RELEASE_COMMIT MYSQL_IMAGE BACKEND_IMAGE WEB_IMAGE ADMIN_IMAGE \
  NGINX_IMAGE AGENT_IMAGE QDRANT_IMAGE
# shellcheck disable=SC1091
source "$SCRIPT_DIR/maintenance-firewall.sh"
ALLOW_LEGACY_SAFETY_BACKUP=false
RECOVERY_MODE=false
RECOVERY_MARKER=""
options=("${@:3}")
for ((option_index = 0; option_index < ${#options[@]}; option_index++)); do
  option="${options[$option_index]}"
  case "$option" in
    --allow-legacy-safety-backup) ALLOW_LEGACY_SAFETY_BACKUP=true ;;
    --allow-without-safety-backup)
      echo "--allow-without-safety-backup is no longer supported because interrupted data replacement must remain recoverable" >&2
      exit 2
      ;;
    --recover-interrupted)
      ((option_index += 1))
      RECOVERY_MARKER="${options[$option_index]:-}"
      RECOVERY_MODE=true
      ;;
    *)
      echo "Unknown restore option: $option" >&2
      exit 2
      ;;
  esac
done

marker_value() {
  local marker="$1"
  local key="$2"
  local -a values=()
  mapfile -t values < <(
    awk -F= -v wanted="$key" '$1 == wanted {sub(/^[^=]*=/, ""); print}' "$marker"
  )
  [[ "${#values[@]}" -eq 1 && -n "${values[0]}" ]] || return 1
  printf '%s' "${values[0]}"
}

if [[ "$RECOVERY_MODE" == "true" ]]; then
  [[ "$RECOVERY_MARKER" == "$ROLLOUT_MARKER" \
    && -f "$RECOVERY_MARKER" \
    && "$(stat -c '%u:%a' "$RECOVERY_MARKER")" == "0:600" ]] || {
    echo "Interrupted restore recovery requires the root-owned mode-600 durable rollout marker" >&2
    exit 1
  }
  recovery_operation="$(marker_value "$RECOVERY_MARKER" ROLLOUT_OPERATION)"
  recovery_phase="$(marker_value "$RECOVERY_MARKER" ROLLOUT_PHASE)"
  recovery_release_commit="$(marker_value "$RECOVERY_MARKER" ROLLOUT_RELEASE_COMMIT)"
  recovery_target_backup="$(marker_value "$RECOVERY_MARKER" ROLLOUT_BACKUP_DIR)"
  recovery_backup_root="$(marker_value "$RECOVERY_MARKER" ROLLOUT_BACKUP_ROOT)"
  recovery_runtime_dir="$(marker_value "$RECOVERY_MARKER" ROLLOUT_RECOVERY_RUNTIME_DIR)"
  recovery_previous_release="$(marker_value "$RECOVERY_MARKER" ROLLOUT_PREVIOUS_RELEASE)"
  recovery_safety_backup="$(marker_value "$RECOVERY_MARKER" ROLLOUT_SAFETY_BACKUP_DIR)"
  recovery_started_epoch="$(marker_value "$RECOVERY_MARKER" ROLLOUT_STARTED_EPOCH)"
  recovery_health_timer_enabled="$(marker_value "$RECOVERY_MARKER" ROLLOUT_HEALTH_TIMER_ENABLED)"
  recovery_health_timer_active="$(marker_value "$RECOVERY_MARKER" ROLLOUT_HEALTH_TIMER_ACTIVE)"
  recovery_backup_timer_enabled="$(marker_value "$RECOVERY_MARKER" ROLLOUT_BACKUP_TIMER_ENABLED)"
  recovery_backup_timer_active="$(marker_value "$RECOVERY_MARKER" ROLLOUT_BACKUP_TIMER_ACTIVE)"
  [[ "$recovery_operation" == "restore" \
    && "$recovery_phase" =~ ^(data-mutation|data-recovery|target-running|pending)$ \
    && "$recovery_release_commit" =~ ^[0-9a-f]{40}$ \
    && "$recovery_target_backup" == "$BACKUP_ROOT"/* \
    && "$recovery_backup_root" == "$BACKUP_ROOT" \
    && "$recovery_runtime_dir" == /opt/resumesystem-*/deploy \
    && "$recovery_previous_release" == /opt/resumesystem-* \
    && "$recovery_previous_release" != /opt/resumesystem-current \
    && "$recovery_safety_backup" == "$BACKUP_ROOT"/* \
    && "$(readlink -f "$recovery_previous_release")" == "$recovery_previous_release" \
    && "$(readlink -f "$recovery_target_backup")" == "$recovery_target_backup" \
    && "$(readlink -f "$recovery_runtime_dir")" == "$recovery_runtime_dir" \
    && "$(readlink -f "$recovery_safety_backup")" == "$recovery_safety_backup" \
    && "$BACKUP_DIR" == "$recovery_safety_backup" \
    && "$recovery_started_epoch" =~ ^[1-9][0-9]{0,11}$ ]] || {
    echo "Interrupted restore recovery context is invalid" >&2
    exit 1
  }
  CURRENT_RELEASE_DIR="$recovery_previous_release"
  CURRENT_ENV_FILE="$CURRENT_RELEASE_DIR/.env"
  CURRENT_COMPOSE_FILE="$CURRENT_RELEASE_DIR/docker-compose.prod.yml"
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed" >&2
  exit 1
fi

if [[ "$BACKUP_DIR" != "$BACKUP_ROOT"/* || ! -f "$BACKUP_DIR/SHA256SUMS" ]]; then
  echo "Backup must be a verified child of $BACKUP_ROOT" >&2
  exit 1
fi
for file in mysql.sql qdrant-storage.tar.gz uploads.tar.gz fastembed-models.tar.gz \
  image-map.tsv docker-images.tar.gz source-with-env.tar.gz release-commit.txt \
  release-version.txt backup-format-version.txt rag-ready.txt; do
  [[ -f "$BACKUP_DIR/$file" ]] || { echo "Missing $file" >&2; exit 1; }
done
[[ "$(tr -d '\r\n' < "$BACKUP_DIR/backup-format-version.txt")" == "2" ]] || {
  echo "Restore requires backup format version 2" >&2
  exit 1
}
[[ -f "$CURRENT_ENV_FILE" && -f "$CURRENT_COMPOSE_FILE" ]] || {
  echo "Missing current production env or compose file" >&2
  exit 1
}
if [[ "$RECOVERY_MODE" != "true" ]]; then
  CURRENT_RELEASE_DIR="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
fi
[[ "$CURRENT_RELEASE_DIR" == /opt/resumesystem-* && -d "$CURRENT_RELEASE_DIR" ]] || {
  echo "Current immutable release link is missing" >&2
  exit 1
}
if [[ "$RECOVERY_MODE" != "true" \
  && ! -f "$CURRENT_RELEASE_DIR/deploy/release-manifest.env" \
  && "$ALLOW_LEGACY_SAFETY_BACKUP" != "true" ]]; then
  echo "The current release is legacy; pass --allow-legacy-safety-backup to explicitly authorize its one-time pre-RAG safety backup" >&2
  exit 1
fi
if [[ "$RECOVERY_MODE" != "true" ]]; then
  [[ ! -e "$ROLLOUT_MARKER" && ! -e "$PENDING_FILE" ]] || {
    echo "Another rollout is incomplete; finalize or recover it before restoring" >&2
    exit 1
  }
fi
(
  cd "$BACKUP_DIR"
  sha256sum -c SHA256SUMS
)
TARGET_RELEASE_COMMIT="$(tr -d '\r\n' < "$BACKUP_DIR/release-commit.txt")"
[[ "$TARGET_RELEASE_COMMIT" =~ ^[0-9a-f]{40}$ ]] || {
  echo "Backup release commit is invalid" >&2
  exit 1
}

if [[ "$RECOVERY_MODE" != "true" ]]; then
  # Reject legacy image-only/manual-recovery baselines before taking maintenance
  # or creating the potentially large pre-restore safety snapshot.
  [[ -f "$BACKUP_DIR/release-artifact/manifest.json" \
    && -f "$BACKUP_DIR/release-artifact/SHA256SUMS" ]] \
    || { echo "Automated restore requires a v1.3.4+ release artifact manifest" >&2; exit 1; }
  (
    cd "$BACKUP_DIR/release-artifact"
    sha256sum -c SHA256SUMS
  )
  "$SCRIPT_DIR/verify-runtime-manifest.sh" \
    --archive "$BACKUP_DIR/source-with-env.tar.gz" \
    "$BACKUP_DIR/release-artifact/manifest.json"
  archive_restore_version="$(tar -xOzf "$BACKUP_DIR/source-with-env.tar.gz" \
    ./deploy/release-manifest.env 2>/dev/null \
    | awk -F= '$1 == "RELEASE_VERSION" {print $2}' | tail -1 | tr -d '\r')"
  [[ "$archive_restore_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ \
    && "$(printf '%s\n' "$archive_restore_version" 1.3.4 | sort -V | tail -1)" == "$archive_restore_version" ]] \
    || { echo "Automated data restore requires a v1.3.4+ hardened backup" >&2; exit 1; }
  archive_members="$(tar -tzf "$BACKUP_DIR/source-with-env.tar.gz")"
  for required_restore_file in \
    deploy/backup.sh \
    deploy/health-check.sh \
    deploy/maintenance-firewall.sh \
    deploy/recovery-acceptance.sh \
    deploy/rag-recovery-probe.py \
    deploy/restore.sh \
    deploy/recover-interrupted-backup.sh \
    deploy/recover-interrupted-rollout.sh \
    deploy/verify-runtime-manifest.sh \
    deploy/finalize-release.sh \
    deploy/rollout-guard.sh \
    deploy/systemd/resumesystem-backup-recovery.service \
    deploy/systemd/resumesystem-rollout-guard.service \
    deploy/systemd/resumesystem-rollout-proxy-guard.service; do
    grep -Fxq "./$required_restore_file" <<< "$archive_members" \
      || { echo "Hardened restore runtime is missing: $required_restore_file" >&2; exit 1; }
  done
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

# Install and enable the boot-time guard before the durable marker can exist.
# With no marker both units are no-ops, so this preparation does not affect the
# running release; after the marker is persisted, a reboot is fail-closed.
install -m 0755 "$SCRIPT_DIR/rollout-guard.sh" \
  /usr/local/sbin/resumesystem-rollout-guard
install -m 0755 "$SCRIPT_DIR/recover-interrupted-rollout.sh" \
  /usr/local/sbin/resumesystem-recover-rollout
install -m 0755 "$SCRIPT_DIR/recover-interrupted-backup.sh" \
  /usr/local/sbin/resumesystem-recover-backup
install -m 0644 "$SCRIPT_DIR/systemd/resumesystem-rollout-guard.service" \
  /etc/systemd/system/resumesystem-rollout-guard.service
install -m 0644 "$SCRIPT_DIR/systemd/resumesystem-rollout-proxy-guard.service" \
  /etc/systemd/system/resumesystem-rollout-proxy-guard.service
install -m 0644 "$SCRIPT_DIR/systemd/resumesystem-backup-recovery.service" \
  /etc/systemd/system/resumesystem-backup-recovery.service
systemctl daemon-reload
systemctl enable resumesystem-rollout-guard.service \
  resumesystem-rollout-proxy-guard.service \
  resumesystem-backup-recovery.service >/dev/null
systemctl is-enabled --quiet resumesystem-rollout-guard.service
systemctl is-enabled --quiet resumesystem-rollout-proxy-guard.service
systemctl is-enabled --quiet resumesystem-backup-recovery.service

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
rollout_state=in-progress
rollout_phase=pre-safety
rollout_release_commit="$TARGET_RELEASE_COMMIT"
rollout_target_release=unprepared
rollout_previous_release="$CURRENT_RELEASE_DIR"
rollout_target_backup="$BACKUP_DIR"
rollout_safety_backup=unavailable
rollout_recovery_runtime="$SCRIPT_DIR"
rollout_started_epoch="$(date +%s)"
if [[ "$RECOVERY_MODE" == "true" ]]; then
  rollout_phase=data-recovery
  rollout_release_commit="$recovery_release_commit"
  rollout_target_backup="$recovery_target_backup"
  rollout_safety_backup="$recovery_safety_backup"
  rollout_recovery_runtime="$recovery_runtime_dir"
  rollout_started_epoch="$recovery_started_epoch"
fi
health_timer_was_enabled=disabled
health_timer_was_active=inactive
backup_timer_was_enabled=disabled
backup_timer_was_active=inactive
if [[ "$RECOVERY_MODE" == "true" ]]; then
  health_timer_was_enabled="$recovery_health_timer_enabled"
  health_timer_was_active="$recovery_health_timer_active"
  backup_timer_was_enabled="$recovery_backup_timer_enabled"
  backup_timer_was_active="$recovery_backup_timer_active"
fi
persist_rollout_marker() {
  local marker_temp
  umask 077
  marker_temp="$(mktemp /opt/.resumesystem-rollout-in-progress.restore.XXXXXX)"
  printf 'ROLLOUT_STATE=%s\nROLLOUT_OPERATION=restore\nROLLOUT_PHASE=%s\nROLLOUT_RELEASE_COMMIT=%s\nROLLOUT_RELEASE_DIR=%s\nROLLOUT_PREVIOUS_RELEASE=%s\nROLLOUT_BACKUP_DIR=%s\nROLLOUT_SAFETY_BACKUP_DIR=%s\nROLLOUT_BACKUP_ROOT=%s\nROLLOUT_RECOVERY_RUNTIME_DIR=%s\nROLLOUT_HEALTH_TIMER_ENABLED=%s\nROLLOUT_HEALTH_TIMER_ACTIVE=%s\nROLLOUT_BACKUP_TIMER_ENABLED=%s\nROLLOUT_BACKUP_TIMER_ACTIVE=%s\nROLLOUT_STARTED_EPOCH=%s\n' \
    "$rollout_state" "$rollout_phase" "$rollout_release_commit" \
    "$rollout_target_release" "$rollout_previous_release" \
    "$rollout_target_backup" "$rollout_safety_backup" "$BACKUP_ROOT" \
    "$rollout_recovery_runtime" \
    "$health_timer_was_enabled" "$health_timer_was_active" \
    "$backup_timer_was_enabled" "$backup_timer_was_active" \
    "$rollout_started_epoch" > "$marker_temp"
  sync -f "$marker_temp"
  mv -Tf "$marker_temp" "$ROLLOUT_MARKER"
  sync -f /opt
}
clear_rollout_marker() {
  rm -f -- "$ROLLOUT_MARKER"
  sync -f /opt
}
close_public_traffic() {
  "${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
    stop reverse-proxy >/dev/null 2>&1 || true
  docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
}
recover_original_stack() {
  "${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
    up -d --no-build --no-deps qdrant || return 1
  wait_container_health resume-qdrant 30 || return 1
  "${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
    up -d --no-build --no-deps agent || return 1
  wait_container_health resume-agent 180 || return 1
  "${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
    up -d --no-build --no-deps backend || return 1
  wait_container_health resume-backend 120 || return 1
  "${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
    up -d --no-build --no-deps web admin || return 1
  wait_container_health resume-web 30 || return 1
  wait_container_health resume-admin 30 || return 1
  "${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
    up -d --no-build --no-deps --force-recreate reverse-proxy || return 1
  wait_container_health resume-proxy 30
}

data_restore_started=false
restore_dir_created=""
staging_mysql_container=""
staging_mysql_volume=""
restore_timer_state() {
  local unit="$1"
  local enabled_state="$2"
  local active_state="$3"
  case "$enabled_state" in
    enabled) systemctl enable "$unit" >/dev/null || return 1 ;;
    enabled-runtime) systemctl enable --runtime "$unit" >/dev/null || return 1 ;;
    disabled) systemctl disable "$unit" >/dev/null 2>&1 || return 1 ;;
    *) return 1 ;;
  esac
  if [[ "$active_state" == "active" ]]; then
    systemctl start "$unit" || return 1
  else
    systemctl stop "$unit" >/dev/null 2>&1 || return 1
  fi
  [[ "$(systemctl is-enabled "$unit" 2>/dev/null || true)" == "$enabled_state" \
    && "$(systemctl is-active "$unit" 2>/dev/null || true)" == "$active_state" ]]
}
fail_restore() {
  local exit_code="${1:-1}"
  local message="${2:-Restore failed}"
  trap - ERR HUP INT TERM
  set +e
  if [[ -n "$staging_mysql_container" ]]; then
    docker rm -f "$staging_mysql_container" >/dev/null 2>&1 || true
  fi
  if [[ -n "$staging_mysql_volume" ]]; then
    docker volume rm "$staging_mysql_volume" >/dev/null 2>&1 || true
  fi
  if [[ "$RECOVERY_MODE" == "true" || "$data_restore_started" == "true" ]]; then
    maintenance_enable >/dev/null 2>&1 || true
    close_public_traffic
    echo "$message after data mutation; public traffic remains stopped" >&2
  elif [[ "$rollout_safety_backup" != "unavailable" \
    && -f "$ROLLOUT_MARKER" ]]; then
    maintenance_enable >/dev/null 2>&1 || true
    close_public_traffic
    RESUMESYSTEM_OPERATION_LOCK_HELD=true \
      "$SCRIPT_DIR/recover-interrupted-rollout.sh" --confirm "$ROLLOUT_MARKER"
    recovery_status=$?
    if [[ "$recovery_status" -eq 0 ]]; then
      current_after_recovery="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
      resolved_restore_dir="$(readlink -f "$restore_dir_created" 2>/dev/null || true)"
      if [[ -n "$resolved_restore_dir" \
        && "$resolved_restore_dir" == "$restore_dir_created" \
        && "$resolved_restore_dir" == /opt/resumesystem-restored-* \
        && "$resolved_restore_dir" != "$current_after_recovery" \
        && -d "$resolved_restore_dir" \
        && ! -L "$resolved_restore_dir" ]]; then
        rm -rf -- "$resolved_restore_dir"
      fi
      echo "$message; the verified safety backup restored the original stack" >&2
    else
      echo "$message; automatic safety recovery failed and public traffic remains stopped" >&2
    fi
  else
    recover_original_stack
    recovery_status=$?
    if [[ "$recovery_status" -eq 0 ]]; then
      restore_timer_state resumesystem-health.timer \
        "$health_timer_was_enabled" "$health_timer_was_active" \
        || recovery_status=1
      restore_timer_state resumesystem-backup.timer \
        "$backup_timer_was_enabled" "$backup_timer_was_active" \
        || recovery_status=1
    fi
    if [[ "$recovery_status" -eq 0 ]]; then
      clear_rollout_marker || recovery_status=1
    fi
    if [[ "$recovery_status" -eq 0 ]]; then
      maintenance_disable || recovery_status=1
    fi
    if [[ "$recovery_status" -ne 0 ]]; then
      [[ -f "$ROLLOUT_MARKER" ]] || persist_rollout_marker >/dev/null 2>&1 || true
      maintenance_enable >/dev/null 2>&1 || true
      close_public_traffic
      echo "$message; the original stack did not recover and public traffic remains stopped" >&2
    else
      echo "$message; the original verified stack was restored" >&2
    fi
    resolved_restore_dir="$(readlink -f "$restore_dir_created" 2>/dev/null || true)"
    if [[ -n "$resolved_restore_dir" \
      && "$resolved_restore_dir" == "$restore_dir_created" \
      && "$resolved_restore_dir" == /opt/resumesystem-restored-* \
      && -d "$resolved_restore_dir" \
      && ! -L "$resolved_restore_dir" ]]; then
      rm -rf -- "$resolved_restore_dir"
    fi
  fi
  exit "$exit_code"
}
trap 'fail_restore $? "Restore command failed"' ERR
trap 'fail_restore 129 "Restore hung up"' HUP
trap 'fail_restore 130 "Restore interrupted"' INT
trap 'fail_restore 143 "Restore terminated"' TERM

if [[ "$RECOVERY_MODE" != "true" ]]; then
  health_timer_was_enabled="$(systemctl is-enabled resumesystem-health.timer 2>/dev/null || true)"
  health_timer_was_active="$(systemctl is-active resumesystem-health.timer 2>/dev/null || true)"
  backup_timer_was_enabled="$(systemctl is-enabled resumesystem-backup.timer 2>/dev/null || true)"
  backup_timer_was_active="$(systemctl is-active resumesystem-backup.timer 2>/dev/null || true)"
fi
for timer_state in "$health_timer_was_enabled" "$backup_timer_was_enabled"; do
  [[ "$timer_state" =~ ^(enabled|enabled-runtime|disabled)$ ]] || {
    echo "Restore timer enablement is not safely restorable: $timer_state" >&2
    exit 1
  }
done
for timer_state in "$health_timer_was_active" "$backup_timer_was_active"; do
  [[ "$timer_state" =~ ^(active|inactive)$ ]] || {
    echo "Restore timer activity is not safely restorable: $timer_state" >&2
    exit 1
  }
done

# Persist the rollout intent before the first running-stack mutation. The
# boot-time units installed above will keep ports 80/443 closed if power is
# lost at any later instruction.
persist_rollout_marker
if [[ "$RECOVERY_MODE" == "true" ]]; then
  data_restore_started=true
fi

# Close writes before the safety snapshot and keep them closed across image
# loading, target preparation and historical data replacement.
maintenance_enable
close_public_traffic
systemctl disable --now resumesystem-health.timer resumesystem-backup.timer >/dev/null
systemctl stop resumesystem-health.service resumesystem-backup.service 2>/dev/null || true
if systemctl is-enabled --quiet resumesystem-health.timer \
  || systemctl is-enabled --quiet resumesystem-backup.timer; then
  fail_restore 1 "Observation timers could not be persistently disabled"
fi
if [[ "$RECOVERY_MODE" != "true" ]]; then
  echo "Creating mandatory pre-restore backup while public writes remain frozen..."
  if ! safety_backup_output="$(ENV_FILE="$CURRENT_ENV_FILE" COMPOSE_FILE="$CURRENT_COMPOSE_FILE" \
    BACKUP_ROOT="$BACKUP_ROOT" INCLUDE_IMAGES=true KEEP_PROXY_STOPPED=true \
    ALLOW_PRE_RAG_BACKUP="$ALLOW_LEGACY_SAFETY_BACKUP" \
    RETENTION_COUNT=999999 SOURCE_DIR="$CURRENT_RELEASE_DIR" \
    "$SCRIPT_DIR/backup.sh")"; then
    fail_restore 1 "Pre-restore safety backup failed"
  fi
  printf '%s\n' "$safety_backup_output"
  safety_backup_line="$(printf '%s\n' "$safety_backup_output" | tail -1)"
  [[ "$safety_backup_line" =~ ^backup:\ passed\ \((/opt/resumesystem-backups/v1[.]3-[0-9]{8}-[0-9]{6})\)$ ]] \
    || fail_restore 1 "Pre-restore safety backup did not report an immutable directory"
  rollout_safety_backup="$(readlink -f "${BASH_REMATCH[1]}")"
  [[ "$rollout_safety_backup" == "$BACKUP_ROOT"/* \
    && "$rollout_safety_backup" != "$BACKUP_DIR" \
    && -f "$rollout_safety_backup/SHA256SUMS" ]] \
    || fail_restore 1 "Pre-restore safety backup path is invalid"
  (
    cd "$rollout_safety_backup"
    sha256sum -c SHA256SUMS
  ) || fail_restore 1 "Pre-restore safety backup checksum failed"
  safety_commit="$(tr -d '\r\n' < "$rollout_safety_backup/release-commit.txt")"
  current_commit="$(awk -F= '$1 == "RELEASE_COMMIT" {print $2}' \
    "$CURRENT_RELEASE_DIR/.env" | tail -1 | tr -d '\r')"
  [[ "$safety_commit" =~ ^[0-9a-f]{40}$ && "$safety_commit" == "$current_commit" ]] \
    || fail_restore 1 "Pre-restore safety backup is not bound to the current release"
  rollout_phase=pre-data
  persist_rollout_marker
fi

# A safety backup must never age out or mutate the selected restore target.
(
  cd "$BACKUP_DIR"
  sha256sum -c SHA256SUMS
)
gzip -dc "$BACKUP_DIR/docker-images.tar.gz" | docker load >/dev/null

release_commit="$TARGET_RELEASE_COMMIT"
if [[ "$RECOVERY_MODE" == "true" ]]; then
  restore_dir="$CURRENT_RELEASE_DIR"
  RESTORE_ENV_FILE="$CURRENT_ENV_FILE"
  RESTORE_COMPOSE_FILE="$CURRENT_COMPOSE_FILE"
else
  backup_name="$(basename "$BACKUP_DIR" | tr -cs 'A-Za-z0-9_.-' '-')"
  restore_dir="/opt/resumesystem-restored-${backup_name}-${release_commit:0:12}"
  partial_restore_dir="${restore_dir}.partial"
  [[ ! -e "$restore_dir" && ! -e "$partial_restore_dir" ]] \
    || fail_restore 1 "Restore release directory already exists"
  if tar -tzf "$BACKUP_DIR/source-with-env.tar.gz" \
    | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
    fail_restore 1 "Source archive contains an unsafe path"
  fi
  mkdir -p "$partial_restore_dir"
  restore_dir_created="$partial_restore_dir"
  tar -xzf "$BACKUP_DIR/source-with-env.tar.gz" -C "$partial_restore_dir"
  [[ -f "$partial_restore_dir/.env" \
    && -f "$partial_restore_dir/docker-compose.prod.yml" \
    && -f "$partial_restore_dir/deploy/release-manifest.env" ]] \
    || fail_restore 1 "Restored source archive is incomplete"
  restore_release_version="$(awk -F= '$1 == "RELEASE_VERSION" {print $2}' \
    "$partial_restore_dir/deploy/release-manifest.env" | tail -1 | tr -d '\r')"
  [[ "$restore_release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ \
    && "$(printf '%s\n' "$restore_release_version" 1.3.4 | sort -V | tail -1)" == "$restore_release_version" ]] \
    || fail_restore 1 "Automated data restore requires a v1.3.4+ hardened backup; use legacy backups only for exact image rollback or manual disaster recovery"
  for required_restore_file in \
    deploy/backup.sh \
    deploy/health-check.sh \
    deploy/maintenance-firewall.sh \
    deploy/recovery-acceptance.sh \
    deploy/rag-recovery-probe.py \
    deploy/restore.sh \
    deploy/recover-interrupted-backup.sh \
    deploy/recover-interrupted-rollout.sh \
    deploy/verify-runtime-manifest.sh \
    deploy/finalize-release.sh \
    deploy/rollout-guard.sh \
    deploy/systemd/resumesystem-backup-recovery.service \
    deploy/systemd/resumesystem-rollout-guard.service \
    deploy/systemd/resumesystem-rollout-proxy-guard.service; do
    [[ -f "$partial_restore_dir/$required_restore_file" ]] \
      || fail_restore 1 "Hardened restore runtime is missing: $required_restore_file"
  done
  [[ -f "$BACKUP_DIR/release-artifact/manifest.json" \
    && -f "$BACKUP_DIR/release-artifact/SHA256SUMS" ]] \
    || fail_restore 1 "Automated restore requires the release artifact manifest and checksum"
  (
    cd "$BACKUP_DIR/release-artifact"
    sha256sum -c SHA256SUMS
  ) || fail_restore 1 "Backup release artifact manifest checksum failed"
  mv "$partial_restore_dir" "$restore_dir"
  restore_dir_created="$restore_dir"
  RESTORE_ENV_FILE="$restore_dir/.env"
  RESTORE_COMPOSE_FILE="$restore_dir/docker-compose.prod.yml"
  rollout_target_release="$restore_dir"
  persist_rollout_marker
fi

read_env_value() {
  local file="$1"
  local key="$2"
  awk -F= -v wanted="$key" '$1 == wanted {sub(/^[^=]*=/, ""); value=$0} END {print value}' "$file"
}
for key in MYSQL_ROOT_PASSWORD DB_DATABASE DB_USERNAME DB_PASSWORD COMPOSE_PROJECT_NAME; do
  current_value="$(read_env_value "$CURRENT_ENV_FILE" "$key")"
  restore_value="$(read_env_value "$RESTORE_ENV_FILE" "$key")"
  [[ -n "$current_value" && "$current_value" == "$restore_value" ]] \
    || fail_restore 1 "In-place restore refuses a database identity/credential mismatch for $key"
done

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
upsert_env_value() {
  python3 - "$1" "$2" "$3" <<'PY'
from pathlib import Path
import sys

path, key, value = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
lines = path.read_text(encoding="utf-8").splitlines()
lines = [line for line in lines if not line.startswith(key + "=")]
lines.append(f"{key}={value}")
path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
}
declare -A image_variables=(
  [resume-mysql]=MYSQL_IMAGE
  [resume-backend]=BACKEND_IMAGE
  [resume-web]=WEB_IMAGE
  [resume-admin]=ADMIN_IMAGE
  [resume-proxy]=NGINX_IMAGE
  [resume-agent]=AGENT_IMAGE
  [resume-qdrant]=QDRANT_IMAGE
)
declare -A restored_image_references=()
for container in resume-mysql resume-backend resume-web resume-admin resume-proxy resume-agent resume-qdrant; do
  image_id="$(image_id_for "$container")"
  image_reference="$(image_reference_for "$container")"
  [[ "$image_id" =~ ^sha256:[0-9a-f]{64}$ \
    && "$image_reference" =~ ^[A-Za-z0-9._/-]+(:[A-Za-z0-9._-]+)?$ ]] \
    || fail_restore 1 "Backup image map is invalid for $container"
  docker image inspect "$image_id" >/dev/null
  docker tag "$image_id" "$image_reference"
  [[ "$(docker image inspect "$image_reference" --format '{{.Id}}')" == "$image_id" ]] \
    || fail_restore 1 "Failed to persist restored image reference for $container"
  restored_image_references[$container]="$image_reference"
  if [[ "$RECOVERY_MODE" != "true" ]]; then
    upsert_env_value "$RESTORE_ENV_FILE" "${image_variables[$container]}" "$image_reference"
  fi
done
if [[ "$RECOVERY_MODE" != "true" ]]; then
  upsert_env_value "$RESTORE_ENV_FILE" RELEASE_COMMIT "$release_commit"
fi
if [[ "$RECOVERY_MODE" != "true" && -d "$BACKUP_DIR/release-artifact" ]]; then
  rm -rf -- "$restore_dir/release-artifact"
  cp -a "$BACKUP_DIR/release-artifact" "$restore_dir/release-artifact"
  upsert_env_value "$RESTORE_ENV_FILE" RELEASE_ARTIFACT_MANIFEST \
    "$restore_dir/release-artifact/manifest.json"
  upsert_env_value "$RESTORE_ENV_FILE" RELEASE_ARTIFACT_CHECKSUMS \
    "$restore_dir/release-artifact/SHA256SUMS"
fi
"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" config -q

BACKUP_HELPER_IMAGE="${BACKUP_HELPER_IMAGE:-alpine:3.20}"
docker image inspect "$BACKUP_HELPER_IMAGE" >/dev/null \
  || fail_restore 1 "Backup helper image was not restored"
restore_volume() {
  local volume="$1"
  local archive="$2"
  docker run --rm \
    -v "${volume}:/data" \
    -v "${BACKUP_DIR}:/backup:ro" \
    "$BACKUP_HELPER_IMAGE" sh -c \
      "find /data -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -xzf '/backup/${archive}' -C /data"
}

# Build and import a clean target-version MySQL data directory before touching
# the active volume. This avoids opening a newer data directory with an older
# rollback image, which MySQL does not support safely.
"${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" \
  stop web admin backend agent qdrant
database_name="$(read_env_value "$RESTORE_ENV_FILE" DB_DATABASE)"
database_user="$(read_env_value "$RESTORE_ENV_FILE" DB_USERNAME)"
database_password="$(read_env_value "$RESTORE_ENV_FILE" DB_PASSWORD)"
mysql_root_password="$(read_env_value "$RESTORE_ENV_FILE" MYSQL_ROOT_PASSWORD)"
project_name="$(read_env_value "$RESTORE_ENV_FILE" COMPOSE_PROJECT_NAME)"
[[ "$database_name" =~ ^[A-Za-z0-9_]+$ \
  && "$database_user" =~ ^[A-Za-z0-9_]+$ \
  && "$project_name" =~ ^[A-Za-z0-9_-]+$ ]] \
  || fail_restore 1 "Restored database identity is unsafe"
staging_suffix="${release_commit:0:12}"
if [[ "$RECOVERY_MODE" == "true" ]]; then
  staging_suffix="recover-${release_commit:0:8}-$(date +%s)-$$"
fi
staging_mysql_volume="${project_name}_mysql_restore_${staging_suffix}"
staging_mysql_container="resume-mysql-restore-${staging_suffix}"
staging_mysql_image="${restored_image_references[resume-mysql]}"
export MYSQL_ROOT_PASSWORD="$mysql_root_password"
export MYSQL_DATABASE="$database_name"
export MYSQL_USER="$database_user"
export MYSQL_PASSWORD="$database_password"
docker volume create "$staging_mysql_volume" >/dev/null
docker run -d --name "$staging_mysql_container" \
  -e MYSQL_ROOT_PASSWORD -e MYSQL_DATABASE -e MYSQL_USER -e MYSQL_PASSWORD \
  -v "${staging_mysql_volume}:/var/lib/mysql" \
  "$staging_mysql_image" \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci \
  --default-time-zone=+08:00 >/dev/null
staging_mysql_ready=false
for _ in {1..120}; do
  if docker exec "$staging_mysql_container" sh -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqladmin ping -h 127.0.0.1 -uroot --silent' \
    >/dev/null 2>&1; then
    staging_mysql_ready=true
    break
  fi
  sleep 2
done
[[ "$staging_mysql_ready" == "true" ]] \
  || fail_restore 1 "Staging MySQL did not become healthy"
docker exec -i "$staging_mysql_container" sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot "$MYSQL_DATABASE"' \
  < "$BACKUP_DIR/mysql.sql"
docker stop --time 60 "$staging_mysql_container" >/dev/null
[[ "$(docker inspect "$staging_mysql_container" --format '{{.State.Status}}' 2>/dev/null || true)" == "exited" ]] \
  || fail_restore 1 "Staging MySQL did not shut down cleanly"
docker rm "$staging_mysql_container" >/dev/null
staging_mysql_container=""

# From this point onward, any failure is deliberately fail-closed.
if [[ "$RECOVERY_MODE" != "true" ]]; then
  rollout_phase=data-mutation
  persist_rollout_marker
fi
data_restore_started=true
"${COMPOSE[@]}" --env-file "$CURRENT_ENV_FILE" -f "$CURRENT_COMPOSE_FILE" stop mysql
docker run --rm \
  -v "${staging_mysql_volume}:/from:ro" \
  -v "${project_name}_mysql_data:/to" \
  "$BACKUP_HELPER_IMAGE" sh -c \
  'find /to -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && cp -a /from/. /to/'
docker volume rm "$staging_mysql_volume" >/dev/null
staging_mysql_volume=""
"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate mysql
wait_container_health resume-mysql 120 \
  || fail_restore 1 "Restored MySQL did not become healthy"

restore_volume "${project_name}_qdrant_data" qdrant-storage.tar.gz
restore_volume "${project_name}_backend_uploads" uploads.tar.gz
restore_volume "${project_name}_fastembed_models" fastembed-models.tar.gz

"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate qdrant
wait_container_health resume-qdrant 30 || fail_restore 1 "Restored Qdrant did not start"
"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate agent
wait_container_health resume-agent 180 || fail_restore 1 "Restored Agent did not become healthy"
"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate backend
wait_container_health resume-backend 120 || fail_restore 1 "Restored backend did not become healthy"
"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate web admin
wait_container_health resume-web 30 || fail_restore 1 "Restored web did not become healthy"
wait_container_health resume-admin 30 || fail_restore 1 "Restored admin did not become healthy"
"${COMPOSE[@]}" --env-file "$RESTORE_ENV_FILE" -f "$RESTORE_COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate reverse-proxy
wait_container_health resume-proxy 30 || fail_restore 1 "Restored proxy did not become healthy"

rag_ready="$(tr -d '\r\n' < "$BACKUP_DIR/rag-ready.txt")"
[[ "$rag_ready" == "true" || "$rag_ready" == "false" ]] \
  || fail_restore 1 "Restored RAG readiness marker is invalid"
if [[ "$RECOVERY_MODE" == "true" ]]; then
  RAG_REQUIRED="$rag_ready" ENV_FILE="$RESTORE_ENV_FILE" \
    "$SCRIPT_DIR/recovery-acceptance.sh" \
    || fail_restore 1 "Safety-backup invariant acceptance failed"
else
  ENV_FILE="$RESTORE_ENV_FILE" "$restore_dir/deploy/health-check.sh"
  RAG_REQUIRED="$rag_ready" ENV_FILE="$RESTORE_ENV_FILE" \
    "$SCRIPT_DIR/recovery-acceptance.sh" \
    || fail_restore 1 "Restored invariant acceptance failed"
  rollout_phase=target-running
  persist_rollout_marker
fi

temporary_link="/opt/.resumesystem-current-restore-${release_commit:0:12}"
rm -f -- "$temporary_link"
ln -s "$restore_dir" "$temporary_link"
mv -Tf "$temporary_link" /opt/resumesystem-current
for unit_file in \
  resumesystem-health.service \
  resumesystem-health.timer \
  resumesystem-backup.service \
  resumesystem-backup.timer; do
  unit_source="$restore_dir/deploy/systemd/$unit_file"
  if [[ -f "$unit_source" ]]; then
    install -m 0644 "$unit_source" "/etc/systemd/system/$unit_file"
  elif [[ "$RECOVERY_MODE" != "true" ]]; then
    fail_restore 1 "Restored release is missing systemd unit: $unit_file"
  fi
done
guard_source_dir="$restore_dir/deploy"
if [[ "$RECOVERY_MODE" == "true" ]]; then
  guard_source_dir="$SCRIPT_DIR"
fi
install -m 0755 "$guard_source_dir/rollout-guard.sh" \
  /usr/local/sbin/resumesystem-rollout-guard
install -m 0755 "$guard_source_dir/recover-interrupted-backup.sh" \
  /usr/local/sbin/resumesystem-recover-backup
install -m 0644 "$guard_source_dir/systemd/resumesystem-rollout-guard.service" \
  /etc/systemd/system/resumesystem-rollout-guard.service
install -m 0644 "$guard_source_dir/systemd/resumesystem-rollout-proxy-guard.service" \
  /etc/systemd/system/resumesystem-rollout-proxy-guard.service
install -m 0644 "$guard_source_dir/systemd/resumesystem-backup-recovery.service" \
  /etc/systemd/system/resumesystem-backup-recovery.service
systemctl daemon-reload
systemctl enable resumesystem-rollout-guard.service \
  resumesystem-rollout-proxy-guard.service \
  resumesystem-backup-recovery.service >/dev/null
systemctl is-enabled --quiet resumesystem-rollout-guard.service
systemctl is-enabled --quiet resumesystem-rollout-proxy-guard.service
systemctl is-enabled --quiet resumesystem-backup-recovery.service

if [[ "$RECOVERY_MODE" == "true" ]]; then
  # Restore non-public timer state while the recovery marker is still retryable
  # and the maintenance firewall remains active.
  restore_timer_state resumesystem-health.timer \
    "$health_timer_was_enabled" "$health_timer_was_active" \
    || fail_restore 1 "Could not restore the health timer state"
  restore_timer_state resumesystem-backup.timer \
    "$backup_timer_was_enabled" "$backup_timer_was_active" \
    || fail_restore 1 "Could not restore the backup timer state"
  if [[ -f "$PENDING_FILE" ]]; then
    pending_commit="$(marker_value "$PENDING_FILE" PENDING_RELEASE_COMMIT)" \
      || fail_restore 1 "Pending restore marker has an invalid release binding"
    pending_epoch="$(marker_value "$PENDING_FILE" PENDING_DEPLOYED_EPOCH)" \
      || fail_restore 1 "Pending restore marker has an invalid deployment epoch"
    [[ "$pending_commit" == "$recovery_release_commit" ]] \
      || fail_restore 1 "Pending restore marker belongs to another release"
    [[ "$pending_epoch" =~ ^[1-9][0-9]{0,11}$ ]] \
      || fail_restore 1 "Pending restore marker has an invalid deployment epoch"
  fi
  # Commit the accepted recovery while public traffic is still fail-closed. A
  # kill after marker deletion is either closed or fully recovered; it can no
  # longer leave a durable recovery marker alongside reopened public traffic.
  rm -f -- "$PENDING_FILE"
  sync -f /opt
  rm -f -- "$ROLLOUT_MARKER"
  sync -f /opt
  maintenance_disable || fail_restore 1 "Could not reopen safety-backup traffic"
else
  umask 077
  pending_epoch="$(date +%s)"
  pending_temp="$(mktemp /opt/.resumesystem-release-pending.restore.XXXXXX)"
  printf 'PENDING_RELEASE_COMMIT=%s\nPENDING_DEPLOYED_EPOCH=%s\n' \
    "$release_commit" "$pending_epoch" > "$pending_temp"
  sync -f "$pending_temp"
  mv -Tf "$pending_temp" "$PENDING_FILE"
  sync -f /opt
  rollout_state=pending
  rollout_phase=pending
  persist_rollout_marker
  maintenance_disable || fail_restore 1 "Could not reopen verified restored traffic"
fi
data_restore_started=false
trap - ERR HUP INT TERM
if [[ "$RECOVERY_MODE" == "true" ]]; then
  echo "restore: recovered interrupted restore from safety backup ($BACKUP_DIR -> $restore_dir)"
else
  echo "restore: passed ($BACKUP_DIR -> $restore_dir); timers remain stopped for observation"
fi
