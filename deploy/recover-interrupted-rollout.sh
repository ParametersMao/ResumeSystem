#!/usr/bin/env bash
set -Eeuo pipefail

DEFAULT_MARKER=/opt/resumesystem-rollout-in-progress.env
PENDING_FILE=/opt/resumesystem-release-pending.env
if [[ "${1:-}" != "--confirm" || "${2:-}" != "$DEFAULT_MARKER" || $# -ne 2 ]]; then
  echo "Usage: $0 --confirm $DEFAULT_MARKER" >&2
  exit 2
fi

MARKER="$2"
[[ -f "$MARKER" && "$(stat -c '%u:%a' "$MARKER")" == "0:600" ]] || {
  echo "Interrupted rollout marker must be a root-owned mode-600 regular file" >&2
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
validate_timer_states() {
  local state
  for state in "$ROLLOUT_HEALTH_TIMER_ENABLED" "$ROLLOUT_BACKUP_TIMER_ENABLED"; do
    [[ "$state" =~ ^(enabled|enabled-runtime|disabled)$ ]] || {
      echo "Interrupted rollout marker has an invalid timer enabled state" >&2
      return 1
    }
  done
  for state in "$ROLLOUT_HEALTH_TIMER_ACTIVE" "$ROLLOUT_BACKUP_TIMER_ACTIVE"; do
    [[ "$state" =~ ^(active|inactive)$ ]] || {
      echo "Interrupted rollout marker has an invalid timer active state" >&2
      return 1
    }
  done
}
verify_backup() {
  local backup_dir="$1"
  [[ "$backup_dir" == "$backup_root"/* \
    && -f "$backup_dir/SHA256SUMS" \
    && -f "$backup_dir/image-map.tsv" \
    && -f "$backup_dir/docker-images.tar.gz" \
    && -f "$backup_dir/release-commit.txt" ]] || return 1
  (
    cd "$backup_dir"
    sha256sum -c SHA256SUMS
  )
}
restore_timer_state() {
  local unit="$1"
  local enabled_state="$2"
  local active_state="$3"
  case "$enabled_state" in
    enabled) systemctl enable "$unit" >/dev/null ;;
    enabled-runtime) systemctl enable --runtime "$unit" >/dev/null ;;
    disabled) systemctl disable "$unit" >/dev/null 2>&1 || return 1 ;;
    *) return 1 ;;
  esac
  if [[ "$active_state" == "active" ]]; then
    systemctl start "$unit"
  else
    systemctl stop "$unit" >/dev/null 2>&1 || return 1
  fi
  [[ "$(systemctl is-enabled "$unit" 2>/dev/null || true)" == "$enabled_state" \
    && "$(systemctl is-active "$unit" 2>/dev/null || true)" == "$active_state" ]]
}
stack_images_match_backup() {
  local container expected actual
  for container in \
    resume-mysql resume-backend resume-web resume-admin resume-proxy resume-agent resume-qdrant; do
    expected="$(awk -F '\t' -v name="$container" \
      'NR > 1 && $1 == name {print $3}' "$backup_dir/image-map.tsv")"
    [[ "$expected" =~ ^sha256:[0-9a-f]{64}$ \
      && "$(printf '%s\n' "$expected" | sed '/^$/d' | wc -l)" -eq 1 ]] \
      || return 1
    actual="$(docker inspect "$container" --format '{{.Image}}' 2>/dev/null || true)"
    [[ "$actual" == "$expected" ]] || return 1
  done
}
stack_runtime_ready() {
  local container snapshot status health restarts oom
  for container in \
    resume-mysql resume-backend resume-web resume-admin resume-proxy resume-agent resume-qdrant; do
    snapshot="$(docker inspect "$container" \
      --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}|{{.RestartCount}}|{{.State.OOMKilled}}' \
      2>/dev/null || true)"
    IFS='|' read -r status health restarts oom <<< "$snapshot"
    [[ "$status" == running && "$restarts" == 0 && "$oom" == false ]] || return 1
    if [[ "$container" == resume-qdrant ]]; then
      [[ "$health" == missing || "$health" == healthy ]] || return 1
    else
      [[ "$health" == healthy ]] || return 1
    fi
  done
}

ROLLOUT_STATE="$(marker_value ROLLOUT_STATE)"
ROLLOUT_OPERATION="$(marker_value ROLLOUT_OPERATION)"
ROLLOUT_PHASE="$(marker_value ROLLOUT_PHASE)"
ROLLOUT_RELEASE_COMMIT="$(marker_value ROLLOUT_RELEASE_COMMIT)"
ROLLOUT_RELEASE_DIR="$(marker_value ROLLOUT_RELEASE_DIR)"
ROLLOUT_PREVIOUS_RELEASE="$(marker_value ROLLOUT_PREVIOUS_RELEASE)"
ROLLOUT_BACKUP_DIR="$(marker_value ROLLOUT_BACKUP_DIR)"
ROLLOUT_BACKUP_ROOT="$(marker_value ROLLOUT_BACKUP_ROOT)"
ROLLOUT_RECOVERY_RUNTIME_DIR="$(marker_value ROLLOUT_RECOVERY_RUNTIME_DIR)"
ROLLOUT_HEALTH_TIMER_ENABLED="$(marker_value ROLLOUT_HEALTH_TIMER_ENABLED)"
ROLLOUT_HEALTH_TIMER_ACTIVE="$(marker_value ROLLOUT_HEALTH_TIMER_ACTIVE)"
ROLLOUT_BACKUP_TIMER_ENABLED="$(marker_value ROLLOUT_BACKUP_TIMER_ENABLED)"
ROLLOUT_BACKUP_TIMER_ACTIVE="$(marker_value ROLLOUT_BACKUP_TIMER_ACTIVE)"
ROLLOUT_STARTED_EPOCH="$(marker_value ROLLOUT_STARTED_EPOCH)"

[[ "$ROLLOUT_STATE" =~ ^(in-progress|pending)$ \
  && "$ROLLOUT_OPERATION" =~ ^(deploy|restore)$ \
  && "$ROLLOUT_RELEASE_COMMIT" =~ ^[0-9a-f]{40}$ \
  && "$ROLLOUT_BACKUP_ROOT" == /opt/resumesystem-backups \
  && "$ROLLOUT_STARTED_EPOCH" =~ ^[1-9][0-9]{0,11}$ ]] || {
  echo "Interrupted rollout marker has invalid common recovery context" >&2
  exit 1
}
validate_timer_states
if [[ -f "$PENDING_FILE" ]]; then
  [[ ! -L "$PENDING_FILE" && "$(stat -c '%u:%a' "$PENDING_FILE")" == "0:600" ]] || {
    echo "Pending marker must be a root-owned mode-600 regular file" >&2
    exit 1
  }
  pending_commit="$(env_value "$PENDING_FILE" PENDING_RELEASE_COMMIT)" || {
    echo "Pending marker has an invalid release binding" >&2
    exit 1
  }
  pending_epoch="$(env_value "$PENDING_FILE" PENDING_DEPLOYED_EPOCH)" || {
    echo "Pending marker has an invalid deployment epoch" >&2
    exit 1
  }
  [[ "$pending_commit" == "$ROLLOUT_RELEASE_COMMIT" \
    && "$pending_epoch" =~ ^[1-9][0-9]{0,11}$ ]] || {
    echo "Pending marker does not match the interrupted rollout" >&2
    exit 1
  }
fi
backup_root="$(canonical_path "$ROLLOUT_BACKUP_ROOT")" || {
  echo "Backup root must not traverse symlinks" >&2
  exit 1
}
previous_release="$(canonical_path "$ROLLOUT_PREVIOUS_RELEASE")" || {
  echo "Previous release path must not traverse symlinks" >&2
  exit 1
}
backup_dir="$(canonical_path "$ROLLOUT_BACKUP_DIR")" || {
  echo "Target/rollback backup path must not traverse symlinks" >&2
  exit 1
}
[[ "$previous_release" == /opt/resumesystem-* \
  && "$previous_release" != /opt/resumesystem-current \
  && -f "$previous_release/.env" \
  && -f "$previous_release/docker-compose.prod.yml" ]] || {
  echo "Previous immutable release is incomplete" >&2
  exit 1
}
verify_backup "$backup_dir" || {
  echo "Target/rollback backup verification failed" >&2
  exit 1
}

SCRIPT_DIR="$(canonical_path "$ROLLOUT_RECOVERY_RUNTIME_DIR")" || {
  echo "Recovery runtime path must not traverse symlinks" >&2
  exit 1
}
[[ "$SCRIPT_DIR" == /opt/resumesystem-*/deploy ]] || {
  echo "Recovery runtime must belong to an immutable release" >&2
  exit 1
}
for runtime_file in \
  maintenance-firewall.sh \
  recovery-acceptance.sh \
  rollback-images.sh \
  restore.sh; do
  [[ -f "$SCRIPT_DIR/$runtime_file" ]] || {
    echo "Recovery runtime is missing: $SCRIPT_DIR/$runtime_file" >&2
    exit 1
  }
done
# shellcheck disable=SC1091
source "$SCRIPT_DIR/maintenance-firewall.sh"
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
  maintenance_enable >/dev/null 2>&1 || true
  "${COMPOSE[@]}" --env-file "$previous_release/.env" \
    -f "$previous_release/docker-compose.prod.yml" stop reverse-proxy \
    >/dev/null 2>&1 || true
  docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
}
fail_recovery() {
  local exit_code="${1:-1}"
  trap - ERR HUP INT TERM
  set +e
  close_public_traffic
  echo "Interrupted $ROLLOUT_OPERATION recovery failed; durable marker retained and public traffic remains stopped" >&2
  exit "$exit_code"
}
trap 'fail_recovery $?' ERR
trap 'fail_recovery 129' HUP
trap 'fail_recovery 130' INT
trap 'fail_recovery 143' TERM

relink_previous_release() {
  local previous_link
  previous_link="/opt/.resumesystem-current-recover-${ROLLOUT_RELEASE_COMMIT:0:12}"
  rm -f -- "$previous_link"
  ln -s "$previous_release" "$previous_link"
  mv -Tf "$previous_link" /opt/resumesystem-current
  sync -f /opt
}
clear_recovery_markers() {
  if [[ -f "$PENDING_FILE" ]]; then
    pending_commit="$(env_value "$PENDING_FILE" PENDING_RELEASE_COMMIT)" || {
      echo "Pending marker has an invalid release binding" >&2
      return 1
    }
    pending_epoch="$(env_value "$PENDING_FILE" PENDING_DEPLOYED_EPOCH)" || {
      echo "Pending marker has an invalid deployment epoch" >&2
      return 1
    }
    [[ "$pending_commit" == "$ROLLOUT_RELEASE_COMMIT" ]] || {
      echo "Pending marker belongs to another release" >&2
      return 1
    }
    [[ "$pending_epoch" =~ ^[1-9][0-9]{0,11}$ ]] || {
      echo "Pending marker has an invalid deployment epoch" >&2
      return 1
    }
  fi
  # The complete rollout marker is the recovery source of truth and must be
  # deleted last. A failure or signal before that commit may leave rollout-only,
  # which is retryable; it must never leave an unrecoverable pending-only state.
  rm -f -- "$PENDING_FILE"
  sync -f /opt
  rm -f -- "$MARKER"
  sync -f /opt
}
complete_recovery() {
  # Restore non-public timer state first so a failure remains fully retryable
  # through the durable marker. The maintenance firewall and stopped proxy stay
  # fail-closed until marker deletion has been committed.
  restore_timer_state resumesystem-health.timer \
    "$ROLLOUT_HEALTH_TIMER_ENABLED" "$ROLLOUT_HEALTH_TIMER_ACTIVE"
  restore_timer_state resumesystem-backup.timer \
    "$ROLLOUT_BACKUP_TIMER_ENABLED" "$ROLLOUT_BACKUP_TIMER_ACTIVE"
  clear_recovery_markers
  maintenance_disable
  trap - ERR HUP INT TERM
}

close_public_traffic
if [[ "$ROLLOUT_OPERATION" == "deploy" ]]; then
  [[ "$ROLLOUT_PHASE" =~ ^(deploying|pending)$ ]] || {
    echo "Interrupted deploy marker has an invalid phase" >&2
    false
  }
  release_dir="$(canonical_path "$ROLLOUT_RELEASE_DIR")" || {
    echo "Candidate release path must not traverse symlinks" >&2
    false
  }
  for required in \
    "$release_dir/.env" \
    "$release_dir/docker-compose.prod.yml" \
    "$release_dir/deploy/release-manifest.env" \
    "$release_dir/deploy/bootstrap-rag-fixture.sh"; do
    [[ -f "$required" ]] || { echo "Interrupted deploy recovery input is missing: $required" >&2; false; }
  done
  [[ ! -L "$release_dir/.env" \
    && "$(stat -c '%u:%a' "$release_dir/.env")" == "0:600" ]] || {
    echo "Interrupted deploy env must be root-owned mode 600" >&2
    false
  }
  release_env_commit="$(env_value "$release_dir/.env" RELEASE_COMMIT)" || {
    echo "Interrupted deploy env has an invalid RELEASE_COMMIT binding" >&2
    false
  }
  artifact_manifest_requested="$(env_value "$release_dir/.env" RELEASE_ARTIFACT_MANIFEST)" || {
    echo "Interrupted deploy env has an invalid artifact manifest binding" >&2
    false
  }
  artifact_checksums_requested="$(env_value "$release_dir/.env" RELEASE_ARTIFACT_CHECKSUMS)" || {
    echo "Interrupted deploy env has an invalid artifact checksum binding" >&2
    false
  }
  artifact_manifest="$(canonical_path "$artifact_manifest_requested")" || {
    echo "Interrupted deploy artifact manifest must not traverse symlinks" >&2
    false
  }
  artifact_checksums="$(canonical_path "$artifact_checksums_requested")" || {
    echo "Interrupted deploy artifact checksums must not traverse symlinks" >&2
    false
  }
  [[ -f "$artifact_manifest" && ! -L "$artifact_manifest" \
    && -f "$artifact_checksums" && ! -L "$artifact_checksums" \
    && "$(dirname "$artifact_manifest")" == "$(dirname "$artifact_checksums")" ]] || {
    echo "Interrupted deploy artifact bindings are incomplete" >&2
    false
  }
  artifact_manifest_name="$(basename "$artifact_manifest")"
  artifact_manifest_hashes="$(awk -v wanted="$artifact_manifest_name" \
    '$2 == wanted {print $1}' "$artifact_checksums")"
  [[ "$(printf '%s\n' "$artifact_manifest_hashes" | sed '/^$/d' | wc -l)" -eq 1 \
    && "$artifact_manifest_hashes" =~ ^[0-9a-f]{64}$ \
    && "$(sha256sum "$artifact_manifest" | awk '{print $1}')" == "$artifact_manifest_hashes" ]] || {
    echo "Interrupted deploy artifact manifest checksum does not match" >&2
    false
  }
  release_version="$(env_value \
    "$release_dir/deploy/release-manifest.env" RELEASE_VERSION)" || {
    echo "Interrupted deploy release manifest has an invalid version binding" >&2
    false
  }
  [[ "$release_version" =~ ^[0-9]+[.][0-9]+[.][0-9]+$ ]] || {
    echo "Interrupted deploy release manifest has an invalid version" >&2
    false
  }
  artifact_binding="$(python3 - "$artifact_manifest" "$release_dir" <<'PY'
import hashlib
import json
from pathlib import Path
import re
import sys

manifest_path, release_root = map(Path, sys.argv[1:])
release_root = release_root.resolve(strict=True)
with manifest_path.open(encoding="utf-8") as handle:
    manifest = json.load(handle)
commit = manifest.get("releaseCommit")
version = manifest.get("releaseVersion")
runtime = manifest.get("runtimeFiles")
if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit):
    raise SystemExit("artifact releaseCommit is invalid")
if not isinstance(version, str) or not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
    raise SystemExit("artifact releaseVersion is invalid")
if not isinstance(runtime, dict):
    raise SystemExit("artifact runtimeFiles is invalid")
for relative in (
    "docker-compose.prod.yml",
    "deploy/release-manifest.env",
    "deploy/recover-interrupted-rollout.sh",
    "deploy/bootstrap-rag-fixture.sh",
    "deploy/maintenance-firewall.sh",
    "deploy/rollback-images.sh",
    "deploy/recovery-acceptance.sh",
    "deploy/rag-recovery-probe.py",
):
    expected = runtime.get(relative)
    path = (release_root / relative).resolve(strict=True)
    if path.parent != release_root and release_root not in path.parents:
        raise SystemExit(f"artifact runtime path escaped release root: {relative}")
    if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
        raise SystemExit(f"artifact runtime binding is missing: {relative}")
    if not path.is_file() or path.is_symlink():
        raise SystemExit(f"artifact runtime file is unsafe: {relative}")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise SystemExit(f"artifact runtime hash mismatch: {relative}")
print(f"{commit}|{version}")
PY
)" || {
    echo "Interrupted deploy artifact bindings could not be verified" >&2
    false
  }
  artifact_commit="${artifact_binding%%|*}"
  artifact_version="${artifact_binding#*|}"
  previous_env_commit="$(env_value "$previous_release/.env" RELEASE_COMMIT)" || {
    echo "Previous release env has an invalid RELEASE_COMMIT binding" >&2
    false
  }
  backup_commit="$(tr -d '\r\n' < "$backup_dir/release-commit.txt")"
  [[ "$artifact_commit" == "$ROLLOUT_RELEASE_COMMIT" \
    && "$artifact_version" == "$release_version" \
    && "$release_env_commit" == "$ROLLOUT_RELEASE_COMMIT" \
    && "$previous_env_commit" =~ ^[0-9a-f]{40}$ \
    && "$backup_commit" == "$previous_env_commit" ]] || {
    echo "Interrupted deploy commit bindings do not match" >&2
    false
  }
  current_release="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
  [[ "$current_release" == "$release_dir" || "$current_release" == "$previous_release" ]] || {
    echo "Current release link is outside the interrupted deploy context" >&2
    false
  }
  if [[ -f /opt/resumesystem-rag-bootstrap-rollout.env ]]; then
    RELEASE_COMMIT="$ROLLOUT_RELEASE_COMMIT" \
      RAG_BOOTSTRAP_MARKER=/opt/resumesystem-rag-bootstrap-rollout.env \
      "$release_dir/deploy/bootstrap-rag-fixture.sh" --cleanup-created \
      "$ROLLOUT_RELEASE_COMMIT"
  fi
  relink_previous_release
  current_release="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
  if [[ "$current_release" == "$previous_release" ]] \
    && stack_images_match_backup; then
    # A prior automatic rollback may have restored the exact image set and then
    # failed only during a cold RAG probe. Preserve the warmed Agent process on
    # retry instead of force-recreating the complete stack again.
    docker start resume-proxy >/dev/null 2>&1 || true
    recovered_runtime_ready=false
    for _ in {1..60}; do
      if stack_runtime_ready; then
        recovered_runtime_ready=true
        break
      fi
      sleep 2
    done
    if [[ "$recovered_runtime_ready" == true ]]; then
      acceptance_runtime="$SCRIPT_DIR"
      executing_runtime="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
      if [[ -f "$executing_runtime/recovery-acceptance.sh" \
        && -f "$executing_runtime/rag-recovery-probe.py" ]]; then
        acceptance_runtime="$executing_runtime"
      fi
      rag_ready="$(tr -d '\r\n' < "$backup_dir/rag-ready.txt" 2>/dev/null || echo false)"
      [[ "$rag_ready" == true || "$rag_ready" == false ]] || {
        echo "Interrupted deploy backup has an invalid RAG readiness marker" >&2
        false
      }
      RAG_REQUIRED="$rag_ready" ENV_FILE="$previous_release/.env" \
        "$acceptance_runtime/recovery-acceptance.sh"
      complete_recovery
      echo "recover-interrupted-rollout: accepted already-restored $previous_release from $backup_dir"
      exit 0
    fi
  fi
  ENV_FILE="$previous_release/.env" \
    COMPOSE_FILE="$previous_release/docker-compose.prod.yml" \
    BACKUP_ROOT="$backup_root" \
    RESTORE_HEALTH_TIMER_ENABLED="$ROLLOUT_HEALTH_TIMER_ENABLED" \
    RESTORE_HEALTH_TIMER_ACTIVE="$ROLLOUT_HEALTH_TIMER_ACTIVE" \
    RESTORE_BACKUP_TIMER_ENABLED="$ROLLOUT_BACKUP_TIMER_ENABLED" \
    RESTORE_BACKUP_TIMER_ACTIVE="$ROLLOUT_BACKUP_TIMER_ACTIVE" \
    KEEP_TRAFFIC_CLOSED=true \
    "$SCRIPT_DIR/rollback-images.sh" --confirm "$backup_dir"
  complete_recovery
  echo "recover-interrupted-rollout: restored $previous_release from $backup_dir"
  exit 0
