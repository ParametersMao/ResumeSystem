#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/resumesystem-backups}"
canonical_backup_root="$(readlink -f "$BACKUP_ROOT" 2>/dev/null || true)"
if [[ "$canonical_backup_root" != /opt/resumesystem-backups ]]; then
  echo "Hardened backups require BACKUP_ROOT=/opt/resumesystem-backups" >&2
  exit 1
fi
BACKUP_ROOT="$canonical_backup_root"
INCLUDE_IMAGES="${INCLUDE_IMAGES:-true}"
RETENTION_COUNT="${RETENTION_COUNT:-7}"
BACKUP_HELPER_IMAGE="${BACKUP_HELPER_IMAGE:-alpine:3.20}"
KEEP_PROXY_STOPPED="${KEEP_PROXY_STOPPED:-false}"
REQUESTED_RELEASE_COMMIT="${RELEASE_COMMIT:-}"
REQUESTED_ALLOW_PRE_RAG_BACKUP="${ALLOW_PRE_RAG_BACKUP:-false}"
SOURCE_DIR="$(readlink -f "${SOURCE_DIR:-$(pwd -P)}")"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
BACKUP_FREEZE_MARKER=/opt/resumesystem-backup-freeze.env
STAMP="$(date +%Y%m%d-%H%M%S)"
FINAL_DIR="${BACKUP_ROOT%/}/v1.3-${STAMP}"
TEMP_DIR="${FINAL_DIR}.partial"

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

