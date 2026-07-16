#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "Usage: VERIFIED_BACKUP_DIR=/opt/resumesystem-backups/... $0 --confirm" >&2
  exit 2
fi

RELEASE_DIR="$(pwd -P)"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="$(readlink -f "${VERIFIED_BACKUP_DIR:-/missing}")"
BACKUP_ROOT="$(readlink -f "${BACKUP_ROOT:-/opt/resumesystem-backups}")"
[[ "$BACKUP_ROOT" == /opt/resumesystem-backups ]] || {
  echo "Hardened rollout requires BACKUP_ROOT=/opt/resumesystem-backups" >&2
  exit 1
}
# shellcheck disable=SC1091
source "$RELEASE_DIR/deploy/maintenance-firewall.sh"

[[ "$RELEASE_DIR" == /opt/resumesystem-* && "$RELEASE_DIR" != /opt/resumesystem-current ]] || {
  echo "Release must run from an immutable /opt/resumesystem-* directory" >&2
  exit 1
}
[[ -f "$ENV_FILE" && -f "$COMPOSE_FILE" ]] || {
  echo "Missing production env or compose file" >&2
  exit 1
}
[[ -f "$RELEASE_DIR/deploy/release-manifest.env" ]] || {
  echo "Missing immutable release manifest" >&2
  exit 1
}
[[ "$BACKUP_DIR" == "$BACKUP_ROOT"/* \
  && -f "$BACKUP_DIR/SHA256SUMS" \
  && -f "$BACKUP_DIR/image-map.tsv" \
  && -f "$BACKUP_DIR/docker-images.tar.gz" \
  && -f "$BACKUP_DIR/release-commit.txt" \
  && -f "$BACKUP_DIR/release-version.txt" \
  && -f "$BACKUP_DIR/backup-format-version.txt" \
  && -f "$BACKUP_DIR/rag-ready.txt" ]] || {
  echo "VERIFIED_BACKUP_DIR must contain a restorable image backup" >&2
  exit 1
}
(
  cd "$BACKUP_DIR"
  sha256sum -c SHA256SUMS
)

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

previous_release="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
[[ "$previous_release" == /opt/resumesystem-* && -d "$previous_release" ]] || {
  echo "The current immutable release symlink is missing" >&2
  exit 1
}
[[ ! -e /opt/resumesystem-release-pending.env ]] || {
  echo "A previous release is still pending finalization" >&2
  exit 1
}
[[ ! -e /opt/resumesystem-rollout-in-progress.env ]] || {
  echo "An interrupted rollout marker already exists; recover it before deploying" >&2
  exit 1
}
[[ ! -e /opt/resumesystem-rag-bootstrap-rollout.env ]] || {
  echo "An interrupted RAG bootstrap marker already exists; recover it before deploying" >&2
  exit 1
}

manifest_cr_status=0
LC_ALL=C grep -q $'\r' "$RELEASE_DIR/deploy/release-manifest.env" || manifest_cr_status=$?
case "$manifest_cr_status" in
  0)
    echo "Release manifest must use LF line endings and match the Git blob" >&2
    exit 1
    ;;
  1) ;;
  *)
    echo "Release manifest line endings could not be validated" >&2
    exit 1
    ;;
esac

set -a
# shellcheck disable=SC1090,SC1091
source "$ENV_FILE"
# shellcheck disable=SC1091
source "$RELEASE_DIR/deploy/release-manifest.env"
set +a

# A 2 GiB production host needs real swap and reclaimable headroom. Memory
# limits are not reservations, so check both immediately before the rollout and
# again after the two memory-heavy application services have initialized.
MIN_HOST_MEMORY_MB=1800
MIN_SWAP_TOTAL_MB=1536
MIN_RELEASE_FREE_DISK_MB=5120
assert_release_resources() {
  local stage="$1"
  local min_available_mb="$2"
  local min_swap_free_mb="$3"
  local min_effective_headroom_mb="$4"
  local host_memory_mb available_memory_mb swap_total_mb swap_free_mb
  local effective_headroom_mb free_disk_mb

  read -r host_memory_mb available_memory_mb swap_total_mb swap_free_mb < <(
    awk '
      /^MemTotal:/ { total = int($2 / 1024) }
      /^MemAvailable:/ { available = int($2 / 1024) }
      /^SwapTotal:/ { swap_total = int($2 / 1024) }
      /^SwapFree:/ { swap_free = int($2 / 1024) }
      END { print total + 0, available + 0, swap_total + 0, swap_free + 0 }
    ' /proc/meminfo
  )
  effective_headroom_mb=$((available_memory_mb + swap_free_mb))
  free_disk_mb="$(df -Pm / | awk 'NR == 2 { print $4 + 0 }')"

  if (( host_memory_mb < MIN_HOST_MEMORY_MB \
    || swap_total_mb < MIN_SWAP_TOTAL_MB \
    || available_memory_mb < min_available_mb \
    || swap_free_mb < min_swap_free_mb \
    || effective_headroom_mb < min_effective_headroom_mb \
    || free_disk_mb < MIN_RELEASE_FREE_DISK_MB )); then
    echo "Insufficient ${stage} resources: physical=${host_memory_mb}MB available=${available_memory_mb}MB swap=${swap_free_mb}/${swap_total_mb}MB effective=${effective_headroom_mb}MB disk=${free_disk_mb}MB; required physical>=${MIN_HOST_MEMORY_MB}MB available>=${min_available_mb}MB swap_total>=${MIN_SWAP_TOTAL_MB}MB swap_free>=${min_swap_free_mb}MB effective>=${min_effective_headroom_mb}MB disk>=${MIN_RELEASE_FREE_DISK_MB}MB" >&2
    return 1
  fi

  echo "Resource gate ${stage}: physical=${host_memory_mb}MB available=${available_memory_mb}MB swap=${swap_free_mb}/${swap_total_mb}MB effective=${effective_headroom_mb}MB disk=${free_disk_mb}MB"
}

[[ "${RELEASE_COMMIT:-}" =~ ^[0-9a-f]{40}$ ]] || {
  echo "RELEASE_COMMIT must be a full lowercase Git commit" >&2
  exit 1
}
[[ "${RELEASE_VERSION:-}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || {
  echo "Release manifest has an invalid version" >&2
  exit 1
}
release_tag="v${RELEASE_VERSION}-${RELEASE_COMMIT:0:12}"
ARTIFACT_MANIFEST="$(readlink -f "${RELEASE_ARTIFACT_MANIFEST:-/missing}")"
ARTIFACT_CHECKSUMS="$(readlink -f "${RELEASE_ARTIFACT_CHECKSUMS:-/missing}")"
[[ -f "$ARTIFACT_MANIFEST" && -f "$ARTIFACT_CHECKSUMS" \
  && "$(dirname "$ARTIFACT_MANIFEST")" == "$(dirname "$ARTIFACT_CHECKSUMS")" ]] || {
  echo "Release artifact manifest/checksums are missing or not colocated" >&2
  exit 1
}
(
  cd "$(dirname "$ARTIFACT_CHECKSUMS")"
  sha256sum -c "$(basename "$ARTIFACT_CHECKSUMS")"
)
compose_sha256="$(sha256sum "$COMPOSE_FILE" | awk '{print $1}')"
artifact_rows="$(python3 - "$ARTIFACT_MANIFEST" "$RELEASE_COMMIT" "$RELEASE_VERSION" "$compose_sha256" "$RELEASE_DIR" <<'PY'
import hashlib
import json
from pathlib import Path
import re
import sys

path, commit, version, compose_hash, release_dir = sys.argv[1:]
manifest_path = Path(path)
with manifest_path.open(encoding="utf-8") as handle:
    manifest = json.load(handle)
def sha256_file(candidate: Path) -> str:
    digest = hashlib.sha256()
    with candidate.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()
if manifest.get("releaseCommit") != commit:
    raise SystemExit("artifact commit mismatch")
if manifest.get("releaseVersion") != version:
    raise SystemExit("artifact version mismatch")
if manifest.get("composeSha256") != compose_hash:
    raise SystemExit("artifact compose hash mismatch")
source_name = manifest.get("sourceArchive")
source_hash = manifest.get("sourceSha256")
if not isinstance(source_name, str) or Path(source_name).name != source_name:
    raise SystemExit("artifact source archive name is invalid")
source_path = manifest_path.parent / source_name
if not source_path.is_file() or sha256_file(source_path) != source_hash:
    raise SystemExit("artifact source archive hash mismatch")
runtime_files = manifest.get("runtimeFiles")
if not isinstance(runtime_files, dict) or not runtime_files:
    raise SystemExit("artifact runtime file manifest is missing")
release_root = Path(release_dir).resolve()
for relative_name, expected_hash in runtime_files.items():
    candidate = (release_root / relative_name).resolve()
    if release_root not in candidate.parents or not candidate.is_file():
        raise SystemExit("artifact runtime file path is invalid")
    if sha256_file(candidate) != expected_hash:
        raise SystemExit(f"runtime file hash mismatch: {relative_name}")
expected = {
    "MYSQL_IMAGE", "BACKEND_IMAGE", "WEB_IMAGE", "ADMIN_IMAGE",
    "NGINX_IMAGE", "AGENT_IMAGE", "QDRANT_IMAGE",
}
seen = set()
for image in manifest.get("images") or []:
    variable = image.get("variable")
    reference = image.get("reference")
    image_id = image.get("imageId")
    if variable not in expected or variable in seen:
        raise SystemExit("artifact image set is invalid")
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", str(image_id)):
        raise SystemExit("artifact image id is invalid")
    kind = image.get("kind")
    if kind == "app":
        if image.get("revision") != commit or image.get("version") != version:
            raise SystemExit("artifact image provenance mismatch")
    elif kind != "vendor":
        raise SystemExit("artifact image kind is invalid")
    seen.add(variable)
    print(variable, reference, image_id, kind, sep="\t")
if seen != expected:
    raise SystemExit("artifact does not contain all release images")
PY
)"
declare -A artifact_image_ids=()
declare -A artifact_image_refs=()
declare -A artifact_image_kinds=()
while IFS=$'\t' read -r variable reference image_id image_kind; do
  [[ -n "$variable" ]] || continue
  artifact_image_refs[$variable]="$reference"
  artifact_image_ids[$variable]="$image_id"
  artifact_image_kinds[$variable]="$image_kind"
done <<< "$artifact_rows"

declare -A release_images=(
  [resume-mysql]="${MYSQL_IMAGE:-}"
  [resume-backend]="${BACKEND_IMAGE:-}"
  [resume-web]="${WEB_IMAGE:-}"
  [resume-admin]="${ADMIN_IMAGE:-}"
  [resume-proxy]="${NGINX_IMAGE:-}"
  [resume-agent]="${AGENT_IMAGE:-}"
  [resume-qdrant]="${QDRANT_IMAGE:-}"
)
declare -A release_variables=(
  [resume-mysql]=MYSQL_IMAGE
  [resume-backend]=BACKEND_IMAGE
  [resume-web]=WEB_IMAGE
  [resume-admin]=ADMIN_IMAGE
  [resume-proxy]=NGINX_IMAGE
  [resume-agent]=AGENT_IMAGE
  [resume-qdrant]=QDRANT_IMAGE
)
for container in resume-mysql resume-backend resume-web resume-admin resume-proxy resume-agent resume-qdrant; do
  image_reference="${release_images[$container]}"
  image_variable="${release_variables[$container]}"
  [[ "$image_reference" == "${artifact_image_refs[$image_variable]:-}" \
    && "$image_reference" == *":${release_tag}" ]] || {
    echo "$container is not pinned to ${release_tag}" >&2
    exit 1
  }
  if [[ "${artifact_image_kinds[$image_variable]}" == "app" ]]; then
    metadata="$(docker image inspect "$image_reference" --format '{{.Os}}|{{.Architecture}}|{{.Id}}|{{index .Config.Labels "org.opencontainers.image.revision"}}|{{index .Config.Labels "org.opencontainers.image.version"}}' 2>/dev/null || true)"
    expected_metadata="linux|amd64|${artifact_image_ids[$image_variable]}|${RELEASE_COMMIT}|${RELEASE_VERSION}"
  else
    metadata="$(docker image inspect "$image_reference" --format '{{.Os}}|{{.Architecture}}|{{.Id}}' 2>/dev/null || true)"
    expected_metadata="linux|amd64|${artifact_image_ids[$image_variable]}"
  fi
  [[ "$metadata" == "$expected_metadata" ]] || {
    echo "Missing loaded linux/amd64 image: $image_reference" >&2
    exit 1
  }
done

backup_commit="$(tr -d '\r\n' < "$BACKUP_DIR/release-commit.txt" 2>/dev/null || true)"
backup_release_version="$(tr -d '\r\n' < "$BACKUP_DIR/release-version.txt" 2>/dev/null || true)"
previous_commit="$(awk -F= '$1 == "RELEASE_COMMIT" {print $2}' "$previous_release/.env" 2>/dev/null | tail -1 | tr -d '\r')"
backup_format="$(tr -d '\r\n' < "$BACKUP_DIR/backup-format-version.txt")"
backup_rag_ready="$(tr -d '\r\n' < "$BACKUP_DIR/rag-ready.txt")"
[[ "$backup_format" == "2" \
  && "$backup_rag_ready" =~ ^(true|false)$ \
  && ( "$backup_release_version" == "legacy" \
    || "$backup_release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ) \
  && "$backup_commit" =~ ^[0-9a-f]{40}$ \
  && "$previous_commit" == "$backup_commit" ]] || {
  echo "Verified backup commit is not the currently linked release" >&2
  exit 1
}
if [[ "$backup_rag_ready" != "true" ]]; then
  [[ "${ALLOW_PRE_RAG_BACKUP:-false}" == "true" \
    && ( "$backup_release_version" == "legacy" \
      || ( "$backup_release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ \
        && "$(printf '%s\n' "$backup_release_version" 1.3.4 | sort -V | tail -1)" == "1.3.4" \
        && "$backup_release_version" != "1.3.4" ) ) ]] || {
    echo "A RAG-ready rollback backup is required for v1.3.4+ releases" >&2
    exit 1
  }
  echo "WARNING: one-time pre-RAG rollback baseline accepted for $backup_release_version" >&2
fi
for container in resume-mysql resume-backend resume-web resume-admin resume-proxy resume-agent resume-qdrant; do
  backup_image_id="$(awk -F '\t' -v name="$container" 'NR > 1 && $1 == name {print $3; exit}' "$BACKUP_DIR/image-map.tsv")"
  running_image_id="$(docker inspect "$container" --format '{{.Image}}' 2>/dev/null || true)"
  [[ "$backup_image_id" =~ ^sha256:[0-9a-f]{64}$ && "$backup_image_id" == "$running_image_id" ]] || {
    echo "Verified backup is not bound to the running pre-release image for $container" >&2
    exit 1
  }
done
for container in resume-mysql resume-qdrant; do
  image_variable="${release_variables[$container]}"
  running_image_id="$(docker inspect "$container" --format '{{.Image}}' 2>/dev/null || true)"
  [[ "$running_image_id" == "${artifact_image_ids[$image_variable]:-}" ]] || {
    echo "Application rollout refuses an implicit $container image upgrade; use a separate data-service migration" >&2
    exit 1
  }
done

if pgrep -af 'docker(-compose| compose)?.*(build|--build)|buildkitd|npm (ci|install)|pip(3)? install' \
  | grep -v 'deploy-loaded-release' >/dev/null; then
  echo "A build/install process is running; production rollout is no-build only" >&2
  exit 1
fi
assert_release_resources "pre-release" 768 1024 2048 || exit 1

rollback_required=true
rollout_marker=/opt/resumesystem-rollout-in-progress.env
rag_bootstrap_marker=/opt/resumesystem-rag-bootstrap-rollout.env
bootstrap_created=false
health_timer_was_enabled=disabled
health_timer_was_active=inactive
backup_timer_was_enabled=disabled
backup_timer_was_active=inactive
rollback_on_error() {
  local exit_code="${1:-1}"
  trap - ERR HUP INT TERM
  set +e
  if [[ "$rollback_required" == "true" ]]; then
    maintenance_enable >/dev/null 2>&1 || true
    "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
      stop reverse-proxy >/dev/null 2>&1 || true
    docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
    fixture_cleanup_failed=false
    if [[ "$bootstrap_created" == "true" || -f "$rag_bootstrap_marker" ]]; then
      RAG_BOOTSTRAP_MARKER="$rag_bootstrap_marker" \
        "$RELEASE_DIR/deploy/bootstrap-rag-fixture.sh" --cleanup-created \
        "$RELEASE_COMMIT" >/dev/null 2>&1 || {
        fixture_cleanup_failed=true
        echo "WARNING: release-created RAG fixture compensation failed" >&2
      }
    fi
    echo "Release failed; restoring verified pre-release images" >&2
    if [[ "$previous_release" == /opt/resumesystem-* && -d "$previous_release" ]]; then
      previous_link="/opt/.resumesystem-current-rollback-${RELEASE_COMMIT:0:12}"
      rm -f -- "$previous_link"
      ln -s "$previous_release" "$previous_link"
      mv -Tf "$previous_link" /opt/resumesystem-current
    fi
    ENV_FILE="$previous_release/.env" \
      COMPOSE_FILE="$previous_release/docker-compose.prod.yml" \
      BACKUP_ROOT="$BACKUP_ROOT" \
      RESTORE_HEALTH_TIMER_ENABLED="$health_timer_was_enabled" \
      RESTORE_HEALTH_TIMER_ACTIVE="$health_timer_was_active" \
      RESTORE_BACKUP_TIMER_ENABLED="$backup_timer_was_enabled" \
      RESTORE_BACKUP_TIMER_ACTIVE="$backup_timer_was_active" \
      KEEP_TRAFFIC_CLOSED=true \
      "$RELEASE_DIR/deploy/rollback-images.sh" --confirm "$BACKUP_DIR"
    rollback_status="$?"
    if [[ "$rollback_status" -ne 0 || "$fixture_cleanup_failed" == "true" ]]; then
      maintenance_enable >/dev/null 2>&1 || true
      docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
      echo "Automatic rollback or RAG compensation was incomplete; public traffic remains stopped" >&2
    else
      if maintenance_disable >/dev/null 2>&1; then
        marker_commit_failed=false
        # Pending is advisory; the complete rollout marker is the recovery
        # record and must be unlinked last. Because this handler deliberately
        # runs with traps disabled, check the pre-commit steps explicitly.
        rm -f -- /opt/resumesystem-release-pending.env \
          || marker_commit_failed=true
        if [[ "$marker_commit_failed" != "true" ]]; then
          sync -f /opt || marker_commit_failed=true
        fi
        if [[ "$marker_commit_failed" != "true" ]]; then
          if rm -f -- "$rollout_marker"; then
            # The verified rollback is already the terminal state. A directory
            # fsync failure may resurrect the rollout marker after a crash, in
            # which case the boot guard safely closes traffic and recovery can
            # be retried; do not manufacture a pending-only marker here.
            sync -f /opt || echo "WARNING: rollback marker deletion could not be fsynced" >&2
          else
            marker_commit_failed=true
          fi
        fi
        if [[ "$marker_commit_failed" == "true" ]]; then
          maintenance_enable >/dev/null 2>&1 || true
          docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
          echo "Automatic rollback passed but durable marker cleanup is incomplete; public traffic remains stopped" >&2
        fi
      else
        maintenance_enable >/dev/null 2>&1 || true
        docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
        echo "Automatic rollback passed but public traffic could not be safely reopened" >&2
      fi
    fi
  fi
  exit "$exit_code"
}
fail_release() {
  echo "$1" >&2
  rollback_on_error 1
}
trap 'rollback_on_error $?' ERR
trap 'rollback_on_error 129' HUP
trap 'rollback_on_error 130' INT
trap 'rollback_on_error 143' TERM

health_timer_was_enabled="$(systemctl is-enabled resumesystem-health.timer 2>/dev/null || true)"
health_timer_was_active="$(systemctl is-active resumesystem-health.timer 2>/dev/null || true)"
backup_timer_was_enabled="$(systemctl is-enabled resumesystem-backup.timer 2>/dev/null || true)"
backup_timer_was_active="$(systemctl is-active resumesystem-backup.timer 2>/dev/null || true)"

# Persist the unsafe rollout state before changing containers. The boot guard
# is installed and enabled first, so a host reboot keeps 80/443 closed even if
# Docker restarts an unverified proxy before this process can resume.
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
rollout_started_epoch="$(date +%s)"
persist_deploy_rollout_marker() {
  local state="$1"
  local phase="$2"
  local rollout_temp
  umask 077
  rollout_temp="$(mktemp /opt/.resumesystem-rollout-in-progress.deploy.XXXXXX)"
  printf 'ROLLOUT_STATE=%s\nROLLOUT_OPERATION=deploy\nROLLOUT_PHASE=%s\nROLLOUT_RELEASE_COMMIT=%s\nROLLOUT_RELEASE_DIR=%s\nROLLOUT_PREVIOUS_RELEASE=%s\nROLLOUT_BACKUP_DIR=%s\nROLLOUT_BACKUP_ROOT=%s\nROLLOUT_RECOVERY_RUNTIME_DIR=%s\nROLLOUT_HEALTH_TIMER_ENABLED=%s\nROLLOUT_HEALTH_TIMER_ACTIVE=%s\nROLLOUT_BACKUP_TIMER_ENABLED=%s\nROLLOUT_BACKUP_TIMER_ACTIVE=%s\nROLLOUT_STARTED_EPOCH=%s\n' \
    "$state" "$phase" "$RELEASE_COMMIT" "$RELEASE_DIR" "$previous_release" \
    "$BACKUP_DIR" "$BACKUP_ROOT" "$RELEASE_DIR/deploy" "$health_timer_was_enabled" \
    "$health_timer_was_active" "$backup_timer_was_enabled" \
    "$backup_timer_was_active" "$rollout_started_epoch" > "$rollout_temp"
  sync -f "$rollout_temp"
  mv -Tf "$rollout_temp" "$rollout_marker"
  sync -f /opt
}
persist_deploy_rollout_marker in-progress deploying
"$RELEASE_DIR/deploy/rollout-guard.sh" --stop-proxy

systemctl disable --now resumesystem-health.timer resumesystem-backup.timer >/dev/null
systemctl stop resumesystem-health.service resumesystem-backup.service 2>/dev/null || true
if systemctl is-enabled --quiet resumesystem-health.timer \
  || systemctl is-enabled --quiet resumesystem-backup.timer; then
  fail_release "Observation timers could not be persistently disabled"
fi
maintenance_enable

# Freeze writes and free memory before replacing the complete tested image set.
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  stop reverse-proxy web admin backend agent qdrant
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate mysql
mysql_healthy=false
for _ in {1..120}; do
  health="$(docker inspect resume-mysql --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)"
  if [[ "$health" == "healthy" ]]; then mysql_healthy=true; break; fi
  sleep 2
done
[[ "$mysql_healthy" == "true" ]] || fail_release "New MySQL image did not become healthy"

"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate qdrant
qdrant_running=false
for _ in {1..30}; do
  status="$(docker inspect resume-qdrant --format '{{.State.Status}}' 2>/dev/null || true)"
  if [[ "$status" == "running" ]]; then qdrant_running=true; break; fi
  sleep 2
done
[[ "$qdrant_running" == "true" ]] || fail_release "New Qdrant image did not start"

# In-place application replacement only: never run two Agent/backend instances.
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate agent
agent_healthy=false
for _ in {1..150}; do
  health="$(docker inspect resume-agent --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)"
  if [[ "$health" == "healthy" ]]; then agent_healthy=true; break; fi
  sleep 2
done
[[ "$agent_healthy" == "true" ]] || fail_release "New Agent did not become healthy"
assert_release_resources "post-Agent" 384 768 1536 \
  || fail_release "Insufficient resources after Agent initialization"

"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate backend
backend_healthy=false
for _ in {1..90}; do
  health="$(docker inspect resume-backend --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)"
  if [[ "$health" == "healthy" ]]; then backend_healthy=true; break; fi
  sleep 2
done
[[ "$backend_healthy" == "true" ]] || fail_release "New backend did not become healthy"
assert_release_resources "post-backend" 256 512 1024 \
  || fail_release "Insufficient resources after backend initialization"

if ! bootstrap_result="$(RAG_BOOTSTRAP_MARKER="$rag_bootstrap_marker" \
  "$RELEASE_DIR/deploy/bootstrap-rag-fixture.sh" --confirm "$RELEASE_COMMIT")"; then
  [[ -f "$rag_bootstrap_marker" ]] && bootstrap_created=true
  fail_release "Canonical RAG fixture bootstrap failed"
fi
bootstrap_result="$(printf '%s\n' "$bootstrap_result" | tail -1)"
if [[ "$bootstrap_result" =~ ^CREATED\|([1-9][0-9]*)\|([1-9][0-9]*)\|knowledge/global/bootstrap/${RELEASE_COMMIT}/resume-writing-standard-v1[.]md$ ]]; then
  bootstrap_created=true
elif [[ ! "$bootstrap_result" =~ ^EXISTING\|[1-9][0-9]*\|[1-9][0-9]*\|knowledge/global/bootstrap/[0-9a-f]{40}/resume-writing-standard-v1[.]md$ ]]; then
  fail_release "Canonical RAG fixture bootstrap returned an invalid result"
fi

"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate web admin
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-build --no-deps --force-recreate reverse-proxy

REQUIRE_LIVE_LLM_PROBE=true ENV_FILE="$ENV_FILE" \
  "$RELEASE_DIR/deploy/health-check.sh"

temporary_link="/opt/.resumesystem-current-${RELEASE_COMMIT:0:12}"
rm -f -- "$temporary_link"
ln -s "$RELEASE_DIR" "$temporary_link"
mv -Tf "$temporary_link" /opt/resumesystem-current
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-health.service" \
  /etc/systemd/system/resumesystem-health.service
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-health.timer" \
  /etc/systemd/system/resumesystem-health.timer
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-backup.service" \
  /etc/systemd/system/resumesystem-backup.service
install -m 0644 "$RELEASE_DIR/deploy/systemd/resumesystem-backup.timer" \
  /etc/systemd/system/resumesystem-backup.timer
systemctl daemon-reload
[[ "$(systemctl show resumesystem-health.service -p TimeoutStartUSec --value)" == "4min 30s" \
  || "$(systemctl show resumesystem-health.service -p TimeoutStartUSec --value)" == "270000000" ]] || {
  fail_release "Installed health service does not have TimeoutStartSec=270"
}

umask 077
pending_temp="$(mktemp /opt/.resumesystem-release-pending.deploy.XXXXXX)"
printf 'PENDING_RELEASE_COMMIT=%s\nPENDING_DEPLOYED_EPOCH=%s\n' \
  "$RELEASE_COMMIT" "$(date +%s)" > "$pending_temp"
sync -f "$pending_temp"
mv -Tf "$pending_temp" /opt/resumesystem-release-pending.env
sync -f /opt
persist_deploy_rollout_marker pending pending

maintenance_disable || fail_release "Could not reopen verified public traffic"

# Keep a release-created fixture marker throughout the pending observation
# window. Finalization commits it; an interrupted rollout can still compensate
# it deterministically before restoring the previous image set.
if [[ "$bootstrap_created" == "true" ]]; then
  [[ -f "$rag_bootstrap_marker" ]] \
    || fail_release "Release-created RAG fixture marker disappeared"
fi

# Timers stay stopped during the external E2E and observation window. Enable
# them only after public browser, live LLM and 15-minute stability gates pass.
rollback_required=false
trap - ERR HUP INT TERM
echo "deploy-loaded-release: passed (${RELEASE_COMMIT}); timers remain stopped for observation"