fi

ROLLOUT_SAFETY_BACKUP_DIR="$(marker_value ROLLOUT_SAFETY_BACKUP_DIR)"
[[ "$ROLLOUT_PHASE" =~ ^(pre-safety|pre-data|data-mutation|data-recovery|target-running|pending)$ ]] || {
  echo "Interrupted restore marker has an invalid phase" >&2
  false
}
target_backup_commit="$(tr -d '\r\n' < "$backup_dir/release-commit.txt")"
[[ "$target_backup_commit" == "$ROLLOUT_RELEASE_COMMIT" ]] || {
  echo "Interrupted restore target backup commit does not match" >&2
  false
}
if [[ "$ROLLOUT_RELEASE_DIR" != "unprepared" ]]; then
  target_release="$(canonical_path "$ROLLOUT_RELEASE_DIR")" || {
    echo "Interrupted restore target release path must not traverse symlinks" >&2
    false
  }
  [[ "$target_release" == /opt/resumesystem-restored-* ]] || {
    echo "Interrupted restore target release path is invalid" >&2
    false
  }
fi

if [[ "$ROLLOUT_PHASE" == "pre-safety" ]]; then
  [[ "$ROLLOUT_SAFETY_BACKUP_DIR" == "unavailable" ]] || {
    echo "Pre-safety restore marker unexpectedly names a safety backup" >&2
    false
  }
  "${COMPOSE[@]}" --env-file "$previous_release/.env" \
    -f "$previous_release/docker-compose.prod.yml" up -d --no-build
  rag_ready=false
  if [[ -f "$previous_release/deploy/release-manifest.env" ]]; then
    previous_version="$(awk -F= '$1 == "RELEASE_VERSION" {print $2}' \
      "$previous_release/deploy/release-manifest.env" | tail -1 | tr -d '\r')"
    if [[ "$previous_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ \
      && "$(printf '%s\n' "$previous_version" 1.3.4 | sort -V | tail -1)" == "$previous_version" ]]; then
      rag_ready=true
    fi
  fi
  RAG_REQUIRED="$rag_ready" ENV_FILE="$previous_release/.env" \
    "$SCRIPT_DIR/recovery-acceptance.sh"
  complete_recovery
  echo "recover-interrupted-rollout: original stack recovered before safety snapshot"
  exit 0
fi

safety_backup="$(canonical_path "$ROLLOUT_SAFETY_BACKUP_DIR")" || {
  echo "Safety backup path must not traverse symlinks" >&2
  false
}
verify_backup "$safety_backup" || {
  echo "Safety backup verification failed" >&2
  false
}
safety_commit="$(tr -d '\r\n' < "$safety_backup/release-commit.txt")"
previous_commit="$(awk -F= '$1 == "RELEASE_COMMIT" {print $2}' \
  "$previous_release/.env" | tail -1 | tr -d '\r')"
[[ "$safety_commit" =~ ^[0-9a-f]{40}$ && "$safety_commit" == "$previous_commit" ]] || {
  echo "Safety backup is not bound to the previous immutable release" >&2
  false
}
relink_previous_release

if [[ "$ROLLOUT_PHASE" == "pre-data" ]]; then
  ENV_FILE="$previous_release/.env" \
    COMPOSE_FILE="$previous_release/docker-compose.prod.yml" \
    BACKUP_ROOT="$backup_root" \
    RESTORE_HEALTH_TIMER_ENABLED="$ROLLOUT_HEALTH_TIMER_ENABLED" \
    RESTORE_HEALTH_TIMER_ACTIVE="$ROLLOUT_HEALTH_TIMER_ACTIVE" \
    RESTORE_BACKUP_TIMER_ENABLED="$ROLLOUT_BACKUP_TIMER_ENABLED" \
    RESTORE_BACKUP_TIMER_ACTIVE="$ROLLOUT_BACKUP_TIMER_ACTIVE" \
    KEEP_TRAFFIC_CLOSED=true \
    "$SCRIPT_DIR/rollback-images.sh" --confirm "$safety_backup"
  complete_recovery
  echo "recover-interrupted-rollout: restored pre-mutation runtime from $safety_backup"
  exit 0
fi

# The active MySQL/Qdrant/uploads/cache volumes may each be partially replaced.
# Re-run the hardened staging restore against the immutable safety backup. The
# restore engine rewrites the same durable marker to data-recovery before any
# additional mutation, so another SIGKILL remains retryable and fail-closed.
BACKUP_ROOT="$backup_root" ENV_FILE="$previous_release/.env" \
  COMPOSE_FILE="$previous_release/docker-compose.prod.yml" \
  RESUMESYSTEM_OPERATION_LOCK_HELD=true \
  "$SCRIPT_DIR/restore.sh" --confirm "$safety_backup" \
  --recover-interrupted "$MARKER"
[[ ! -e "$MARKER" && ! -e "$PENDING_FILE" ]] || {
  echo "Safety restore returned without clearing durable recovery markers" >&2
  false
}
trap - ERR HUP INT TERM
echo "recover-interrupted-rollout: restored mutated data from $safety_backup"