if [[ ! -f "$ENV_FILE" || ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing production env or compose file" >&2
  exit 1
fi
ENV_FILE="$(readlink -f "$ENV_FILE")"
COMPOSE_FILE="$(readlink -f "$COMPOSE_FILE")"
[[ "$KEEP_PROXY_STOPPED" == "true" || "$KEEP_PROXY_STOPPED" == "false" ]] || {
  echo "KEEP_PROXY_STOPPED must be true or false" >&2
  exit 1
}
if [[ ( -e /opt/resumesystem-rollout-in-progress.env \
    || -e /opt/resumesystem-release-pending.env ) \
  && "$KEEP_PROXY_STOPPED" != "true" ]]; then
  echo "An incomplete rollout backup must use KEEP_PROXY_STOPPED=true" >&2
  exit 1
fi
[[ "$INCLUDE_IMAGES" == "true" ]] || {
  echo "Production backups must include every restorable image" >&2
  exit 1
}
current_release="$(readlink -f /opt/resumesystem-current 2>/dev/null || true)"
[[ "$SOURCE_DIR" == "$current_release" \
  && -f "$SOURCE_DIR/.env" \
  && -f "$SOURCE_DIR/docker-compose.prod.yml" ]] || {
  echo "SOURCE_DIR must be the currently linked immutable release" >&2
  exit 1
}
[[ "$ENV_FILE" == "$SOURCE_DIR/.env" \
  && "$COMPOSE_FILE" == "$SOURCE_DIR/docker-compose.prod.yml" ]] || {
  echo "Backup env and Compose files must belong to the current immutable release" >&2
  exit 1
}
[[ ! -e "$BACKUP_FREEZE_MARKER" ]] || {
  echo "An interrupted backup freeze requires recovery before another backup" >&2
  exit 1
}
[[ "$REQUESTED_ALLOW_PRE_RAG_BACKUP" == "true" \
  || "$REQUESTED_ALLOW_PRE_RAG_BACKUP" == "false" ]] || {
  echo "ALLOW_PRE_RAG_BACKUP must be true or false" >&2
  exit 1
}
if [[ ! -f "$SOURCE_DIR/deploy/release-manifest.env" \
  && "$REQUESTED_ALLOW_PRE_RAG_BACKUP" != "true" ]]; then
  echo "Legacy source without a release manifest requires explicit ALLOW_PRE_RAG_BACKUP=true" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-resumesystem}"
# A caller-supplied immutable SHA is authoritative. Production .env files can
# carry a stale RELEASE_COMMIT from an older rollout and must not overwrite it.
RELEASE_COMMIT="${REQUESTED_RELEASE_COMMIT:-${RELEASE_COMMIT:-unknown}}"
[[ "$RELEASE_COMMIT" =~ ^[0-9a-f]{40}$ ]] || {
  echo "RELEASE_COMMIT must be the full lowercase Git commit for a restorable backup" >&2
  exit 1
}
source_release_commit="$(awk -F= '$1 == "RELEASE_COMMIT" {print $2}' "$SOURCE_DIR/.env" | tail -1 | tr -d '\r')"
[[ "$source_release_commit" == "$RELEASE_COMMIT" ]] || {
  echo "SOURCE_DIR .env commit does not match the backup release commit" >&2
  exit 1
}
source_release_version=legacy
if [[ -f "$SOURCE_DIR/deploy/release-manifest.env" ]]; then
  source_release_version="$(awk -F= '$1 == "RELEASE_VERSION" {print $2}' \
    "$SOURCE_DIR/deploy/release-manifest.env" | tail -1 | tr -d '\r')"
  [[ "$source_release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || {
    echo "SOURCE_DIR release manifest has an invalid version" >&2
    exit 1
  }
fi
recovery_rag_required=false
if [[ "$source_release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ \
  && "$(printf '%s\n' "$source_release_version" 1.3.4 | sort -V | tail -1)" == "$source_release_version" ]]; then
  recovery_rag_required=true
fi

# shellcheck disable=SC1091
source "$SCRIPT_DIR/maintenance-firewall.sh"

BACKUP_CONTAINERS=(
  resume-web
  resume-admin
  resume-backend
  resume-agent
  resume-qdrant
  resume-proxy
  resume-mysql
)
for name in "${BACKUP_CONTAINERS[@]}"; do
  docker inspect "$name" >/dev/null
  configured_image="$(docker inspect "$name" --format '{{.Config.Image}}')"
  running_image="$(docker inspect "$name" --format '{{.Image}}')"
  resolved_image="$(docker image inspect "$configured_image" --format '{{.Id}}' 2>/dev/null || true)"
  if [[ -z "$resolved_image" || "$resolved_image" != "$running_image" ]]; then
    echo "Configured image $configured_image does not resolve to the running image for $name" >&2
    echo "Retag the verified running image before taking a restorable backup" >&2
    exit 1
  fi
done
docker image inspect "$BACKUP_HELPER_IMAGE" >/dev/null 2>&1 || {
  echo "Backup helper image is not available locally: $BACKUP_HELPER_IMAGE" >&2
  echo "Preload it before backup; backup must not pull or build after services are frozen" >&2
  exit 1
}

artifact_manifest="$(readlink -f "${RELEASE_ARTIFACT_MANIFEST:-/missing}" 2>/dev/null || true)"
artifact_checksums="$(readlink -f "${RELEASE_ARTIFACT_CHECKSUMS:-/missing}" 2>/dev/null || true)"
if [[ "$recovery_rag_required" == "true" ]]; then
  [[ -f "$artifact_manifest" && -f "$artifact_checksums" ]] || {
    echo "Hardened backups require the original release artifact manifest and checksums" >&2
    exit 1
  }
  manifest_name="$(basename "$artifact_manifest")"
  mapfile -t manifest_hashes < <(
    awk -v wanted="$manifest_name" '
      { file=$2; sub(/^\*/, "", file); if (file == wanted) print $1 }
    ' "$artifact_checksums"
  )
  [[ "${#manifest_hashes[@]}" -eq 1 \
    && "${manifest_hashes[0]}" =~ ^[0-9a-f]{64}$ \
    && "$(sha256sum "$artifact_manifest" | awk '{print $1}')" == "${manifest_hashes[0]}" ]] || {
    echo "Original release artifact manifest checksum verification failed" >&2
    exit 1
  }
  "$SCRIPT_DIR/verify-runtime-manifest.sh" \
    --directory "$SOURCE_DIR" "$artifact_manifest"
fi

rm -rf -- "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
chmod 700 "$TEMP_DIR"
stack_stopped=false
persist_backup_marker() {
  local marker_temp
  umask 077
  marker_temp="$(mktemp /opt/.resumesystem-backup-freeze.XXXXXX)"
  printf '%s\n' \
    "BACKUP_RELEASE_COMMIT=$RELEASE_COMMIT" \
    "BACKUP_RELEASE_DIR=$SOURCE_DIR" \
    "BACKUP_RECOVERY_RUNTIME_DIR=$SCRIPT_DIR" \
    "BACKUP_KEEP_PROXY_STOPPED=$KEEP_PROXY_STOPPED" \
    "BACKUP_RAG_REQUIRED=$recovery_rag_required" \
    "BACKUP_STARTED_EPOCH=$(date +%s)" > "$marker_temp"
  chmod 600 "$marker_temp"
  sync -f "$marker_temp"
  mv -Tf "$marker_temp" "$BACKUP_FREEZE_MARKER"
  sync -f /opt
}
clear_backup_marker() {
  rm -f -- "$BACKUP_FREEZE_MARKER" || return 1
  if ! sync -f /opt; then
    [[ ! -e "$BACKUP_FREEZE_MARKER" ]] && return 0
    return 1
  fi
}
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
recover_frozen_stack() {
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    up -d --no-build --no-deps qdrant || return 1
  wait_container_health resume-qdrant 30 || return 1
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    up -d --no-build --no-deps agent || return 1
  wait_container_health resume-agent 180 || return 1
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    up -d --no-build --no-deps backend || return 1
  wait_container_health resume-backend 120 || return 1
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    up -d --no-build --no-deps web admin || return 1
  wait_container_health resume-web 30 || return 1
  wait_container_health resume-admin 30 || return 1
  if [[ "$KEEP_PROXY_STOPPED" == "true" ]]; then
    close_public_traffic
    return 0
  fi
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    up -d --no-build --no-deps --force-recreate reverse-proxy || return 1
  wait_container_health resume-proxy 30 || return 1
  RAG_REQUIRED="$recovery_rag_required" ENV_FILE="$ENV_FILE" \
    "$SCRIPT_DIR/recovery-acceptance.sh" || return 1
  maintenance_disable
}
cleanup_on_error() {
  local exit_code="${1:-1}"
  trap - ERR HUP INT TERM
  set +e
  if [[ "$stack_stopped" == "true" || -e "$BACKUP_FREEZE_MARKER" ]]; then
    recover_frozen_stack
    recovery_status=$?
    if [[ "$recovery_status" -eq 0 ]]; then
      clear_backup_marker || recovery_status=1
    fi
    if [[ "$recovery_status" -ne 0 ]]; then
      close_public_traffic
      echo "Backup recovery could not restore the full healthy stack; public traffic remains stopped" >&2
    fi
  fi
  rm -rf -- "$TEMP_DIR"
  exit "$exit_code"
}
fail_backup() {
  echo "$1" >&2
  cleanup_on_error 1
}
trap 'cleanup_on_error $?' ERR
trap 'cleanup_on_error 129' HUP
trap 'cleanup_on_error 130' INT
trap 'cleanup_on_error 143' TERM

archive_volume() {
  local volume="$1"
  local output="$2"
  docker run --rm \
    -v "${volume}:/data:ro" \
    -v "${TEMP_DIR}:/backup" \
    "$BACKUP_HELPER_IMAGE" sh -c "tar -czf '/backup/${output}' -C /data ."
}

# Freeze public writes before capturing MySQL, Qdrant and uploads. A backup that
# observes these stores at different logical times is not a reliable RAG restore.
persist_backup_marker
stack_stopped=true
maintenance_enable
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop reverse-proxy
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop backend agent qdrant

docker exec resume-mysql sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump --single-transaction --routines --triggers -uroot "$MYSQL_DATABASE"' \
  > "$TEMP_DIR/mysql.sql"
archive_volume "${PROJECT_NAME}_qdrant_data" qdrant-storage.tar.gz
archive_volume "${PROJECT_NAME}_backend_uploads" uploads.tar.gz
archive_volume "${PROJECT_NAME}_fastembed_models" fastembed-models.tar.gz

recover_frozen_stack \
  || fail_backup "Application services did not recover after the backup freeze"
clear_backup_marker \
  || fail_backup "Durable backup freeze marker could not be committed"
stack_stopped=false

tar -czf "$TEMP_DIR/source-with-env.tar.gz" \
  --exclude='./backups' --exclude='./node_modules' --exclude='./*/node_modules' \
  -C "$SOURCE_DIR" .
if [[ -f "$artifact_manifest" ]]; then
  mkdir -p "$TEMP_DIR/release-artifact"
  cp "$artifact_manifest" "$TEMP_DIR/release-artifact/manifest.json"
  (
    cd "$TEMP_DIR/release-artifact"
    sha256sum manifest.json > SHA256SUMS
  )
fi
docker ps --format '{{json .}}' > "$TEMP_DIR/containers.jsonl"
{
  printf 'container\tconfigured_image\trunning_image\n'
  for name in "${BACKUP_CONTAINERS[@]}"; do
    printf '%s\t%s\t%s\n' \
      "$name" \
      "$(docker inspect "$name" --format '{{.Config.Image}}')" \
      "$(docker inspect "$name" --format '{{.Image}}')"
  done
} > "$TEMP_DIR/image-map.tsv"
mapfile -t BACKUP_IMAGES < <(
  for name in "${BACKUP_CONTAINERS[@]}"; do
    docker inspect "$name" --format '{{.Config.Image}}'
  done | sort -u
)
BACKUP_IMAGES+=("$BACKUP_HELPER_IMAGE")
docker image inspect "${BACKUP_IMAGES[@]}" > "$TEMP_DIR/images.json"

docker save "${BACKUP_IMAGES[@]}" | gzip -1 > "$TEMP_DIR/docker-images.tar.gz"

printf '%s\n' "${RELEASE_COMMIT:-unknown}" > "$TEMP_DIR/release-commit.txt"
printf '%s\n' "$source_release_version" > "$TEMP_DIR/release-version.txt"
printf '2\n' > "$TEMP_DIR/backup-format-version.txt"
rag_ready="$(docker exec resume-agent python -c \
  "import json,urllib.request; j=json.load(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)); r=j.get('rag') or {}; print('true' if j.get('status')=='ok' and r.get('enabled') is True and r.get('collection_ready') is True and r.get('embedding_backend')=='fastembed' else 'false')" \
  2>/dev/null || echo false)"
[[ "$rag_ready" == "true" ]] || rag_ready=false
printf '%s\n' "$rag_ready" > "$TEMP_DIR/rag-ready.txt"
(
  cd "$TEMP_DIR"
  sums_file="$(mktemp)"
  find . -type f ! -path './SHA256SUMS' -printf '%P\n' \
    | sort | xargs sha256sum > "$sums_file"
  mv "$sums_file" SHA256SUMS
  sha256sum -c SHA256SUMS
)

chmod -R go-rwx "$TEMP_DIR"
mv "$TEMP_DIR" "$FINAL_DIR"
trap - ERR HUP INT TERM

if [[ "$RETENTION_COUNT" =~ ^[1-9][0-9]*$ ]]; then
  mapfile -t old_backups < <(
    find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -name 'v1.3-*' -printf '%f\n' \
      | sort -r | tail -n "+$((RETENTION_COUNT + 1))"
  )
  for name in "${old_backups[@]}"; do
    target="$BACKUP_ROOT/$name"
    [[ "$target" == "$BACKUP_ROOT"/v1.3-* ]] || continue
    rm -rf -- "$target"
  done
fi
echo "backup: passed ($FINAL_DIR)"
